import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { AddProductForm } from "@/components/admin/AddProductForm";

export default async function NewProductPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/admin/login");
  }

  await connectDB();

  const categories = await Category.find({
    active: true,
  })
    .sort({
      name: 1,
    })
    .lean();

  const categoryOptions = categories.map((category: any) => ({
    id: category._id.toString(),
    name: String(category.name || ""),
    slug: String(category.slug || ""),
  }));

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-4xl px-4">
        <Link
          href="/admin/products"
          className="text-sm font-medium text-green-700 hover:underline"
        >
          ← Back to Products
        </Link>

        <div className="mt-4">
          <h1 className="text-3xl font-black text-gray-900">
            Add Product
          </h1>

          <p className="mt-2 text-gray-600">
            Create a new product for your poultry store.
          </p>
        </div>

        <div className="mt-7">
          <AddProductForm
            categories={categoryOptions}
          />
        </div>
      </div>
    </main>
  );
}