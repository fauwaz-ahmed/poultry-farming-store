import Link from "next/link";

import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-[70vh] bg-gray-50 py-16">
      <div className="mx-auto max-w-md px-4">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-green-600">
              Poultry Farming Store
            </p>

            <h1 className="mt-2 text-3xl font-black text-gray-900">
              Create Account
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Create your customer account to place orders.
            </p>
          </div>

          <div className="mt-8">
            <RegisterForm />
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-green-600 hover:text-green-700"
            >
              Customer Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}