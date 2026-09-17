import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Order from "@/models/Order";
import { OrderStatusControls } from "@/components/admin/OrderStatusControls";

type OrderItemData = {
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
  image?: string;
};

type ShippingAddressData = {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  instructions?: string;
};

type AdminOrderData = {
  _id: {
    toString(): string;
  };
  orderNumber: string;
  createdAt: Date;
  orderStatus: string;
  paymentStatus: string;
  customerName: string;
  phone: string;
  email?: string;
  items: OrderItemData[];
  shippingAddress: ShippingAddressData;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  grandTotal: number;
};

type AdminOrderDetailPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (user.role !== "admin") {
    redirect("/");
  }

  const { orderId } = await params;

  await connectDB();

  const orderResult = await Order.findById(orderId).lean();

  if (!orderResult) {
    notFound();
  }

  const order = orderResult as unknown as AdminOrderData;

  return (
    <main className="container-farm py-12">
      <div className="mb-8">
        <Link
          href="/admin/orders"
          className="text-sm font-semibold text-farm-700 hover:underline"
        >
          ← Back to Orders
        </Link>

        <p className="mt-5 font-bold text-farm-600">
          Admin
        </p>

        <h1 className="mt-1 text-3xl font-black">
          {order.orderNumber}
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Placed on{" "}
          {new Date(order.createdAt).toLocaleString(
            "en-IN"
          )}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border bg-white p-6 lg:col-span-2">
          <h2 className="text-xl font-black">
            Ordered Products
          </h2>

          <div className="mt-5 divide-y">
            {order.items.map((item, index) => (
              <div
                key={`${order._id.toString()}-${index}`}
                className="flex gap-4 py-5 first:pt-0 last:pb-0"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gray-100 text-2xl">
                    🐔
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    SKU: {item.sku}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Quantity: {item.quantity}{" "}
                    {item.unit}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    ₹
                    {Number(
                      item.unitPrice
                    ).toLocaleString("en-IN")}
                  </p>

                  <p className="mt-1 font-bold">
                    ₹
                    {Number(
                      item.subtotal
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border bg-white p-6">
            <h2 className="font-black">
              Update Order
            </h2>

            <div className="mt-5">
              <OrderStatusControls
                orderId={order._id.toString()}
                initialOrderStatus={order.orderStatus}
                initialPaymentStatus={
                  order.paymentStatus
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-6">
            <h2 className="font-black">
              Customer
            </h2>

            <div className="mt-4 space-y-1 text-sm text-gray-600">
              <p className="font-bold text-gray-900">
                {order.customerName}
              </p>

              <p>
                Phone: {order.phone}
              </p>

              {order.email && (
                <p>
                  Email: {order.email}
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="font-black">
            Delivery Address
          </h2>

          <div className="mt-4 space-y-1 text-sm text-gray-600">
            <p className="font-bold text-gray-900">
              {order.shippingAddress.fullName}
            </p>

            <p>
              {order.shippingAddress.phone}
            </p>

            {order.shippingAddress.email && (
              <p>
                {order.shippingAddress.email}
              </p>
            )}

            <p className="pt-2">
              {order.shippingAddress.address}
            </p>

            <p>
              {order.shippingAddress.city},{" "}
              {order.shippingAddress.state}
            </p>

            <p>
              Pincode:{" "}
              {order.shippingAddress.pincode}
            </p>

            {order.shippingAddress.instructions && (
              <p className="pt-2">
                <span className="font-semibold">
                  Instructions:
                </span>{" "}
                {order.shippingAddress.instructions}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-6">
          <h2 className="font-black">
            Order Summary
          </h2>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">
                Subtotal
              </span>

              <span className="font-semibold">
                ₹
                {Number(
                  order.subtotal
                ).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                Delivery
              </span>

              <span className="font-semibold">
                ₹
                {Number(
                  order.deliveryFee
                ).toLocaleString("en-IN")}
              </span>
            </div>

            {Number(order.discount) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Discount
                </span>

                <span className="font-semibold">
                  -₹
                  {Number(
                    order.discount
                  ).toLocaleString("en-IN")}
                </span>
              </div>
            )}

            <div className="flex justify-between border-t pt-4 text-lg font-black">
              <span>Total</span>

              <span>
                ₹
                {Number(
                  order.grandTotal
                ).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="border-t pt-4">
              <p>
                Payment method:{" "}
                <span className="font-semibold">
                  Cash on Delivery
                </span>
              </p>

              <p className="mt-1">
                Payment status:{" "}
                <span className="font-semibold">
                  {order.paymentStatus}
                </span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
