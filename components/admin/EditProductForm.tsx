"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { updateProduct } from "@/lib/admin-product-actions";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  price: number;
  stock: number;
  unit: string;
  description: string;
  images: string[];
  isActive: boolean;
};

type EditProductFormProps = {
  product: Product;
  categories: Category[];
};

export function EditProductForm({
  product,
  categories,
}: EditProductFormProps) {
  const router = useRouter();

  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [sku, setSku] = useState(product.sku);
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock));
  const [unit, setUnit] = useState(product.unit);
  const [description, setDescription] = useState(
    product.description
  );

  const [images, setImages] = useState<string[]>(
    product.images || []
  );

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [isActive, setIsActive] = useState(
    product.isActive
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    setUploading(true);
    setUploadError("");
    setError("");
    setSuccess("");

    try {
      const remainingSlots = 10 - images.length;

      if (remainingSlots <= 0) {
        setUploadError(
          "A product can have a maximum of 10 images."
        );
        setUploading(false);
        event.target.value = "";
        return;
      }

      const selectedFiles = Array.from(files).slice(
        0,
        remainingSlots
      );

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          "/api/admin/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Unable to upload image."
          );
        }

        if (result.image?.url) {
          setImages((currentImages) => [
            ...currentImages,
            result.image.url,
          ]);
        }
      }
    } catch (uploadError) {
      console.error(
        "PRODUCT IMAGE UPLOAD ERROR:",
        uploadError
      );

      setUploadError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload image."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function removeImage(index: number) {
    setImages((currentImages) =>
      currentImages.filter(
        (_, imageIndex) => imageIndex !== index
      )
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    const result = await updateProduct(product.id, {
      name,
      slug,
      sku,
      categoryId,
      price: Number(price),
      stock: Number(stock),
      unit,
      description,
      images,
      isActive,
    });

    if (!result.success) {
      setError(
        result.message ||
          "Unable to update product."
      );
      setLoading(false);
      return;
    }

    setSuccess(
      result.message ||
        "Product updated successfully."
    );

    setLoading(false);

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-bold text-gray-900">
          Product Name
        </label>

        <input
          value={name}
          onChange={(event) => {
            const value = event.target.value;

            setName(value);

            if (slug === product.slug) {
              setSlug(generateSlug(value));
            }
          }}
          className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-gray-900">
          Slug
        </label>

        <input
          value={slug}
          onChange={(event) =>
            setSlug(
              generateSlug(event.target.value)
            )
          }
          className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
          required
        />

        <p className="mt-1 text-xs text-gray-500">
          Example: broiler-chicks
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-gray-900">
          SKU
        </label>

        <input
          value={sku}
          onChange={(event) =>
            setSku(
              event.target.value.toUpperCase()
            )
          }
          className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-gray-900">
          Category
        </label>

        <select
          value={categoryId}
          onChange={(event) =>
            setCategoryId(event.target.value)
          }
          className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
          required
        >
          <option value="">
            Select category
          </option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-900">
            Price (₹)
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) =>
              setPrice(event.target.value)
            }
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-900">
            Stock
          </label>

          <input
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(event) =>
              setStock(event.target.value)
            }
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-900">
            Unit
          </label>

          <input
            value={unit}
            onChange={(event) =>
              setUnit(event.target.value)
            }
            placeholder="piece / bag / bottle"
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-gray-900">
          Description
        </label>

        <textarea
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          rows={6}
          className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
        />
      </div>

      <div className="rounded-2xl border p-5">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            Product Images
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Upload up to 10 JPG, PNG, or WebP images.
            Maximum 5 MB per image.
          </p>
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition hover:border-green-500 hover:bg-green-50">
          <div className="text-4xl">
            {uploading ? "⏳" : "📷"}
          </div>

          <div className="mt-3 font-bold text-gray-900">
            {uploading
              ? "Uploading..."
              : "Click to upload images"}
          </div>

          <div className="mt-1 text-sm text-gray-500">
            JPG, PNG or WebP · Max 5 MB each
          </div>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={
              uploading || images.length >= 10
            }
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
                      alt={`${name} image ${
                        index + 1
                      }`}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() =>
                        removeImage(index)
                      }
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

      <label className="flex items-center gap-3 rounded-xl border p-4">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) =>
            setIsActive(event.target.checked)
          }
          className="h-5 w-5"
        />

        <div>
          <div className="font-bold text-gray-900">
            Product is active
          </div>

          <div className="text-sm text-gray-500">
            Active products can be displayed and
            purchased.
          </div>
        </div>
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={loading || uploading}
          className="btn btn-primary"
        >
          {loading
            ? "Saving..."
            : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={() =>
            router.push("/admin/products")
          }
          className="rounded-xl border px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
