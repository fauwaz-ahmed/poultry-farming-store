"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import {
  validateCheckoutData,
  type CheckoutData,
} from "@/lib/checkout-validation";

const CART_COOKIE = "poultry_cart";

function createOrderNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);

  return `ORD-${timestamp}-${random}`;
}

type CartItemData = {
  product: unknown;
  quantity: number;
};

type ProductData = {
  _id: unknown;
  name: string;
  sku: string;
  price: number;
  unit: string;
  stock: number;
  images?: string[];
};

type OrderItemData = {
  product: unknown;
  name: string;
  sku?: string;
  quantity: number;
  unitPrice?: number;
  unit?: string;
  subtotal?: number;
  image?: string;
};

type CancelOrderData = {
  _id: unknown;
  orderNumber: string;
  orderStatus: string;
  paymentStatus?: string;
  customer?: unknown;
  items: OrderItemData[];
};

export async function createCodOrder(checkoutData: CheckoutData) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false as const,
        message:
          "Please log in to your customer account before placing an order.",
      };
    }

    if (user.role !== "customer") {
      return {
        success: false as const,
        message: "Only customer accounts can place orders.",
      };
    }

    const validation = validateCheckoutData(checkoutData);

    if (!validation.success) {
      return {
        success: false as const,
        message: validation.message,
      };
    }

    const validatedData = validation.data;

    if (!validatedData) {
      return {
        success: false as const,
        message: "Invalid checkout data.",
      };
    }

    await connectDB();

    const cookieStore = await cookies();
    const sessionId = cookieStore.get(CART_COOKIE)?.value;

    if (!sessionId) {
      return {
        success: false as const,
        message: "Your cart session was not found.",
      };
    }

    const cartResult = await Cart.findOne({
      sessionId,
      user: user.id,
    }).lean();

    if (!cartResult) {
      return {
        success: false as const,
        message: "Your cart is empty.",
      };
    }

    const cart = cartResult as unknown as {
      items: CartItemData[];
    };

    if (!cart.items || cart.items.length === 0) {
      return {
        success: false as const,
        message: "Your cart is empty.",
      };
    }

    const productIds = cart.items.map((item) => item.product);

    const productsResult = await Product.find({
      _id: {
        $in: productIds,
      },
    }).lean();

    const products = productsResult as unknown as ProductData[];

    const productMap = new Map(
      products.map((product) => [String(product._id), product]),
    );

    const orderItems: Array<{
      product: unknown;
      name: string;
      sku: string;
      quantity: number;
      unitPrice: number;
      unit: string;
      subtotal: number;
      image: string;
    }> = [];

    for (const cartItem of cart.items) {
      const product = productMap.get(String(cartItem.product));

      if (!product) {
        return {
          success: false as const,
          message:
            "One of the products in your cart is no longer available.",
        };
      }

      const quantity = Number(cartItem.quantity);
      const stock = Number(product.stock);
      const price = Number(product.price);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return {
          success: false as const,
          message: `Invalid quantity for ${product.name}.`,
        };
      }

      if (quantity > stock) {
        return {
          success: false as const,
          message: `${product.name} does not have enough stock available.`,
        };
      }

      const itemSubtotal = price * quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity,
        unitPrice: price,
        unit: product.unit,
        subtotal: itemSubtotal,
        image: product.images?.[0] || "",
      });
    }

    const subtotal = orderItems.reduce(
      (total, item) => total + item.subtotal,
      0,
    );

    const deliveryFee = subtotal >= 1000 ? 0 : 100;
    const discount = 0;
    const grandTotal = subtotal + deliveryFee - discount;

    const mongoose = await import("mongoose").then(
      ({ default: mongoose }) => mongoose,
    );

    const session = await mongoose.startSession();

    try {
      const createdOrder = await session.withTransaction(async () => {
        for (const item of orderItems) {
          const updatedProduct = await Product.findOneAndUpdate(
            {
              _id: item.product,
              stock: {
                $gte: item.quantity,
              },
            },
            {
              $inc: {
                stock: -item.quantity,
              },
            },
            {
              new: true,
              session,
            },
          );

          if (!updatedProduct) {
            throw new Error(
              `${item.name} is no longer available in the requested quantity.`,
            );
          }
        }

        const orderNumber = createOrderNumber();

        const orders = await Order.create(
          [
            {
              orderNumber,
              customer: user.id,
              customerName: validatedData.fullName,
              phone: validatedData.phone,
              email: validatedData.email || "",
              items: orderItems,
              shippingAddress: {
                fullName: validatedData.fullName,
                phone: validatedData.phone,
                email: validatedData.email || "",
                address: validatedData.address,
                city: validatedData.city,
                state: validatedData.state,
                pincode: validatedData.pincode,
                instructions: validatedData.instructions || "",
              },
              subtotal,
              deliveryFee,
              discount,
              grandTotal,
              paymentMethod: "cod",
              paymentStatus: "Pending",
              paymentTransactionId: "",
              orderStatus: "Pending",
            },
          ],
          {
            session,
          },
        );

        const created = orders[0];

        await Cart.deleteOne(
          {
            sessionId,
            user: user.id,
          },
          {
            session,
          },
        );

        return {
          _id: created._id,
          orderNumber: String(created.orderNumber),
          grandTotal: Number(created.grandTotal),
        };
      });

      revalidatePath("/cart");
      revalidatePath("/checkout");
      revalidatePath("/account/orders");

      return {
        success: true as const,
        message: "Order placed successfully.",
        orderId: String(createdOrder._id),
        orderNumber: String(createdOrder.orderNumber),
        grandTotal: Number(createdOrder.grandTotal),
      };
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error("CREATE COD ORDER ERROR:", error);

    return {
      success: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while placing the order.",
    };
  }
}

