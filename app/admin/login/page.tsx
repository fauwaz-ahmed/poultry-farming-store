import { AdminLoginForm } from "@/components/auth/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="mx-auto max-w-md px-4">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-green-600">
              Poultry Farming Store
            </p>

            <h1 className="mt-2 text-3xl font-black text-gray-900">
              Admin Login
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Authorized administrators only.
            </p>
          </div>

          <div className="mt-8">
            <AdminLoginForm />
          </div>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm font-semibold text-gray-600 hover:text-green-600"
            >
              ← Back to store
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}