"use client";

import { useState } from "react";
import Link from "next/link";

import { addToCart } from "@/lib/cart-actions";

type Props = {
  productId: string;
  stock: number;
};

export function AddToCartButton({
  productId,
  stock,
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleAddToCart() {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const result = await addToCart(productId, quantity);

      if (result?.success === false) {
        throw new Error(
          result.message || "Unable to add product to cart."
        );
      }

      setMessage(
        result?.message || "Product added to cart!"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while adding the product."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleQuantityInput(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;

    if (value === "") {
      setQuantity(0);
      return;
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return;
    }

    setQuantity(
      Math.min(
        stock,
        Math.max(1, Math.floor(numericValue))
      )
    );
  }

  function handleQuantityBlur() {
    if (quantity < 1 || !Number.isFinite(quantity)) {
      setQuantity(1);
      return;
    }

    if (quantity > stock) {
      setQuantity(stock);
    }
  }

  function decreaseQuantity() {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  }

  function increaseQuantity() {
    setQuantity((current) =>
      Math.min(stock, current + 1)
    );
  }

  if (stock <= 0) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        Out of stock
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Quantity + Add To Cart */}
      <div className="flex w-full items-center gap-2 sm:gap-3">
        {/* Decrease */}
        <button
          type="button"
          disabled={loading || quantity <= 1}
          onClick={decreaseQuantity}
          aria-label="Decrease quantity"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-xl font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          −
        </button>

        {/* Manual Quantity */}
        <input
          type="number"
          min={1}
          max={stock}
          step={1}
          value={quantity === 0 ? "" : quantity}
          onChange={handleQuantityInput}
          onBlur={handleQuantityBlur}
          disabled={loading}
          aria-label="Product quantity"
          className="h-11 w-16 shrink-0 rounded-lg border border-gray-300 bg-white px-2 text-center font-semibold text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
        />

        {/* Increase */}
        <button
          type="button"
          disabled={loading || quantity >= stock}
          onClick={increaseQuantity}
          aria-label="Increase quantity"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-xl font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          +
        </button>

        {/* Add To Cart */}
        <button
          type="button"
          disabled={loading || quantity < 1}
          onClick={handleAddToCart}
          className="h-11 min-w-0 flex-1 rounded-lg bg-green-600 px-3 font-semibold whitespace-nowrap text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-7"
        >
          {loading ? "Adding..." : "Add to Cart"}
        </button>
      </div>

      {/* Cart Button */}
      <Link
        href="/cart"
        aria-label="View cart"
        title="View cart"
        className="flex h-11 w-full items-center justify-center rounded-lg border border-green-600 bg-white text-xl transition hover:bg-green-50"
      >
        🛒
        <span className="ml-2 text-sm font-semibold text-green-700">
          View Cart
        </span>
      </Link>

      {/* Success Message */}
      {message && (
        <div className="rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
          Error: {error}
        </div>
      )}
    </div>
  );
}
