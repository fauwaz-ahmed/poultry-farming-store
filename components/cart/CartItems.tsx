"use client";

import { useState } from "react";
import Link from "next/link";

import { removeFromCart, updateCartItem } from "@/lib/cart-actions";

type Product = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  unit: string;
  stock: number;
  images?: string[];
};

type CartItem = {
  product: Product;
  quantity: number;
};

type Props = {
  items: CartItem[];
};

export function CartItems({ items: initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );

  async function changeQuantity(productId: string, quantity: number) {
    if (quantity < 1) return;

    setLoading(productId);
    setError("");

    try {
      const result = await updateCartItem(productId, quantity);

      if (result?.success === false) {
  throw new Error("Unable to remove item.");
}

      setItems((current) =>
        current.map((item) =>
          item.product._id === productId
            ? {
                ...item,
                quantity,
              }
            : item,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update cart.");
    } finally {
      setLoading(null);
    }
  }

  async function remove(productId: string) {
    setLoading(productId);
    setError("");

    try {
      const result = await removeFromCart(productId);

     if (result?.success === false) {
  throw new Error("Unable to remove item.");
}

      setItems((current) =>
        current.filter((item) => item.product._id !== productId),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove item.");
    } finally {
      setLoading(null);
    }
  }

  /*
   * Important:
   * Once the last item is removed, immediately show
   * the empty-cart state. This also removes the
   * Proceed to Checkout button.
   */
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
          🛒
        </div>

        <h2 className="mt-6 text-2xl font-bold text-gray-900">
          Your Cart is Empty
        </h2>

        <p className="mt-3 text-gray-600">
          You haven't added any products to your cart yet.
        </p>

        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* Cart Items */}
      <section className="min-w-0 space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {items.map((item) => {
          const product = item.product;
          const image = product.images?.[0];

          return (
            <article
              key={product._id}
              className="flex min-w-0 gap-4 rounded-xl border bg-white p-4 shadow-sm"
            >
              {/* Product Image */}
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {image ? (
                  <img
                    src={image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400">
                    No image
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${product.slug}`}
                  className="font-semibold text-gray-900 hover:text-green-600"
                >
                  {product.name}
                </Link>

                <p className="mt-1 text-sm text-gray-500">
                  ₹{product.price.toLocaleString("en-IN")}
                  {" / "}
                  {product.unit}
                </p>

                {/* Quantity Controls */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={loading === product._id || item.quantity <= 1}
                    onClick={() =>
                      changeQuantity(product._id, item.quantity - 1)
                    }
                    className="h-9 w-9 rounded border hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    −
                  </button>

                  <span className="w-8 text-center font-medium">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    disabled={
                      loading === product._id || item.quantity >= product.stock
                    }
                    onClick={() =>
                      changeQuantity(product._id, item.quantity + 1)
                    }
                    className="h-9 w-9 rounded border hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    +
                  </button>

                  <button
                    type="button"
                    disabled={loading === product._id}
                    onClick={() => remove(product._id)}
                    className="ml-1 text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                  >
                    {loading === product._id ? "Removing..." : "Remove"}
                  </button>
                </div>
              </div>

              {/* Item Total */}
              <div className="shrink-0 text-right font-semibold text-gray-900">
                ₹{(product.price * item.quantity).toLocaleString("en-IN")}
              </div>
            </article>
          );
        })}
      </section>

      {/* Order Summary */}
      <aside className="min-w-0 rounded-xl border bg-white p-6 shadow-sm lg:sticky lg:top-24">
        <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-4 text-gray-600">
            <span>Subtotal</span>

            <span className="shrink-0 font-semibold text-gray-900">
              ₹{subtotal.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-start justify-between gap-4 text-gray-600">
            <span>Delivery</span>

            <span className="text-right text-sm text-gray-500">
              Calculated at checkout
            </span>
          </div>

          <div className="border-t pt-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-lg font-bold text-gray-900">Total</span>

              <span className="shrink-0 text-xl font-bold text-green-700">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Final total including delivery will be shown at checkout.
            </p>
          </div>
        </div>

        {/* Checkout */}
        <Link
          href="/checkout"
          className="mt-6 block w-full rounded-xl bg-green-600 px-5 py-4 text-center font-bold text-white transition hover:bg-green-700"
        >
          Proceed to Checkout
        </Link>

        {/* COD Notice */}
        <div className="mt-4 rounded-lg bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-800">
            💵 Cash on Delivery Available
          </p>

          <p className="mt-1 text-xs leading-5 text-green-700">
            Pay when your poultry products are delivered.
          </p>
        </div>
      </aside>
    </div>
  );
}
