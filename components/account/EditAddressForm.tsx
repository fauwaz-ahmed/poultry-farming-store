"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAddress } from "@/lib/address-actions";

type AddressData = {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

type EditAddressFormProps = {
  address: AddressData;
};

export function EditAddressForm({
  address,
}: EditAddressFormProps) {
  const router = useRouter();

  const [label, setLabel] = useState(address.label || "");
  const [fullName, setFullName] = useState(address.fullName || "");
  const [phone, setPhone] = useState(address.phone || "");
  const [addressLine, setAddressLine] = useState(address.address || "");
  const [city, setCity] = useState(address.city || "");
  const [state, setState] = useState(address.state || "");
  const [pincode, setPincode] = useState(address.pincode || "");
  const [isDefault, setIsDefault] = useState(
    Boolean(address.isDefault),
  );

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const result = await updateAddress(address._id, {
      label,
      fullName,
      phone,
      address: addressLine,
      city,
      state,
      pincode,
      isDefault,
    });

    if (!result.success) {
      setError(result.message || "Unable to update address.");
      setLoading(false);
      return;
    }

    router.push("/account/addresses");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="label"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Address Label
        </label>

        <input
          id="label"
          type="text"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Home, Farm, Office"
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-green-600"
        />
      </div>

      <div>
        <label
          htmlFor="fullName"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Full Name
        </label>

        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-green-600"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Phone
        </label>

        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-green-600"
        />
      </div>

      <div>
        <label
          htmlFor="address"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Address
        </label>

        <textarea
          id="address"
          value={addressLine}
          onChange={(event) => setAddressLine(event.target.value)}
          required
          rows={3}
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-green-600"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="city"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            City
          </label>

          <input
            id="city"
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            required
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-green-600"
          />
        </div>

        <div>
          <label
            htmlFor="state"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            State
          </label>

          <input
            id="state"
            type="text"
            value={state}
            onChange={(event) => setState(event.target.value)}
            required
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-green-600"
          />
        </div>

        <div>
          <label
            htmlFor="pincode"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Pincode
          </label>

          <input
            id="pincode"
            type="text"
            value={pincode}
            onChange={(event) => setPincode(event.target.value)}
            required
            maxLength={6}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-green-600"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(event) => setIsDefault(event.target.checked)}
          className="h-4 w-4"
        />

        Make this my default address
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-green-700 px-5 py-2.5 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Address"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/account/addresses")}
          className="rounded-lg border px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}