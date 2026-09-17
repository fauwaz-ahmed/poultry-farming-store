import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { customerLogoutAction } from "@/lib/customer-auth-actions";
import { EditProfileForm } from "@/components/account/EditProfileForm";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "customer") {
    redirect("/login?next=/account");
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-5xl px-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-green-700">
            My Account
          </p>

          <h1 className="mt-2 text-3xl font-black text-gray-900">
            Welcome, {user.name}
          </h1>

          <p className="mt-2 text-gray-600">
            Manage your orders, addresses and account.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/account/orders"
            className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-green-500 hover:bg-green-50"
          >
            <div className="text-4xl">📦</div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              My Orders
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              View your orders and track their status.
            </p>
          </Link>

          <Link
            href="/account/addresses"
            className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-green-500 hover:bg-green-50"
          >
            <div className="text-4xl">📍</div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Saved Addresses
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Add, edit or remove your delivery addresses.
            </p>
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-green-700">
              Profile
            </p>

            <h2 className="mt-1 text-2xl font-black text-gray-900">
              Account Details
            </h2>
          </div>

          <EditProfileForm
            name={user.name}
            phone={user.phone}
            email={user.email}
          />
        </div>

        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <form action={customerLogoutAction}>
            <button
              type="submit"
              className="rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-700 hover:bg-red-50"
            >
              🚪 Logout
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}