import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { OrderStatusTimeline } from "@/components/account/OrderStatusTimeline";
import { CancelOrderButton } from "@/components/account/CancelOrderButton";

type OrderItemData = {
  name?: string;
  sku?: string;
  quantity?: number;
  unitPrice?: number;
  unit?: string;
  subtotal?: number;
  image?: string;
};

type ShippingAddressData = {
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  instructions?: string;
};

type OrderData = {
  orderNumber: string;
  customerName?: string;
  phone?: string;
  email?: string;
  items?: OrderItemData[];
  shippingAddress?: ShippingAddressData;
  subtotal?: number;
  deliveryFee?: number;
  discount?: number;
  grandTotal?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
  createdAt?: Date;
};

type OrderPageProps = {
  params: Promise<{
    orderNumber: string;
  }>;
};

export default async function CustomerOrderDetailPage({
  params,
}: OrderPageProps) {
  const user = await getCurrentUser();

  if (!user || user.role !== "customer") {
    redirect("/login?next=/account/orders");
  }

  const { orderNumber } = await params;

  await connectDB();

  const orderResult = await Order.findOne({
    orderNumber,
    customer: user.id,
  }).lean();

  if (!orderResult) {
    notFound();
  }

  const order = orderResult as unknown as OrderData;

  const canCancel = order.orderStatus === "Pending";

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container-farm">
        <div className="mb-6">
          <Link
            href="/account/orders"
            className="text-sm font-semibold text-farm-700 hover:underline"
          >
            ← Back to my orders
          </Link>
        </div>

        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-farm-600">
              Order tracking
            </p>

            <h1 className="mt-1 text-3xl font-black">{order.orderNumber}</h1>

            <p className="mt-2 text-sm text-gray-500">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleString("en-IN")
                : ""}
            </p>
          </div>

          {canCancel ? (
            <CancelOrderButton orderNumber={order.orderNumber} />
          ) : null}
        </div>

        {order.orderStatus === "Cancelled" ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
            <p className="font-bold">This order has been cancelled.</p>
            <p className="mt-1 text-sm">
              The order will not be processed or delivered.
            </p>
          </div>
        ) : null}

        <section className="card p-6">
          <h2 className="text-xl font-black">Order status</h2>

          <div className="mt-6">
            <OrderStatusTimeline
              status={String(order.orderStatus || "Pending")}
            />
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="card p-6">
            <h2 className="text-xl font-black">Items</h2>

            <div className="mt-5 divide-y">
              {(order.items || []).map((item, index) => (
                <div
                  key={`${item.sku || item.name || "item"}-${index}`}
                  className="flex gap-4 py-5 first:pt-0 last:pb-0"
                >
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name || "Product"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">🐔</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold">{item.name}</h3>

                    {item.sku ? (
                      <p className="mt-1 text-xs text-gray-500">
                        SKU: {item.sku}
                      </p>
                    ) : null}

                    <p className="mt-2 text-sm text-gray-600">
                      Qty: {item.quantity || 0}{" "}
                      {item.unit ? `× ${item.unit}` : ""}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">
                      ₹{Number(item.subtotal || 0).toFixed(2)}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      ₹{Number(item.unitPrice || 0).toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-6">
            <section className="card p-6">
              <h2 className="text-xl font-black">Payment</h2>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Method</span>

                  <span className="font-semibold uppercase">
                    {String(order.paymentMethod || "cod")}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Payment status</span>

                  <span className="font-semibold">
                    {String(order.paymentStatus || "Pending")}
                  </span>
                </div>
              </div>
            </section>

            <section className="card p-6">
              <h2 className="text-xl font-black">Delivery address</h2>

              <div className="mt-4 text-sm leading-6 text-gray-700">
                <p className="font-bold">
                  {order.shippingAddress?.fullName || order.customerName || ""}
                </p>

                <p>{order.shippingAddress?.phone || order.phone || ""}</p>

                {order.shippingAddress?.email || order.email ? (
                  <p>{order.shippingAddress?.email || order.email || ""}</p>
                ) : null}

                <p className="mt-2">
                  {order.shippingAddress?.address || ""}
                  <br />
                  {order.shippingAddress?.city || ""},{" "}
                  {order.shippingAddress?.state || ""}
                  <br />
                  {order.shippingAddress?.pincode || ""}
                </p>

                {order.shippingAddress?.instructions ? (
                  <p className="mt-3 rounded-lg bg-gray-50 p-3">
                    <span className="font-semibold">
                      Delivery instructions:
                    </span>{" "}
                    {order.shippingAddress.instructions}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="card p-6">
              <h2 className="text-xl font-black">Order summary</h2>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>

                  <span>₹{Number(order.subtotal || 0).toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>

                  <span>₹{Number(order.deliveryFee || 0).toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>

                  <span>-₹{Number(order.discount || 0).toFixed(2)}</span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-black">
                    <span>Total</span>

                    <span>₹{Number(order.grandTotal || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
