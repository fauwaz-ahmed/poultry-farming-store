"use client";

import { useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { loginCustomer } from "@/lib/auth-actions";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    setLoading(true);
    setError("");

    try {
      const result = await loginCustomer(
        email,
        password
      );

      if (!result.success) {
        setError(
          result.message ||
            "Invalid email or password."
        );

        setLoading(false);
        return;
      }

      const nextPath = getSafeNextPath();

      router.push(nextPath);
      router.refresh();
    } catch (error) {
      console.error(
        "CUSTOMER LOGIN ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while logging in."
      );

      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-bold text-gray-900"
          >
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
            autoComplete="email"
            maxLength={150}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            placeholder="you@example.com"
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
            name="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>
      </form>
    </div>
  );
}