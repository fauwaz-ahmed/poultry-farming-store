import { notFound } from "next/navigation";

import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { ProductCard } from "@/components/product/ProductCard";

type CategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
};

type CategoryData = {
  _id: unknown;
  name: string;
  slug: string;
  description?: string;
};

type ProductData = {
  _id: unknown;
  name: string;
  slug: string;
  sku: string;
  price: number;
  unit: string;
  stock: number;
  images?: string[];
};

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { category } = await params;

  await connectDB();

  const categoryDoc = (await Category.findOne({
    slug: category,
    active: true,
  }).lean()) as unknown as CategoryData | null;

  if (!categoryDoc) {
    notFound();
  }

  const products = (await Product.find({
    category: categoryDoc._id,
    active: true,
  })
    .sort({ createdAt: -1 })
    .lean()) as unknown as ProductData[];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            {categoryDoc.name}
          </h1>

          {categoryDoc.description && (
            <p className="mt-3 max-w-3xl text-gray-600">
              {categoryDoc.description}
            </p>
          )}
        </div>

        {/* Products */}
        {products.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              No products available
            </h2>

            <p className="mt-2 text-gray-600">
              There are currently no products in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={String(product._id)}
                product={{
                  _id: String(product._id),
                  name: product.name,
                  slug: product.slug,
                  sku: product.sku,
                  price: product.price,
                  unit: product.unit,
                  stock: product.stock,
                  images: product.images ?? [],
                }}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
