"use client";

import { useState } from "react";

import { deleteProduct } from "@/lib/admin-product-actions";

type DeleteProductButtonProps = {
  productId: string;
  productName: string;
};

export function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${productName}" permanently?`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await deleteProduct(productId);

      if (!result.success) {
        setError(result.message || "Unable to delete product.");
        setLoading(false);
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error("DELETE PRODUCT ERROR:", error);

      setError("Unable to delete product. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>

      {error && (
        <p className="mt-2 max-w-[220px] text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
