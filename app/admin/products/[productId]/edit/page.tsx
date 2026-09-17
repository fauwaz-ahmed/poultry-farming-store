import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { EditProductForm } from "@/components/admin/EditProductForm";

type EditProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

type ProductData = {
  _id: unknown;
  name?: unknown;
  slug?: unknown;
  sku?: unknown;
  category?: unknown;
  price?: unknown;
  stock?: unknown;
  unit?: unknown;
  description?: unknown;
  images?: unknown;
  active?: unknown;
};

type CategoryData = {
  _id: unknown;
  name?: unknown;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const admin = await requireAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  const { productId } = await params;

  await connectDB();

  const productResult = await Product.findById(productId).lean();

  if (!productResult) {
    notFound();
  }

  const product = productResult as unknown as ProductData;

  const categoriesResult = await Category.find({
    active: true,
  })
    .sort({ name: 1 })
    .lean();

  const categories =
    categoriesResult as unknown as CategoryData[];

  const productData = {
    id: String(product._id),
    name: String(product.name || ""),
    slug: String(product.slug || ""),
    sku: String(product.sku || ""),
    categoryId: product.category
      ? String(product.category)
      : "",
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    unit: String(product.unit || ""),
    description: String(product.description || ""),
    images: Array.isArray(product.images)
      ? product.images.map((image: unknown) => String(image))
      : [],
    isActive: Boolean(product.active),
  };

  const categoryData = categories.map((category) => ({
    id: String(category._id),
    name: String(category.name || ""),
  }));

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <Link
            href="/admin/products"
            className="text-sm font-semibold text-green-700 hover:underline"
          >
            ← Back to Products
          </Link>

          <h1 className="mt-3 text-3xl font-black text-gray-900">
            Edit Product
          </h1>

          <p className="mt-2 text-gray-600">
            Update product information, pricing, stock and status.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <EditProductForm
            product={productData}
            categories={categoryData}
          />
        </div>
      </div>
    </main>
  );
}
