import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Address from "@/models/Address";
import { getCurrentUser } from "@/lib/auth";
import { EditAddressForm } from "@/components/account/EditAddressForm";

type AddressData = {
  _id: unknown;
  label?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isDefault?: boolean;
};

type EditAddressPageProps = {
  params: Promise<{
    addressId: string;
  }>;
};

export default async function EditAddressPage({
  params,
}: EditAddressPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/account/addresses");
  }

  if (user.role !== "customer") {
    redirect("/");
  }

  const { addressId } = await params;

  await connectDB();

  const addressResult = await Address.findOne({
    _id: addressId,
    user: user.id,
  }).lean();

  if (!addressResult) {
    notFound();
  }

  const address = addressResult as unknown as AddressData;

  return (
    <main className="container-farm py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="font-bold text-farm-600">
            My Account
          </p>

          <h1 className="mt-1 text-3xl font-black">
            Edit Address
          </h1>

          <p className="mt-2 text-gray-600">
            Update your delivery address details.
          </p>
        </div>

        <div className="card p-6">
          <EditAddressForm
            address={{
              _id: String(address._id),
              label: String(address.label || ""),
              fullName: String(address.fullName || ""),
              phone: String(address.phone || ""),
              address: String(address.address || ""),
              city: String(address.city || ""),
              state: String(address.state || ""),
              pincode: String(address.pincode || ""),
              isDefault: Boolean(address.isDefault),
            }}
          />
        </div>
      </div>
    </main>
  );
}
