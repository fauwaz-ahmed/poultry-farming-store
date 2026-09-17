"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createProduct } from "@/lib/admin-product-actions";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type AddProductFormProps = {
  categories: Category[];
};

export function AddProductForm({ categories }: AddProductFormProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("piece");

  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [isActive, setIsActive] = useState(true);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleNameChange(value: string) {
    setName(value);

    if (!slug) {
      setSlug(generateSlug(value));
    }
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    setUploading(true);
    setUploadError("");
    setError("");

    try {
      const remainingSlots = 10 - images.length;

      if (remainingSlots <= 0) {
        setUploadError("A product can have a maximum of 10 images.");

        setUploading(false);
        event.target.value = "";
        return;
      }

      const selectedFiles = Array.from(files).slice(0, remainingSlots);

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to upload image.");
        }

        if (result.image?.url) {
          setImages((currentImages) => [...currentImages, result.image.url]);
        }
      }
    } catch (uploadError) {
      console.error("PRODUCT IMAGE UPLOAD ERROR:", uploadError);

      setUploadError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload image.",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function removeImage(index: number) {
    setImages((currentImages) =>
      currentImages.filter((_, imageIndex) => imageIndex !== index),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const result = await createProduct({
      name,
      slug,
      sku,
      categoryId,
      description,
      price: Number(price),
      stock: Number(stock),
      unit,
      images,
      isActive,
    });

    if (!result.success) {
      setError(result.message || "Unable to create product.");
      setLoading(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border bg-white p-6 shadow-sm"
    >
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold">
            Product name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            maxLength={150}
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-green-600"
            placeholder="Example: Broiler Finisher Feed"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Slug</label>

          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            maxLength={180}
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-green-600"
            placeholder="broiler-finisher-feed"
          />

          <p className="mt-1 text-xs text-gray-500">Used in the product URL.</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">SKU</label>

          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value.toUpperCase())}
            required
            maxLength={100}
            className="w-full rounded-lg border px-4 py-3 uppercase outline-none focus:border-green-600"
            placeholder="FEED-BROILER-FINISH-001"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Category</label>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-green-600"
          >
            <option value="" disabled>
              Select category
            </option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Unit</label>

          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
            className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-green-600"
          >
            <option value="piece">Piece</option>
            <option value="bag">Bag</option>
            <option value="bottle">Bottle</option>
            <option value="kg">Kg</option>
            <option value="gram">Gram</option>
            <option value="liter">Liter</option>
            <option value="pack">Pack</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Price (₹)</label>

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
            step="0.01"
            inputMode="decimal"
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-green-600"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Stock</label>

          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
            min="0"
            step="1"
            inputMode="numeric"
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-green-600"
            placeholder="0"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minLength={1}
            maxLength={5000}
            rows={5}
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-green-600"
            placeholder="Describe the product, usage, benefits, specifications, etc."
          />
        </div>

        <div className="md:col-span-2">
          <div className="rounded-2xl border p-5">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Product Images
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Upload up to 10 JPG, PNG, or WebP images. Maximum 5 MB per
                image.
              </p>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition hover:border-green-500 hover:bg-green-50">
              <div className="text-4xl">{uploading ? "⏳" : "📷"}</div>

              <div className="mt-3 font-bold text-gray-900">
                {uploading ? "Uploading..." : "Click to upload images"}
              </div>

              <div className="mt-1 text-sm text-gray-500">
                JPG, PNG or WebP · Max 5 MB each
              </div>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={uploading || images.length >= 10}
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {uploadError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                {uploadError}
              </div>
            )}

            {images.length > 0 && (
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-900">
                    Uploaded Images
                  </p>

                  <p className="text-xs text-gray-500">
                    {images.length}/10 images
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {images.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="overflow-hidden rounded-xl border bg-white"
                    >
                      <div className="aspect-square bg-gray-100">
                        <img
                          src={image}
                          alt={`${name || "Product"} image ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {images.length === 0 && (
              <div className="mt-4 rounded-xl border bg-gray-50 p-4 text-center text-sm text-gray-500">
                No product images added yet.
              </div>
            )}
          </div>
        </div>

        <label className="flex items-center gap-3 md:col-span-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4"
          />

          <span className="text-sm font-medium">
            Product is active and visible in the store
          </span>
        </label>
      </div>

      <div className="mt-7 flex gap-3">
        <button
          type="submit"
          disabled={loading || uploading || categories.length === 0}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Product"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-lg border px-5 py-3 font-semibold"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
