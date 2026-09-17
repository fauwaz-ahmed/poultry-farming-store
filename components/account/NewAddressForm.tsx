
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAddress } from "@/lib/address-actions";

type NewAddressFormProps = {
  defaultPhone?: string;
};

export function NewAddressForm({
  defaultPhone = "",
}: NewAddressFormProps) {
  const router = useRouter();

  const [label, setLabel] = useState("Home");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState(defaultPhone);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const result = await createAddress({
      label,
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
      instructions,
      isDefault,
    });

    if (!result.success) {
      setError(result.message || "Unable to save address.");
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
          required
          maxLength={50}
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
          maxLength={10}
          inputMode="numeric"
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
          value={address}
          onChange={(event) => setAddress(event.target.value)}
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
            inputMode="numeric"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-green-600"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="instructions"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Delivery Instructions
        </label>

        <textarea
          id="instructions"
          value={instructions}
          onChange={(event) =>
            setInstructions(event.target.value)
          }
          rows={3}
          maxLength={500}
          placeholder="Optional instructions for delivery"
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-green-600"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(event) =>
            setIsDefault(event.target.checked)
          }
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
