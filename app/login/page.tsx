import Link from "next/link";

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-[70vh] bg-gray-50 py-16">
      <div className="mx-auto max-w-md px-4">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-green-600">
              Poultry Farming Store
            </p>

            <h1 className="mt-2 text-3xl font-black text-gray-900">
              Customer Login
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Sign in to continue shopping and place your order.
            </p>
          </div>

          <div className="mt-8">
            <LoginForm />
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-green-600 hover:text-green-700"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}