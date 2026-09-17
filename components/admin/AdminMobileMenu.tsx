"use client";

import Link from "next/link";
import { useState } from "react";

import { adminLogoutAction } from "@/lib/admin-auth-actions";

export function AdminMobileMenu() {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="rounded-lg border bg-white px-3 py-2 text-xl font-bold text-gray-800"
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-16 border-b bg-white shadow-lg">
          <nav className="mx-auto max-w-7xl px-4 py-4">
            <div className="grid gap-2">
              <Link
                href="/admin"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 font-semibold text-gray-800 hover:bg-green-50 hover:text-green-700"
              >
                🏠 Dashboard
              </Link>

              <Link
                href="/admin/products"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 font-semibold text-gray-800 hover:bg-green-50 hover:text-green-700"
              >
                📦 Products
              </Link>

              <Link
                href="/admin/orders"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 font-semibold text-gray-800 hover:bg-green-50 hover:text-green-700"
              >
                🧾 Orders
              </Link>

              <Link
                href="/"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 font-semibold text-gray-800 hover:bg-green-50 hover:text-green-700"
              >
                🛒 View Store
              </Link>

              <form action={adminLogoutAction}>
                <button
                  type="submit"
                  className="w-full rounded-xl px-4 py-3 text-left font-semibold text-red-700 hover:bg-red-50"
                >
                  🚪 Logout
                </button>
              </form>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}