import Link from "next/link";
import { notFound } from "next/navigation";

import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type ProductCategory = {
  name?: string;
  slug?: string;
};

type ProductData = {
  _id: unknown;
  name: string;
  slug: string;
  sku: string;
  price: number;
  unit: string;
  stock: number;
  images: unknown;
  description?: string;
  category?: ProductCategory | null;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  await connectDB();

  const productResult = await Product.findOne({
    slug,
    active: true,
  })
    .populate("category", "name slug")
    .lean();

  if (!productResult) {
    notFound();
  }

  const rawProduct =
    productResult as unknown as Record<string, unknown>;

  const product: ProductData = {
    _id: rawProduct._id,
    name: String(rawProduct.name || ""),
    slug: String(rawProduct.slug || ""),
    sku: String(rawProduct.sku || ""),
    price: Number(rawProduct.price || 0),
    unit: String(rawProduct.unit || ""),
    stock: Number(rawProduct.stock || 0),
    images: rawProduct.images,
    description:
      rawProduct.description !== undefined
        ? String(rawProduct.description)
        : undefined,
    category:
      rawProduct.category &&
      typeof rawProduct.category === "object"
        ? {
            name: String(
              (rawProduct.category as Record<string, unknown>)
                .name || ""
            ),
            slug: String(
              (rawProduct.category as Record<string, unknown>)
                .slug || ""
            ),
          }
        : null,
  };

  const images = Array.isArray(product.images)
    ? product.images.map((image) => String(image))
    : [];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm text-gray-500">
          <Link
            href="/"
            className="hover:text-green-700"
          >
            Home
          </Link>

          <span>/</span>

          <span className="text-gray-700">
            {product.name}
          </span>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Product Images */}
          <div>
            <div className="aspect-square overflow-hidden rounded-2xl border bg-white">
              {images.length > 0 ? (
                <img
                  src={images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-7xl">
                  🐔
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {images.slice(1, 5).map((image) => (
                  <div
                    key={image}
                    className="aspect-square overflow-hidden rounded-lg border bg-white"
                  >
                    <img
                      src={image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="rounded-2xl border bg-white p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              Poultry Product
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              {product.name}
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              SKU: {product.sku}
            </p>

            {/* Price */}
            <div className="mt-6">
              <span className="text-3xl font-bold text-gray-900">
                ₹{product.price.toLocaleString("en-IN")}
              </span>

              <span className="ml-2 text-gray-500">
                / {product.unit}
              </span>
            </div>

            {/* Stock */}
            <div className="mt-5">
              {product.stock > 0 ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  In stock — {product.stock} available
                </span>
              ) : (
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                  Out of stock
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-8 border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Product Description
                </h2>

                <p className="mt-3 whitespace-pre-line leading-7 text-gray-600">
                  {product.description}
                </p>
              </div>
            )}

            {/* Category */}
            {product.category?.name && (
              <div className="mt-6">
                <span className="text-sm text-gray-500">
                  Category:
                </span>

                <span className="ml-2 text-sm font-semibold text-gray-800">
                  {product.category.name}
                </span>
              </div>
            )}

            {/* Add To Cart */}
            <div className="mt-8">
              <AddToCartButton
                productId={String(product._id)}
                stock={product.stock}
              />
            </div>

            <p className="mt-4 text-center text-xs text-gray-500">
              Stock and final pricing are verified before order
              confirmation.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
