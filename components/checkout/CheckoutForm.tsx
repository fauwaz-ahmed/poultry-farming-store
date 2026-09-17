"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createCodOrder } from "@/lib/order-actions";

type CheckoutItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type CheckoutFormProps = {
  items: CheckoutItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  grandTotal: number;
  customer: {
    name: string;
    phone: string;
    email: string;
  };

  savedAddresses: {
    id: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    instructions: string;
    isDefault: boolean;
  }[];
};

export function CheckoutForm({
  items,
  subtotal,
  deliveryFee,
  discount,
  grandTotal,
  customer,
  savedAddresses,
}: CheckoutFormProps) {
  const router = useRouter();

  const defaultAddress =
    savedAddresses.find((address) => address.isDefault) || savedAddresses[0];

  const [selectedAddressId, setSelectedAddressId] = useState(
    defaultAddress?.id || "",
  );

  const [fullName, setFullName] = useState(
    defaultAddress?.fullName || customer.name,
  );

  const [phone, setPhone] = useState(defaultAddress?.phone || customer.phone);

  const [email, setEmail] = useState(customer.email);

  const [address, setAddress] = useState(defaultAddress?.address || "");

  const [city, setCity] = useState(defaultAddress?.city || "");

  const [state, setState] = useState(defaultAddress?.state || "");

  const [pincode, setPincode] = useState(defaultAddress?.pincode || "");

  const [instructions, setInstructions] = useState(
    defaultAddress?.instructions || "",
  );

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await createCodOrder({
        fullName,
        phone,
        email,
        address,
        city,
        state,
        pincode,
        instructions,
      });

      if (!result.success) {
        setError(result.message || "Unable to place your order.");

        setLoading(false);
        return;
      }

      if (
        !result.success ||
        !("orderNumber" in result) ||
        !result.orderNumber
      ) {
        setError("Order was created, but the order number could not be found.");

        setLoading(false);
        return;
      }

      router.push(
        `/order-success?orderNumber=${encodeURIComponent(result.orderNumber)}`,
      );
    } catch (error) {
      console.error("CHECKOUT SUBMIT ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while placing your order.",
      );

      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
      {/* LEFT SIDE */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-gray-900">
            Delivery Information
          </h2>
          {savedAddresses.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-gray-900">
                  Saved Addresses
                </h3>

                <a
                  href="/account/addresses/new"
                  className="text-sm font-semibold text-green-700 hover:underline"
                >
                  + Add new address
                </a>
              </div>

              <div className="mt-3 grid gap-3">
                {savedAddresses.map((savedAddress) => (
                  <button
                    key={savedAddress.id}
                    type="button"
                    onClick={() => {
                      setSelectedAddressId(savedAddress.id);

                      setFullName(savedAddress.fullName);
                      setPhone(savedAddress.phone);
                      setAddress(savedAddress.address);
                      setCity(savedAddress.city);
                      setState(savedAddress.state);
                      setPincode(savedAddress.pincode);
                      setInstructions(savedAddress.instructions || "");
                    }}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      selectedAddressId === savedAddress.id
                        ? "border-green-600 bg-green-50 ring-2 ring-green-200"
                        : "hover:border-green-500 hover:bg-green-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-gray-900">
                          {savedAddress.fullName}
                        </p>

                        <p className="mt-1 text-sm text-gray-600">
                          {savedAddress.phone}
                        </p>

                        <p className="mt-2 text-sm text-gray-700">
                          {savedAddress.address}
                        </p>

                        <p className="text-sm text-gray-700">
                          {savedAddress.city}, {savedAddress.state} -{" "}
                          {savedAddress.pincode}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        {savedAddress.isDefault && (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                            Default
                          </span>
                        )}

                        {selectedAddressId === savedAddress.id && (
                          <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="mt-1 text-sm text-gray-500">
            Enter the address where you want your order delivered.
          </p>

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-bold text-gray-900"
              >
                Full Name *
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                maxLength={100}
                autoComplete="name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-bold text-gray-900"
              >
                Phone Number *
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
                maxLength={10}
                inputMode="numeric"
                autoComplete="tel"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                placeholder="10-digit mobile number"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold text-gray-900"
              >
                Email
                <span className="ml-1 font-normal text-gray-500">
                  (optional)
                </span>
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={150}
                autoComplete="email"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                placeholder="you@example.com"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-bold text-gray-900"
              >
                Address *
              </label>

              <textarea
                id="address"
                name="address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                required
                maxLength={300}
                rows={3}
                autoComplete="street-address"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                placeholder="House number, village/locality, street"
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="mb-2 block text-sm font-bold text-gray-900"
              >
                City *
              </label>

              <input
                id="city"
                name="city"
                type="text"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                required
                maxLength={100}
                autoComplete="address-level2"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                placeholder="City"
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="mb-2 block text-sm font-bold text-gray-900"
              >
                State *
              </label>

              <input
                id="state"
                name="state"
                type="text"
                value={state}
                onChange={(event) => setState(event.target.value)}
                required
                maxLength={100}
                autoComplete="address-level1"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                placeholder="State"
              />
            </div>

            <div>
              <label
                htmlFor="pincode"
                className="mb-2 block text-sm font-bold text-gray-900"
              >
                Pincode *
              </label>

              <input
                id="pincode"
                name="pincode"
                type="text"
                value={pincode}
                onChange={(event) => setPincode(event.target.value)}
                required
                maxLength={6}
                inputMode="numeric"
                autoComplete="postal-code"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                placeholder="6-digit pincode"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="instructions"
                className="mb-2 block text-sm font-bold text-gray-900"
              >
                Delivery Instructions
                <span className="ml-1 font-normal text-gray-500">
                  (optional)
                </span>
              </label>

              <textarea
                id="instructions"
                name="instructions"
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                maxLength={500}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                placeholder="Any instructions for delivery?"
              />
            </div>
          </div>
        </div>

        {/* PAYMENT */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-gray-900">Payment Method</h2>

          <div className="mt-5 rounded-xl border-2 border-green-600 bg-green-50 p-5">
            <div className="flex items-start gap-4">
              <input
                id="cod"
                type="radio"
                name="paymentMethod"
                value="cod"
                checked
                readOnly
                className="mt-1 h-4 w-4 accent-green-600"
              />

              <div>
                <label htmlFor="cod" className="font-bold text-gray-900">
                  Cash on Delivery
                </label>

                <p className="mt-1 text-sm text-gray-600">
                  Pay for your order when it is delivered.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-gray-900">Order Summary</h2>

          <div className="mt-5 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-3 border-b pb-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">{item.name}</p>

                  <p className="mt-1 text-sm text-gray-500">
                    Qty: {item.quantity}
                  </p>
                </div>

                <p className="font-bold text-gray-900">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3 border-b pb-5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>

              <span className="font-semibold text-gray-900">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Delivery</span>

              <span className="font-semibold text-gray-900">
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Discount</span>

              <span className="font-semibold text-gray-900">
                -₹{discount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <span className="text-lg font-black text-gray-900">Total</span>

            <span className="text-2xl font-black text-green-700">
              ₹{grandTotal.toFixed(2)}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Placing Order..." : "Place COD Order"}
          </button>

          <p className="mt-3 text-center text-xs text-gray-500">
            You will pay cash when your order is delivered.
          </p>
        </div>
      </div>
    </form>
  );
}
