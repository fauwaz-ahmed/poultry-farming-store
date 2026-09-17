"use client";

import { useState } from "react";

import { cancelCustomerOrder } from "@/lib/order-actions";

type Props = {
  orderNumber: string;
};

export function CancelOrderButton({
  orderNumber,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCancel() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?\n\nThe reserved stock will be released back into inventory."
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result =
        await cancelCustomerOrder(orderNumber);

      if (!result.success) {
        setError(
          result.message ||
            "Unable to cancel the order."
        );
        return;
      }

      window.location.reload();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while cancelling the order."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleCancel}
        disabled={loading}
        className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Cancelling..."
          : "Cancel Order"}
      </button>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
