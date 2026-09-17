import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { OrderStatusControls } from "@/components/admin/OrderStatusControls";
import { LogoutButton } from "@/components/auth/LogoutButton";

type RawOrderItem = {
  name?: unknown;
  quantity?: unknown;
  unitPrice?: unknown;
  subtotal?: unknown;
  unit?: unknown;
};

type RawOrder = {
  _id: unknown;
  orderNumber?: unknown;
  customerName?: unknown;
  phone?: unknown;
  email?: unknown;
  items?: unknown;
  subtotal?: unknown;
  deliveryFee?: unknown;
  discount?: unknown;
  grandTotal?: unknown;
  paymentMethod?: unknown;
  paymentStatus?: unknown;
  orderStatus?: unknown;
  shippingAddress?: {
    fullName?: unknown;
    phone?: unknown;
    email?: unknown;
    address?: unknown;
    city?: unknown;
    state?: unknown;
    pincode?: unknown;
    instructions?: unknown;
  };
  createdAt?: unknown;
};

type SafeOrderItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  unit: string;
};

type SafeOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string;
  items: SafeOrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    instructions: string;
  };
  createdAt: string;
};

export default async function AdminOrders() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  await connectDB();

  const orders = (await Order.find({})
    .sort({ createdAt: -1 })
    .lean()) as unknown as RawOrder[];

  const safeOrders: SafeOrder[] = orders.map((order) => ({
    id: String(order._id),

    orderNumber: String(order.orderNumber || ""),

    customerName: String(order.customerName || ""),

    phone: String(order.phone || ""),

    email: String(order.email || ""),

    items: Array.isArray(order.items)
      ? (order.items as RawOrderItem[]).map(
          (item): SafeOrderItem => ({
            name: String(item.name || ""),
            quantity: Number(item.quantity || 0),
            unitPrice: Number(item.unitPrice || 0),
            subtotal: Number(item.subtotal || 0),
            unit: String(item.unit || ""),
          })
        )
      : [],

    subtotal: Number(order.subtotal || 0),

    deliveryFee: Number(order.deliveryFee || 0),

    discount: Number(order.discount || 0),

    grandTotal: Number(order.grandTotal || 0),

    paymentMethod: String(order.paymentMethod || "cod"),

    paymentStatus: String(order.paymentStatus || "Pending"),

    orderStatus: String(order.orderStatus || "Pending"),

    shippingAddress: {
      fullName: String(
        order.shippingAddress?.fullName || ""
      ),

      phone: String(
        order.shippingAddress?.phone || ""
      ),

      email: String(
        order.shippingAddress?.email || ""
      ),

      address: String(
        order.shippingAddress?.address || ""
      ),

      city: String(
        order.shippingAddress?.city || ""
      ),

      state: String(
        order.shippingAddress?.state || ""
      ),

      pincode: String(
        order.shippingAddress?.pincode || ""
      ),

      instructions: String(
        order.shippingAddress?.instructions || ""
      ),
    },

    createdAt: order.createdAt
      ? new Date(
          order.createdAt as string | number | Date
        ).toLocaleString("en-IN")
      : "",
  }));

  return (
    <main className="container-farm py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black">
          Order Management
        </h1>

        <p className="mt-2 text-gray-600">
          View and manage customer orders.
        </p>

        <div className="shrink-0">
          <LogoutButton />
        </div>
      </div>

      {safeOrders.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
          <div className="text-4xl">📦</div>

          <h2 className="mt-4 text-xl font-bold">
            No orders yet
          </h2>

          <p className="mt-2 text-gray-600">
            Customer orders will appear here after checkout.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {safeOrders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-2xl border bg-white shadow-sm"
            >
              {/* Order header */}

              <div className="border-b bg-gray-50 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Order Number
                    </p>

                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="mt-1 inline-block text-xl font-black text-farm-700 hover:underline"
                    >
                      {order.orderNumber}
                    </Link>

                    <p className="mt-1 text-sm text-gray-500">
                      {order.createdAt}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
                      {order.orderStatus}
                    </span>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                      COD • {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer + shipping */}

              <div className="grid gap-6 border-b p-6 lg:grid-cols-2">
                <div>
                  <h3 className="font-bold text-gray-900">
                    Customer
                  </h3>

                  <div className="mt-3 space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-semibold text-gray-900">
                        Name:
                      </span>{" "}
                      {order.customerName}
                    </p>

                    <p>
                      <span className="font-semibold text-gray-900">
                        Phone:
                      </span>{" "}
                      {order.phone}
                    </p>

                    {order.email && (
                      <p>
                        <span className="font-semibold text-gray-900">
                          Email:
                        </span>{" "}
                        {order.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900">
                    Delivery Address
                  </h3>

                  <div className="mt-3 text-sm leading-6 text-gray-600">
                    <p>
                      {order.shippingAddress.fullName}
                    </p>

                    <p>
                      {order.shippingAddress.address}
                    </p>

                    <p>
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}{" "}
                      {order.shippingAddress.pincode}
                    </p>

                    <p>
                      Phone: {order.shippingAddress.phone}
                    </p>

                    {order.shippingAddress.instructions && (
                      <p className="mt-2">
                        <span className="font-semibold text-gray-900">
                          Instructions:
                        </span>{" "}
                        {order.shippingAddress.instructions}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Products */}

              <div className="border-b p-6">
                <h3 className="mb-4 font-bold text-gray-900">
                  Products
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead>
                      <tr className="border-b text-gray-500">
                        <th className="pb-3 font-semibold">
                          Product
                        </th>

                        <th className="pb-3 font-semibold">
                          Qty
                        </th>

                        <th className="pb-3 font-semibold">
                          Unit Price
                        </th>

                        <th className="pb-3 text-right font-semibold">
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {order.items.map(
                        (item, index) => (
                          <tr
                            key={`${order.id}-${index}`}
                            className="border-b last:border-0"
                          >
                            <td className="py-4 font-medium text-gray-900">
                              {item.name}
                            </td>

                            <td className="py-4 text-gray-600">
                              {item.quantity}{" "}
                              {item.unit}
                            </td>

                            <td className="py-4 text-gray-600">
                              ₹
                              {item.unitPrice.toFixed(
                                2
                              )}
                            </td>

                            <td className="py-4 text-right font-semibold text-gray-900">
                              ₹
                              {item.subtotal.toFixed(
                                2
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment + totals */}

              <div className="grid gap-6 border-b p-6 lg:grid-cols-2">
                <div>
                  <h3 className="font-bold text-gray-900">
                    Payment
                  </h3>

                  <p className="mt-2 text-sm text-gray-600">
                    Method:{" "}
                    <span className="font-semibold text-gray-900">
                      Cash on Delivery
                    </span>
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Payment Status:{" "}
                    <span className="font-semibold text-gray-900">
                      {order.paymentStatus}
                    </span>
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Subtotal
                    </span>

                    <span className="font-medium">
                      ₹{order.subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Delivery
                    </span>

                    <span className="font-medium">
                      ₹{order.deliveryFee.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Discount
                    </span>

                    <span className="font-medium">
                      -₹
                      {order.discount.toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-3 flex justify-between border-t pt-3 text-lg font-black">
                    <span>
                      Grand Total
                    </span>

                    <span>
                      ₹
                      {order.grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin controls */}

              <OrderStatusControls
                orderId={order.id}
                initialOrderStatus={
                  order.orderStatus
                }
                initialPaymentStatus={
                  order.paymentStatus
                }
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
