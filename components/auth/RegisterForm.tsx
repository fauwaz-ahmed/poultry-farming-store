"use client";

import { useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { registerCustomer } from "@/lib/customer-actions";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function getSafeNextPath() {
    const next = searchParams.get("next");

    if (!next) {
      return "/";
    }

    if (
      !next.startsWith("/") ||
      next.startsWith("//")
    ) {
      return "/";
    }

    if (next.startsWith("/admin")) {
      return "/";
    }

    return next;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await registerCustomer({
        name,
        email,
        phone,
        password,
      });

      if (!result.success) {
        setError(
          result.message ||
            "Unable to create your account."
        );

        setLoading(false);
        return;
      }

      router.push(getSafeNextPath());
      router.refresh();
    } catch (error) {
      console.error(
        "REGISTRATION ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating your account."
      );

      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-bold text-gray-900"
        >
          Full Name
        </label>

        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          required
          maxLength={100}
          autoComplete="name"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          placeholder="Your full name"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-bold text-gray-900"
        >
          Email
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          required
          maxLength={150}
          autoComplete="email"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="mb-2 block text-sm font-bold text-gray-900"
        >
          Phone Number
        </label>

        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(event) =>
            setPhone(event.target.value)
          }
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
          htmlFor="password"
          className="mb-2 block text-sm font-bold text-gray-900"
        >
          Password
        </label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          required
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          placeholder="At least 8 characters"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-bold text-gray-900"
        >
          Confirm Password
        </label>

        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(event) =>
            setConfirmPassword(event.target.value)
          }
          required
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          placeholder="Enter password again"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Creating Account..."
          : "Create Account"}
      </button>
    </form>
  );
}