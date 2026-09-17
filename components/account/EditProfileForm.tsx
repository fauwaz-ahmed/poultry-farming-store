"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { updateCustomerProfile } from "@/lib/customer-profile-actions";

type EditProfileFormProps = {
  name: string;
  phone: string;
  email: string;
};

export function EditProfileForm({
  name,
  phone,
  email,
}: EditProfileFormProps) {
  const router = useRouter();

  const [customerName, setCustomerName] = useState(name);
  const [customerPhone, setCustomerPhone] = useState(phone);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const result = await updateCustomerProfile(
      customerName,
      customerPhone
    );

    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }

    setMessage(result.message);
    setLoading(false);

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-5"
    >
      <div>
        <label
          htmlFor="profile-name"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Full Name
        </label>

        <input
          id="profile-name"
          type="text"
          value={customerName}
          onChange={(event) =>
            setCustomerName(event.target.value)
          }
          maxLength={100}
          required
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />
      </div>

      <div>
        <label
          htmlFor="profile-phone"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Phone Number
        </label>

        <input
          id="profile-phone"
          type="tel"
          inputMode="numeric"
          value={customerPhone}
          onChange={(event) =>
            setCustomerPhone(
              event.target.value.replace(/\D/g, "").slice(0, 10)
            )
          }
          maxLength={10}
          required
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />
      </div>

      <div>
        <label
          htmlFor="profile-email"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Email
        </label>

        <input
          id="profile-email"
          type="email"
          value={email}
          disabled
          className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500"
        />

        <p className="mt-2 text-xs text-gray-500">
          Email is used for login and cannot be changed here.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl bg-green-50 p-3 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}