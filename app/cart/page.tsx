
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCart } from "@/lib/cart";
import { CartItems } from "@/components/cart/CartItems";
import { getCurrentUser } from "@/lib/auth";

export default async function CartPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "customer") {
    redirect("/login?next=/cart");
  }

  const cart = await getCart();

  if (
    !cart ||
    !cart.items ||
    cart.items.length === 0
  ) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
              🛒
            </div>

            <h1 className="mt-6 text-3xl font-bold text-gray-900">
              Your Cart is Empty
            </h1>

            <p className="mt-3 text-gray-600">
              You haven't added any products to your cart yet.
            </p>

            <Link
              href="/"
              className="mt-7 inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm font-medium text-green-700 hover:underline"
          >
            ← Continue Shopping
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Shopping Cart
          </h1>

          <p className="mt-2 text-gray-600">
            Review your products before checkout.
          </p>
        </div>

        {/* Cart */}
        <CartItems
          items={cart.items as any}
        />
      </div>
    </main>
  );
}
