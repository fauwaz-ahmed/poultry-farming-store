import Link from "next/link";

import { adminLogoutAction } from "@/lib/admin-auth-actions";
import { AdminMobileMenu } from "@/components/admin/AdminMobileMenu";

export function AdminNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link
          href="/admin"
          className="text-xl font-black text-green-700"
        >
          🐔 DPoultryHub Admin
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-5 text-sm font-semibold md:flex">
          <Link
            href="/admin"
            className="text-gray-700 hover:text-green-700"
          >
            Dashboard
          </Link>

          <Link
            href="/admin/products"
            className="text-gray-700 hover:text-green-700"
          >
            Products
          </Link>

          <Link
            href="/admin/orders"
            className="text-gray-700 hover:text-green-700"
          >
            Orders
          </Link>

          <Link
            href="/"
            className="text-gray-700 hover:text-green-700"
          >
            View Store
          </Link>

          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              Logout
            </button>
          </form>
        </nav>

        {/* Mobile navigation */}
        <AdminMobileMenu />
      </div>
    </header>
  );
}