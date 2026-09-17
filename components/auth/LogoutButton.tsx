"use client";

import { useState } from "react";

import { customerLogoutAction } from "@/lib/customer-auth-actions";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      await customerLogoutAction();
    } catch (error) {
      console.error("LOGOUT ERROR:", error);

      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}