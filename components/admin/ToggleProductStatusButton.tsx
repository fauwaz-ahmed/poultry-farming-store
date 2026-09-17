"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleProductActive } from "@/lib/admin-product-actions";

type ToggleProductStatusButtonProps = {
  productId: string;
  productName: string;
  active: boolean;
};

export function ToggleProductStatusButton({
  productId,
  productName,
  active,
}: ToggleProductStatusButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    const action = active ? "deactivate" : "activate";

    const confirmed = window.confirm(
      active
        ? `Are you sure you want to deactivate "${productName}"? Customers will no longer see this product.`
        : `Are you sure you want to activate "${productName}"? Customers will be able to see this product.`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const result = await toggleProductActive(productId);

      if (!result.success) {
        window.alert(result.message);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(`PRODUCT ${action.toUpperCase()} ERROR:`, error);

      window.alert(
        `Failed to ${action} the product. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
     className={`inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? "border-red-200 text-red-700 hover:bg-red-50"
          : "border-green-200 text-green-700 hover:bg-green-50"
      }`}
    >
      {loading
        ? "Updating..."
        : active
          ? "Deactivate"
          : "Activate"}
    </button>
  );
}