import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Address from "@/models/Address";
import { DeleteAddressButton } from "@/components/account/DeleteAddressButton";

export default async function AddressesPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "customer") {
    redirect("/login?next=/account/addresses");
  }

  await connectDB();

  const addresses = await Address.find({
    customer: user.id,
  })
    .sort({
      isDefault: -1,
      createdAt: -1,
    })
    .lean();

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/account"
              className="text-sm font-medium text-green-700 hover:underline"
            >
              ← Back to Account
            </Link>

            <h1 className="mt-3 text-3xl font-black text-gray-900">
              Saved Addresses
            </h1>

            <p className="mt-2 text-gray-600">
              Manage your delivery addresses.
            </p>
          </div>

          <Link
            href="/account/addresses/new"
            className="btn btn-primary"
          >
            + Add New Address
          </Link>
        </div>

        {addresses.length === 0 ? (
          <div className="mt-8 rounded-2xl border bg-white p-10 text-center shadow-sm">
            <div className="text-5xl">📍</div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              No saved addresses yet
            </h2>

            <p className="mt-2 text-gray-600">
              Add a delivery address to make checkout faster.
            </p>

            <Link
              href="/account/addresses/new"
              className="btn btn-primary mt-6 inline-flex"
            >
              Add Your First Address
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {addresses.map((address: any) => (
              <div
                key={address._id.toString()}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {address.fullName}
                    </h2>

                    {address.isDefault && (
                      <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Link
                      href={`/account/addresses/${address._id.toString()}/edit`}
                      className="rounded-lg border px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
                    >
                      Edit
                    </Link>

                    <DeleteAddressButton
                      addressId={address._id.toString()}
                    />
                  </div>
                </div>

                <div className="mt-5 space-y-1 text-sm text-gray-700">
                  <p>{address.phone}</p>

                  <p className="pt-2">
                    {address.address}
                  </p>

                  <p>
                    {address.city}, {address.state} -{" "}
                    {address.pincode}
                  </p>
                </div>

                {address.instructions && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                    <span className="font-semibold">
                      Delivery instructions:
                    </span>{" "}
                    {address.instructions}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}