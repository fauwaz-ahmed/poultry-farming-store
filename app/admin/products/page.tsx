import Link from "next/link";
import { redirect } from "next/navigation";

import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { ToggleProductStatusButton } from "@/components/admin/ToggleProductStatusButton";

type AdminProductsPageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    status?: string;
  }>;
};

type CategoryData = {
  _id: unknown;
  name?: unknown;
  slug?: unknown;
};

type ProductData = {
  _id: unknown;
  name?: unknown;
  slug?: unknown;
  sku?: unknown;
  category?: {
    name?: unknown;
    slug?: unknown;
  } | null;
  price?: unknown;
  stock?: unknown;
  unit?: unknown;
  active?: unknown;
};

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/admin/login");
  }

  const params = await searchParams;

  const search = String(params.search || "").trim();
  const categorySlug = String(params.category || "").trim();
  const status = String(params.status || "").trim();

  await connectDB();

  const categoriesResult = await Category.find({
    active: true,
  })
    .sort({
      name: 1,
    })
    .lean();

  const categories =
    categoriesResult as unknown as CategoryData[];

  const selectedCategory = categorySlug
    ? categories.find(
        (category) => String(category.slug) === categorySlug
      )
    : null;

  const productQuery: any = {};

  if (search) {
    productQuery.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        sku: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  if (selectedCategory) {
    productQuery.category = selectedCategory._id;
  }

  if (status === "active") {
    productQuery.active = true;
  }

  if (status === "inactive") {
    productQuery.active = false;
  }

  const productsResult = await Product.find(productQuery)
    .populate("category", "name slug")
    .sort({
      createdAt: -1,
    })
    .lean();

  const products =
    productsResult as unknown as ProductData[];

  const hasFilters =
    Boolean(search) || Boolean(categorySlug) || Boolean(status);

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-green-700 hover:underline"
            >
              ← Back to Admin Orders
            </Link>

            <h1 className="mt-3 text-3xl font-black text-gray-900">
              Products
            </h1>

            <p className="mt-2 text-gray-600">
              Manage your poultry store products.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="btn btn-primary"
          >
            + Add Product
          </Link>
        </div>

        <form
          method="GET"
          className="mt-8 rounded-2xl border bg-white p-5 shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label
                htmlFor="search"
                className="mb-2 block text-sm font-bold text-gray-900"
              >
                Search
              </label>

              <input
                id="search"
                name="search"
                defaultValue={search}
                placeholder="Search product name or SKU..."
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-bold text-gray-900"
              >
                Category
              </label>

              <select
                id="category"
                name="category"
                defaultValue={categorySlug}
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
              >
                <option value="">All categories</option>

                {categories.map((category) => (
                  <option
                    key={String(category._id)}
                    value={String(category.slug || "")}
                  >
                    {String(category.name || "")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-bold text-gray-900"
              >
                Status
              </label>

              <select
                id="status"
                name="status"
                defaultValue={status}
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              className="btn btn-primary"
            >
              Apply Filters
            </button>

            {hasFilters && (
              <Link
                href="/admin/products"
                className="rounded-xl border px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </Link>
            )}
          </div>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-600">
            {products.length}{" "}
            {products.length === 1 ? "product" : "products"} found
          </p>
        </div>

        {products.length === 0 ? (
          <div className="mt-4 rounded-2xl border bg-white p-10 text-center shadow-sm">
            <div className="text-5xl">📦</div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              No products found
            </h2>

            <p className="mt-2 text-gray-600">
              Try changing your search or filters.
            </p>

            <Link
              href="/admin/products"
              className="btn btn-primary mt-6 inline-flex"
            >
              View All Products
            </Link>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 font-bold text-gray-900">
                      Product
                    </th>

                    <th className="px-5 py-4 font-bold text-gray-900">
                      SKU
                    </th>

                    <th className="px-5 py-4 font-bold text-gray-900">
                      Category
                    </th>

                    <th className="px-5 py-4 font-bold text-gray-900">
                      Price
                    </th>

                    <th className="px-5 py-4 font-bold text-gray-900">
                      Stock
                    </th>

                    <th className="px-5 py-4 font-bold text-gray-900">
                      Status
                    </th>

                    <th className="px-5 py-4 font-bold text-gray-900">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr
                      key={String(product._id)}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900">
                          {String(product.name || "")}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          /products/{String(product.slug || "")}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {String(product.sku || "")}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {String(product.category?.name || "—")}
                      </td>

                      <td className="px-5 py-4 font-semibold text-gray-900">
                        ₹{Number(product.price || 0).toFixed(2)}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {Number(product.stock || 0)}{" "}
                        {String(product.unit || "")}
                      </td>

                      <td className="px-5 py-4">
                        {Boolean(product.active) ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                          <Link
                            href={`/admin/products/${String(
                              product._id
                            )}/edit`}
                            className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
                          >
                            Edit
                          </Link>

                          <ToggleProductStatusButton
                            productId={String(product._id)}
                            productName={String(product.name || "")}
                            active={Boolean(product.active)}
                          />

                          <DeleteProductButton
                            productId={String(product._id)}
                            productName={String(product.name || "")}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
