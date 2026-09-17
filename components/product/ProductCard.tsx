import Link from "next/link";

type ProductCardProps = {
  product: {
    _id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    unit: string;
    stock: number;
    images: string[];
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images?.[0];

  return (
    <article className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square bg-gray-100">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl">
              🐔
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <p className="text-xs text-gray-500">
          SKU: {product.sku}
        </p>

        <Link href={`/products/${product.slug}`}>
          <h2 className="mt-1 line-clamp-2 text-lg font-semibold text-gray-900 hover:text-green-700">
            {product.name}
          </h2>
        </Link>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <span className="text-xl font-bold text-gray-900">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>

            <span className="ml-1 text-sm text-gray-500">
              / {product.unit}
            </span>
          </div>

          {product.stock > 0 ? (
            <span className="text-xs font-medium text-green-700">
              In stock
            </span>
          ) : (
            <span className="text-xs font-medium text-red-600">
              Out of stock
            </span>
          )}
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="mt-4 block rounded-lg bg-green-700 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-green-800"
        >
          View Product
        </Link>
      </div>
    </article>
  );
}