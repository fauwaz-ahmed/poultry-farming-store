"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { deleteAddress } from "@/lib/address-actions";

type DeleteAddressButtonProps = {
  addressId: string;
};

export function DeleteAddressButton({
  addressId,
}: DeleteAddressButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    const result = await deleteAddress(addressId);

    if (!result.success) {
      window.alert(result.message);
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}