"use server";

import crypto from "crypto";

import { z } from "zod";

import { connectDB } from "@/lib/db";
import { getCart } from "@/lib/cart";

import Cart from "@/models/Cart";
import Order from "@/models/Order";
import Product from "@/models/Product";

import {
  calculateDeliveryFee,
  deliveryConfig,
  isPincodeServiceable,
} from "@/lib/config/delivery";

const CheckoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(100, "Name is too long."),

  phone: z
    .string()
    .trim()
    .regex(
      /^(?:\+91[\s-]?|0)?[6-9]\d{9}$/,
      "Please enter a valid Indian mobile number.",
    ),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(150, "Email is too long."),

  address: z
    .string()
    .trim()
    .min(5, "Please enter your complete address.")
    .max(300, "Address is too long."),

  city: z
    .string()
    .trim()
    .min(2, "Please enter your city.")
    .max(100, "City name is too long."),

  state: z
    .string()
    .trim()
    .min(2, "Please enter your state.")
    .max(100, "State name is too long."),

  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Please enter a valid 6-digit pincode."),

  deliveryInstructions: z
    .string()
    .trim()
    .max(500, "Delivery instructions are too long.")
    .optional()
    .default(""),

  checkoutId: z.string().uuid("Invalid checkout request."),
});

export type CheckoutResult =
  | {
      success: true;
      orderNumber: string;
    }
  | {
      success: false;
      error: string;
    };

function generateOrderNumber() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `PFS-${year}${month}${day}-${randomPart}`;
}

export async function createCODOrder(
  formData: FormData,
): Promise<CheckoutResult> {
  try {
    const rawData = {
      fullName: String(formData.get("fullName") || ""),

      phone: String(formData.get("phone") || ""),

      email: String(formData.get("email") || ""),

      address: String(formData.get("address") || ""),

      city: String(formData.get("city") || ""),

      state: String(formData.get("state") || ""),

      pincode: String(formData.get("pincode") || ""),

      deliveryInstructions: String(formData.get("deliveryInstructions") || ""),

      checkoutId: String(formData.get("checkoutId") || ""),
    };

    const validation = CheckoutSchema.safeParse(rawData);

    if (!validation.success) {
      const firstError = validation.error.issues[0];

      return {
        success: false,
        error: firstError?.message || "Please check your checkout details.",
      };
    }

    const data = validation.data;

    await connectDB();

    /*
     * Check whether this checkout request
     * has already created an order.
     *
     * This protects against accidental
     * double-clicks on "Place Order".
     */
    const existingOrderResult = await Order.findOne({
      // keep the existing query conditions exactly as they are
    }).lean();

    if (existingOrderResult) {
      const existingOrder = existingOrderResult as unknown as {
        orderNumber: string;
      };

      return {
        success: true,
        orderNumber: existingOrder.orderNumber,
      };
    }

    /*
     * Make sure the pincode is serviceable.
     */
    if (!isPincodeServiceable(data.pincode)) {
      return {
        success: false,
        error: "Sorry, we do not currently deliver to this pincode.",
      };
    }

    /*
     * Get the server-side cart.
     */
    const cart = await getCart();

    if (!cart || !cart.items || cart.items.length === 0) {
      return {
        success: false,
        error: "Your cart is empty.",
      };
    }

    /*
     * Collect all product IDs from the cart.
     */
    const productIds = cart.items.map((item) => item.product);

    /*
     * Re-fetch products from MongoDB.
     *
     * IMPORTANT:
     * We do NOT trust prices, names,
     * stock, or totals from the browser.
     */
    const products = await Product.find({
      _id: {
        $in: productIds,
      },
    }).lean();

    const productMap = new Map(
      products.map((product) => [String(product._id), product]),
    );

    const orderItems = [];

    let subtotal = 0;

    /*
     * Validate every cart item.
     */
    for (const cartItem of cart.items) {
      const product = productMap.get(String(cartItem.product));

      if (!product) {
        return {
          success: false,
          error: "One of the products in your cart is no longer available.",
        };
      }

      const quantity = Number(cartItem.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return {
          success: false,
          error: "Invalid product quantity.",
        };
      }

      const stock = Number(product.stock);

      if (!Number.isFinite(stock) || stock < quantity) {
        return {
          success: false,
          error: `${product.name} does not have enough stock.`,
        };
      }

      const unitPrice = Number(product.price);

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return {
          success: false,
          error: `Invalid price for ${product.name}.`,
        };
      }

      const itemSubtotal = unitPrice * quantity;

      subtotal += itemSubtotal;

      orderItems.push({
        productId: product._id,

        name: product.name,

        sku: product.sku,

        unit: product.unit,

        quantity,

        unitPrice,

        subtotal: itemSubtotal,

        image: product.images?.[0] || "",
      });
    }

    /*
     * Check minimum order amount.
     */
    if (subtotal < deliveryConfig.minimumOrderAmount) {
      return {
        success: false,
        error: `Minimum order amount is ₹${deliveryConfig.minimumOrderAmount}.`,
      };
    }

    /*
     * Calculate delivery fee on the server.
     */
    const deliveryFee = calculateDeliveryFee(subtotal);

    const discount = 0;

    const grandTotal = subtotal + deliveryFee - discount;

    /*
     * Generate unique order number.
     */
    let orderNumber = generateOrderNumber();

    let attempts = 0;

    while (attempts < 5) {
      const existing = await Order.exists({
        orderNumber,
      });

      if (!existing) {
        break;
      }

      orderNumber = generateOrderNumber();

      attempts++;
    }

    /*
     * Create the COD order.
     *
     * Payment method is intentionally
     * restricted to COD.
     */
    const order = await Order.create({
      orderNumber,

      checkoutId: data.checkoutId,

      items: orderItems,

      customer: {
        fullName: data.fullName,

        phone: data.phone,

        email: data.email,
      },

      shippingAddress: {
        fullName: data.fullName,

        phone: data.phone,

        email: data.email,

        address: data.address,

        city: data.city,

        state: data.state,

        pincode: data.pincode,

        deliveryInstructions: data.deliveryInstructions,
      },

      subtotal,

      deliveryFee,

      discount,

      grandTotal,

      paymentMethod: "COD",

      paymentStatus: "Pending",

      orderStatus: "Pending",
    });

    /*
     * Reduce stock after successful
     * order creation.
     *
     * We use conditional updates so
     * stock cannot become negative.
     */
    for (const item of orderItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.productId,

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
        },
      );

      if (!updatedProduct) {
        /*
         * Stock changed between validation
         * and update.
         *
         * Delete the order so the customer
         * does not receive an invalid order.
         */
        await Order.deleteOne({
          _id: order._id,
        });

        return {
          success: false,
          error: `Sorry, stock changed for ${item.name}. Please review your cart and try again.`,
        };
      }
    }

    /*
     * Clear the cart only after the order
     * and stock updates succeeded.
     */
    await Cart.deleteOne({
      _id: cart._id,
    });

    return {
      success: true,

      orderNumber: order.orderNumber,
    };
  } catch (error) {
    console.error("CREATE COD ORDER ERROR:", error);

    return {
      success: false,
      error: "Unable to place your order right now. Please try again.",
    };
  }
}