export async function cancelCustomerOrder(orderNumber: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false as const,
        message: "Please log in to cancel your order.",
      };
    }

    if (user.role !== "customer") {
      return {
        success: false as const,
        message: "Only customer accounts can cancel orders.",
      };
    }

    const cleanOrderNumber = orderNumber?.trim();

    if (!cleanOrderNumber) {
      return {
        success: false as const,
        message: "Order number is required.",
      };
    }

    await connectDB();

    const mongoose = await import("mongoose").then(
      ({ default: mongoose }) => mongoose,
    );

    const session = await mongoose.startSession();

    try {
      const cancelledOrder = await session.withTransaction(async () => {
        const orderResult = await Order.findOneAndUpdate(
          {
            customer: user.id,
            orderNumber: cleanOrderNumber,
            orderStatus: "Pending",
          },
          {
            $set: {
              orderStatus: "Cancelled",
            },
          },
          {
            new: true,
            session,
          },
        ).lean();

        const order = orderResult
          ? (orderResult as unknown as CancelOrderData)
          : null;

        if (!order) {
          const existingOrderResult = await Order.findOne({
            customer: user.id,
            orderNumber: cleanOrderNumber,
          }).lean();

          if (!existingOrderResult) {
            throw new Error("Order not found.");
          }

          const existingOrder =
            existingOrderResult as unknown as CancelOrderData;

          if (existingOrder.orderStatus === "Cancelled") {
            throw new Error("This order has already been cancelled.");
          }

          throw new Error("This order can no longer be cancelled.");
        }

        for (const item of order.items) {
          const updatedProduct = await Product.findByIdAndUpdate(
            item.product,
            {
              $inc: {
                stock: Number(item.quantity),
              },
            },
            {
              new: true,
              session,
            },
          );

          if (!updatedProduct) {
            throw new Error(
              `Unable to restore stock for ${item.name}.`,
            );
          }
        }

        return {
          orderNumber: String(order.orderNumber),
          orderStatus: String(order.orderStatus),
        };
      });

      revalidatePath("/account/orders");
      revalidatePath(`/account/orders/${cleanOrderNumber}`);
      revalidatePath("/admin/orders");

      return {
        success: true as const,
        message: "Your order has been cancelled successfully.",
        orderNumber: cancelledOrder.orderNumber,
        orderStatus: cancelledOrder.orderStatus,
      };
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error("CANCEL CUSTOMER ORDER ERROR:", error);

    return {
      success: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while cancelling your order.",
    };
  }
}

