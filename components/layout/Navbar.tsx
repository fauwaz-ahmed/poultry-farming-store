import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { MobileMenu } from "@/components/layout/MobileMenu";

export async function Navbar() {
  const user = await getCurrentUser();

  const isLoggedIn = Boolean(user);
  const isCustomer = user?.role === "customer";

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="container-farm flex h-16 items-center justify-between gap-4">
        <Link href="/" className="shrink-0 text-xl font-black text-farm-700">
          🐔 DPoultryHub
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-5 text-sm font-semibold md:flex">
          <Link href="/chickens">Chickens</Link>

          <Link href="/poultry-feed">Poultry Feed</Link>

          <Link href="/poultry-medicines">Medicines</Link>

          <Link href="/farm-equipment">Farm Equipment</Link>

          <Link href="/about">About</Link>

          <Link href="/contact">Contact</Link>

          {isCustomer && (
            <>
            </>
          )}

          {user?.role === "admin" && <Link href="/admin">Admin</Link>}
        </nav>

        {/* Mobile navigation */}
        <div className="md:hidden">
          <MobileMenu isLoggedIn={isLoggedIn} isCustomer={isCustomer} />
        </div>

        {/* Right-side desktop actions */}
<div className="hidden items-center gap-2 md:flex">
  {!isLoggedIn && (
    <Link
      href="/login"
      className="rounded-lg border border-green-200 px-4 py-2.5 text-sm font-bold text-green-700 transition hover:bg-green-50"
    >
      🔐 Login
    </Link>
  )}
  
{isCustomer && (
  <>
    <Link
      href="/account"
      className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
    >
      👤 My Account
    </Link>

    <LogoutButton />

    <Link
      className="btn btn-primary text-sm"
      href="/cart"
    >
      🛒 Cart
    </Link>
  </>
)}
</div>
      </div>
    </header>
  );
}
