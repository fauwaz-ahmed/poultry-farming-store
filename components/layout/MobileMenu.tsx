"use client";

import Link from "next/link";
import { useState } from "react";

import { customerLogoutAction } from "@/lib/customer-auth-actions";

type MobileMenuProps = {
  isLoggedIn: boolean;
  isCustomer: boolean;
};

export function MobileMenu({ isLoggedIn, isCustomer }: MobileMenuProps) {
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
                href="/chickens"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 font-semibold text-gray-800 hover:bg-green-50 hover:text-green-700"
              >
                🐔 Chickens
              </Link>

              <Link
                href="/poultry-feed"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 font-semibold text-gray-800 hover:bg-green-50 hover:text-green-700"
              >
                🌾 Poultry Feed
              </Link>

              <Link
                href="/poultry-medicines"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 font-semibold text-gray-800 hover:bg-green-50 hover:text-green-700"
              >
                🧴 Medicines
              </Link>

              <Link
                href="/farm-equipment"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 font-semibold text-gray-800 hover:bg-green-50 hover:text-green-700"
              >
                ⚙️ Farm Equipment
              </Link>

              <Link
                href="/about"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 font-semibold text-gray-800 hover:bg-green-50 hover:text-green-700"
              >
                About
              </Link>

              <Link
                href="/contact"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 font-semibold text-gray-800 hover:bg-green-50 hover:text-green-700"
              >
                Contact
              </Link>

              {isCustomer && (
                <>
                  <Link
                    href="/account"
                    onClick={closeMenu}
                    className="rounded-xl px-4 py-3 font-semibold text-gray-800 hover:bg-green-50 hover:text-green-700"
                  >
                    👤 My Account
                  </Link>

                  <Link
                    href="/cart"
                    onClick={closeMenu}
                    className="rounded-xl bg-green-50 px-4 py-3 font-semibold text-green-700"
                  >
                    🛒 Cart
                  </Link>

                  <form action={customerLogoutAction}>
                    <button
                      type="submit"
                      className="w-full rounded-xl px-4 py-3 text-left font-semibold text-red-700 hover:bg-red-50"
                    >
                      🚪 Logout
                    </button>
                  </form>
                </>
              )}

              {!isLoggedIn && (
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="w-full rounded-xl px-4 py-3 text-left font-semibold text-green-700 hover:bg-green-50"
                >
                  🔐 Login
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