export async function updateOrderStatus(
  orderId: string,
  orderStatus?: string,
  paymentStatus?: string,
) {
  try {
    await requireAdmin();

    await connectDB();

    if (!orderId?.trim()) {
      return {
        success: false as const,
        message: "Order ID is required.",
      };
    }

    const allowedOrderStatuses = [
      "Pending",
      "Confirmed",
      "Processing",
      "Ready for Delivery",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    const allowedPaymentStatuses = [
      "Pending",
      "Paid",
      "Failed",
      "Refunded",
    ];

    if (
      orderStatus !== undefined &&
      !allowedOrderStatuses.includes(orderStatus)
    ) {
      return {
        success: false as const,
        message: "Invalid order status.",
      };
    }

    if (
      paymentStatus !== undefined &&
      !allowedPaymentStatuses.includes(paymentStatus)
    ) {
      return {
        success: false as const,
        message: "Invalid payment status.",
      };
    }

    if (orderStatus === undefined && paymentStatus === undefined) {
      return {
        success: false as const,
        message: "No order status information was provided.",
      };
    }

    if (orderStatus !== "Cancelled") {
      const updateData: Record<string, string> = {};

      if (orderStatus !== undefined) {
        updateData.orderStatus = orderStatus;
      }

      if (paymentStatus !== undefined) {
        updateData.paymentStatus = paymentStatus;
      }

      const updatedOrderResult = await Order.findByIdAndUpdate(
        orderId,
        {
          $set: updateData,
        },
        {
          new: true,
          runValidators: true,
        },
      ).lean();

      if (!updatedOrderResult) {
        return {
          success: false as const,
          message: "Order not found.",
        };
      }

      const updatedOrder =
        updatedOrderResult as unknown as CancelOrderData;

      revalidatePath("/admin/orders");
      revalidatePath(`/admin/orders/${orderId}`);

      if (updatedOrder.customer) {
        revalidatePath("/account/orders");
        revalidatePath(
          `/account/orders/${updatedOrder.orderNumber}`,
        );
      }

      return {
        success: true as const,
        message: "Order status updated successfully.",
        orderId: String(updatedOrder._id),
        orderNumber: String(updatedOrder.orderNumber),
        orderStatus: String(updatedOrder.orderStatus),
        paymentStatus: String(
          updatedOrder.paymentStatus || "Pending",
        ),
      };
    }

    const mongoose = await import("mongoose").then(
      ({ default: mongoose }) => mongoose,
    );

    const session = await mongoose.startSession();

    try {
      const cancelledOrder = await session.withTransaction(async () => {
        const orderResult = await Order.findOneAndUpdate(
          {
            _id: orderId,
            orderStatus: "Pending",
          },
          {
            $set: {
              orderStatus: "Cancelled",
              ...(paymentStatus !== undefined
                ? {
                    paymentStatus,
                  }
                : {}),
            },
          },
          {
            new: true,
            session,
          },
        ).lean();

        const order = orderResult
          ? (orderResult as unknown as CancelOrderData)
          : null;

        if (!order) {
          const existingOrderResult = await Order.findById(orderId)
            .select(
              "orderStatus paymentStatus customer orderNumber",
            )
            .session(session)
            .lean();

          if (!existingOrderResult) {
            throw new Error("Order not found.");
          }

          const existingOrder =
            existingOrderResult as unknown as {
              orderStatus: string;
              paymentStatus?: string;
              customer?: unknown;
              orderNumber: string;
            };

          if (existingOrder.orderStatus === "Cancelled") {
            throw new Error("This order has already been cancelled.");
          }

          throw new Error("Only Pending orders can be cancelled.");
        }

        for (const item of order.items) {
          const updatedProduct = await Product.findByIdAndUpdate(
            item.product,
            {
              $inc: {
                stock: Number(item.quantity),
              },
            },
            {
              new: true,
              session,
            },
          );

          if (!updatedProduct) {
            throw new Error(
              `Unable to restore stock for ${item.name}.`,
            );
          }
        }

        return {
          _id: order._id,
          orderNumber: String(order.orderNumber),
          orderStatus: String(order.orderStatus),
          paymentStatus: String(
            order.paymentStatus || "Pending",
          ),
          hasCustomer: Boolean(order.customer),
        };
      });

      revalidatePath("/admin/orders");
      revalidatePath(`/admin/orders/${orderId}`);

      if (cancelledOrder.hasCustomer) {
        revalidatePath("/account/orders");
        revalidatePath(
          `/account/orders/${cancelledOrder.orderNumber}`,
        );
      }

      return {
        success: true as const,
        message: "Order cancelled successfully and stock restored.",
        orderId: String(cancelledOrder._id),
        orderNumber: cancelledOrder.orderNumber,
        orderStatus: cancelledOrder.orderStatus,
        paymentStatus: cancelledOrder.paymentStatus,
      };
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);

    return {
      success: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the order.",
    };
  }
}
