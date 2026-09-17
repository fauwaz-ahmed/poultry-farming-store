import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { NewAddressForm } from "@/components/account/NewAddressForm";

export default async function NewAddressPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "customer") {
    redirect("/login?next=/account/addresses/new");
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-3xl px-4">
        <Link
          href="/account/addresses"
          className="text-sm font-medium text-green-700 hover:underline"
        >
          ← Back to Addresses
        </Link>

        <div className="mt-4">
          <h1 className="text-3xl font-black text-gray-900">
            Add New Address
          </h1>

          <p className="mt-2 text-gray-600">
            Save a delivery address for faster checkout.
          </p>
        </div>

        <div className="mt-7">
          <NewAddressForm
            defaultPhone={user.phone || ""}
          />
        </div>
      </div>
    </main>
  );
}