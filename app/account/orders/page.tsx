import Link from "next/link";
import { redirect } from "next/navigation";

import { OrderStatusTimeline } from "@/components/account/OrderStatusTimeline";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Order from "@/models/Order";

type OrderItemData = {
  name?: string;
  quantity?: number;
  unit?: string;
  subtotal?: number;
};

type OrderData = {
  _id: {
    toString(): string;
  };
  orderNumber: string;
  createdAt: Date;
  orderStatus: string;
  paymentStatus: string;
  items: OrderItemData[];
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
};

export default async function MyOrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/account/orders");
  }

  if (user.role !== "customer") {
    redirect("/");
  }

  await connectDB();

  const orders = (await Order.find({
    customer: user.id,
  })
    .sort({ createdAt: -1 })
    .lean()) as unknown as OrderData[];

  return (
    <main className="container-farm py-12">
      {/* Page Header */}
      <div>
        <p className="font-bold text-farm-600">
          Account
        </p>

        <h1 className="mt-1 text-3xl font-black">
          My Orders
        </h1>

        <p className="mt-2 text-gray-600">
          View your order history and current order status.
        </p>
      </div>

      {/* Empty State */}
      {orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border bg-white p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
            📦
          </div>

          <h2 className="mt-6 text-xl font-bold">
            No orders yet
          </h2>

          <p className="mt-2 text-gray-600">
            Your orders will appear here after you place
            your first order.
          </p>

          <Link
            href="/chickens"
            className="btn mt-6 inline-block bg-farm-700 text-white"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        /* Orders */
        <div className="mt-8 space-y-6">
          {orders.map((order) => (
            <div
              key={order._id.toString()}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >
              {/* Order Header */}
              <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Order
                  </p>

                  <Link
                    href={`/account/orders/${order.orderNumber}`}
                    className="text-lg font-black text-farm-700 hover:underline"
                  >
                    {order.orderNumber}
                  </Link>

                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                    {order.orderStatus}
                  </span>

                  <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                    COD · {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Order Status Timeline */}
              <OrderStatusTimeline
                status={order.orderStatus}
              />

              {/* Products */}
              <div className="py-5">
                <h3 className="font-bold text-gray-900">
                  Products
                </h3>

                <div className="mt-3 space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={`${order._id.toString()}-${index}`}
                      className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 p-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">
                          {item.name}
                        </p>

                        <p className="mt-1 text-gray-500">
                          Qty: {item.quantity} {item.unit}
                        </p>
                      </div>

                      <p className="shrink-0 font-semibold text-gray-900">
                        ₹
                        {Number(
                          item.subtotal
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Totals */}
              <div className="flex flex-col gap-2 border-t pt-5 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="text-gray-600">
                  <span>
                    Subtotal: ₹
                    {Number(
                      order.subtotal
                    ).toLocaleString("en-IN")}
                  </span>

                  <span className="mx-2">
                    ·
                  </span>

                  <span>
                    Delivery: ₹
                    {Number(
                      order.deliveryFee
                    ).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="text-lg font-black text-gray-900">
                  Total: ₹
                  {Number(
                    order.grandTotal
                  ).toLocaleString("en-IN")}
                </div>
              </div>

              {/* Order Details */}
              <div className="mt-5 border-t pt-4">
                <Link
                  href={`/account/orders/${order.orderNumber}`}
                  className="inline-flex items-center font-bold text-farm-700 hover:underline"
                >
                  View order details
                  <span className="ml-1">
                    →
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
