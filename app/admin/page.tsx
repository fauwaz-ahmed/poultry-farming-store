import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/admin/login");
  }

  await connectDB();

  const [
    totalProducts,
    activeProducts,
    lowStockProducts,
    totalOrders,
    pendingOrders,
    processingOrders,
    deliveredOrders,
    recentOrders,
  ] = await Promise.all([
    Product.countDocuments({}),

    Product.countDocuments({
      active: true,
    }),

    Product.countDocuments({
      active: true,
      stock: {
        $lte: 10,
      },
    }),

    Order.countDocuments({}),

    Order.countDocuments({
      orderStatus: "Pending",
    }),

    Order.countDocuments({
      orderStatus: {
        $in: [
          "Confirmed",
          "Processing",
          "Ready for Delivery",
          "Out for Delivery",
        ],
      },
    }),

    Order.countDocuments({
      orderStatus: "Delivered",
    }),

    Order.find({})
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean(),
  ]);

  const stats = [
    {
      label: "Total Products",
      value: totalProducts,
      icon: "📦",
      href: "/admin/products",
    },
    {
      label: "Active Products",
      value: activeProducts,
      icon: "✅",
      href: "/admin/products?status=active",
    },
    {
      label: "Low Stock",
      value: lowStockProducts,
      icon: "⚠️",
      href: "/admin/products?status=active",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      icon: "🧾",
      href: "/admin/orders",
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
      icon: "⏳",
      href: "/admin/orders",
    },
    {
      label: "Orders in Progress",
      value: processingOrders,
      icon: "🚚",
      href: "/admin/orders",
    },
    {
      label: "Delivered Orders",
      value: deliveredOrders,
      icon: "🎉",
      href: "/admin/orders",
    },
  ];

  return (
    <>
      
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-green-700">
              Admin Panel
            </p>

            <h1 className="mt-2 text-3xl font-black text-gray-900">
              Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              Manage your poultry store from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/products"
              className="btn btn-primary"
            >
              Manage Products
            </Link>

            <Link
              href="/admin/orders"
              className="rounded-xl border bg-white px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Manage Orders
            </Link>
          </div>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    {stat.label}
                  </p>

                  <p className="mt-2 text-3xl font-black text-gray-900">
                    {stat.value}
                  </p>
                </div>

                <div className="text-3xl">
                  {stat.icon}
                </div>
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  Recent Orders
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Latest customer orders
                </p>
              </div>

              <Link
                href="/admin/orders"
                className="text-sm font-bold text-green-700 hover:underline"
              >
                View all
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No orders yet.
              </div>
            ) : (
              <div className="divide-y">
                {recentOrders.map((order: any) => (
                  <Link
                    key={order._id.toString()}
                    href={`/admin/orders/${order._id.toString()}`}
                    className="block px-5 py-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-gray-900">
                          {order.orderNumber}
                        </p>

                        <p className="mt-1 text-sm text-gray-600">
                          {order.customerName}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ₹
                          {Number(
                            order.grandTotal || 0
                          ).toFixed(2)}
                        </p>

                        <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-bold text-gray-700">
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border bg-white shadow-sm">
            <div className="border-b px-5 py-4">
              <h2 className="text-xl font-black text-gray-900">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Common admin tasks
              </p>
            </div>

            <div className="grid gap-3 p-5">
              <Link
                href="/admin/products/new"
                className="rounded-xl border p-4 transition hover:border-green-500 hover:bg-green-50"
              >
                <div className="text-2xl">➕</div>

                <div className="mt-2 font-bold text-gray-900">
                  Add Product
                </div>

                <div className="mt-1 text-sm text-gray-600">
                  Add a new poultry product to your store.
                </div>
              </Link>

              <Link
                href="/admin/products"
                className="rounded-xl border p-4 transition hover:border-green-500 hover:bg-green-50"
              >
                <div className="text-2xl">📦</div>

                <div className="mt-2 font-bold text-gray-900">
                  Manage Products
                </div>

                <div className="mt-1 text-sm text-gray-600">
                  Search, edit, filter or deactivate products.
                </div>
              </Link>

              <Link
                href="/admin/orders"
                className="rounded-xl border p-4 transition hover:border-green-500 hover:bg-green-50"
              >
                <div className="text-2xl">🧾</div>

                <div className="mt-2 font-bold text-gray-900">
                  Manage Orders
                </div>

                <div className="mt-1 text-sm text-gray-600">
                  Review orders and update their status.
                </div>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
    </>
  );
}