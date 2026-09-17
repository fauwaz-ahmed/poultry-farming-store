"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";

type CreateProductData = {
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  description?: string;
  price: number;
  stock: number;
  unit: string;
  images?: string[];
  isActive?: boolean;
};

function validateProductData(data: CreateProductData) {
  const name = data.name?.trim() || "";
  const slug = data.slug?.trim().toLowerCase() || "";
  const sku = data.sku?.trim().toUpperCase() || "";
  const categoryId = data.categoryId?.trim() || "";
  const description = data.description?.trim() || "";
  const unit = data.unit?.trim().toLowerCase() || "";

  if (name.length < 2 || name.length > 150) {
    return {
      success: false,
      message: "Product name must be between 2 and 150 characters.",
    };
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 180) {
    return {
      success: false,
      message: "Slug must contain only lowercase letters, numbers and hyphens.",
    };
  }

  if (!/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(sku) || sku.length > 100) {
    return {
      success: false,
      message: "SKU must contain only uppercase letters, numbers and hyphens.",
    };
  }

  if (!categoryId) {
    return {
      success: false,
      message: "Category is required.",
    };
  }

  if (!Number.isFinite(data.price) || data.price < 0) {
    return {
      success: false,
      message: "Price must be a valid non-negative number.",
    };
  }

  if (!Number.isFinite(data.stock) || data.stock < 0) {
    return {
      success: false,
      message: "Stock must be a valid non-negative number.",
    };
  }

  if (unit.length < 1 || unit.length > 30) {
    return {
      success: false,
      message: "Unit must be between 1 and 30 characters.",
    };
  }

  if (description.length < 1 || description.length > 5000) {
    return {
      success: false,
      message: "Description must be between 1 and 5000 characters.",
    };
  }

  const images = Array.isArray(data.images)
    ? data.images
        .map((image) => String(image).trim())
        .filter(Boolean)
        .slice(0, 10)
    : [];

  return {
    success: true,
    data: {
      name,
      slug,
      sku,
      categoryId,
      description,
      price: Number(data.price),
      stock: Number(data.stock),
      unit,
      images,
      isActive: data.isActive !== false,
    },
  };
}

export async function createProduct(data: CreateProductData) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return {
        success: false,
        message: "Admin access required.",
      };
    }
    
    const validation = validateProductData(data);

    if (!validation.success) {
      return validation;
    }

    const validatedData = validation.data;

    if (!validatedData) {
      return {
        success: false,
        message: "Invalid product data.",
      };
    }

    await connectDB();

    const category = await Category.findById(validatedData.categoryId);

    if (!category) {
      return {
        success: false,
        message: "Selected category was not found.",
      };
    }

    const existingProduct = await Product.findOne({
      $or: [
        {
          sku: validatedData.sku,
        },
        {
          slug: validatedData.slug,
        },
      ],
    });

    if (existingProduct) {
      if (existingProduct.sku === validatedData.sku) {
        return {
          success: false,
          message: "A product with this SKU already exists.",
        };
      }

      if (existingProduct.slug === validatedData.slug) {
        return {
          success: false,
          message: "A product with this slug already exists.",
        };
      }
    }

    await Product.create({
      name: validatedData.name,
      slug: validatedData.slug,
      sku: validatedData.sku,
      category: category._id,
      description: validatedData.description,
      price: validatedData.price,
      stock: validatedData.stock,
      unit: validatedData.unit,
      images: validatedData.images,

      // Product model uses "active", not "isActive"
      active: validatedData.isActive,
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidatePath("/chickens");
    revalidatePath("/poultry-feed");
    revalidatePath("/poultry-medicines");
    revalidatePath("/farm-equipment");

    return {
      success: true,
      message: "Product created successfully.",
    };
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    return {
      success: false,
      message: "Something went wrong while creating the product.",
    };
  }
}

export async function updateProduct(
  productId: string,
  data: {
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
  },
) {
  const admin = await requireAdmin();

  if (!admin) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  if (!productId) {
    return {
      success: false,
      message: "Product ID is required.",
    };
  }

  const name = data.name?.trim() || "";
  const slug = data.slug?.trim().toLowerCase() || "";
  const sku = data.sku?.trim().toUpperCase() || "";
  const categoryId = data.categoryId?.trim() || "";
  const unit = data.unit?.trim() || "";
  const description = data.description?.trim() || "";

  const price = Number(data.price);
  const stock = Number(data.stock);

  if (!name || name.length < 2 || name.length > 200) {
    return {
      success: false,
      message: "Product name must be between 2 and 200 characters.",
    };
  }

  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return {
      success: false,
      message: "Please enter a valid product slug.",
    };
  }

  if (!sku || sku.length > 100) {
    return {
      success: false,
      message: "Please enter a valid SKU.",
    };
  }

  if (!categoryId) {
    return {
      success: false,
      message: "Category is required.",
    };
  }

  if (!Number.isFinite(price) || price < 0) {
    return {
      success: false,
      message: "Price must be a valid non-negative number.",
    };
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return {
      success: false,
      message: "Stock must be a non-negative whole number.",
    };
  }

  if (!unit) {
    return {
      success: false,
      message: "Unit is required.",
    };
  }

  if (description.length < 1 || description.length > 5000) {
    return {
      success: false,
      message: "Description must be between 1 and 5000 characters.",
    };
  }

  await connectDB();

  const category = await Category.findOne({
    _id: categoryId,
    active: true,
  });

  if (!category) {
    return {
      success: false,
      message: "Selected category was not found.",
    };
  }

  const existingSku = await Product.findOne({
    sku,
    _id: { $ne: productId },
  });

  if (existingSku) {
    return {
      success: false,
      message: "Another product already uses this SKU.",
    };
  }

  const existingSlug = await Product.findOne({
    slug,
    _id: { $ne: productId },
  });

  if (existingSlug) {
    return {
      success: false,
      message: "Another product already uses this slug.",
    };
  }

  const images = Array.isArray(data.images)
    ? data.images
        .map((image) => String(image).trim())
        .filter(Boolean)
        .slice(0, 10)
    : [];

  const product = await Product.findById(productId);

  if (!product) {
    return {
      success: false,
      message: "Product not found.",
    };
  }

  product.name = name;
  product.slug = slug;
  product.sku = sku;
  product.category = category._id;
  product.price = price;
  product.stock = stock;
  product.unit = unit;
  product.description = description;
  product.images = images;

  // Product model uses "active", not "isActive"
  product.active = Boolean(data.isActive);

  await product.save();

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/chickens");
  revalidatePath("/poultry-feed");
  revalidatePath("/poultry-medicines");
  revalidatePath("/farm-equipment");
  revalidatePath(`/products/${slug}`);

  return {
    success: true,
    message: "Product updated successfully.",
  };
}

export async function deleteProduct(productId: string) {
  const admin = await requireAdmin();

  if (!admin) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  if (!productId) {
    return {
      success: false,
      message: "Product ID is required.",
    };
  }

  await connectDB();

  const product = await Product.findById(productId);

  if (!product) {
    return {
      success: false,
      message: "Product not found.",
    };
  }

  const Order = (await import("@/models/Order")).default;

  const orderExists = await Order.exists({
    "items.product": product._id,
  });

  if (orderExists) {
    return {
      success: false,
      message:
        "This product cannot be deleted because it exists in an order. Mark it inactive instead.",
    };
  }

  await Product.deleteOne({
    _id: product._id,
  });

  revalidatePath("/admin/products");
  revalidatePath("/");

  return {
    success: true,
    message: "Product deleted successfully.",
  };
}

export async function toggleProductActive(productId: string) {
  const admin = await requireAdmin();

  if (!admin) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  if (!productId) {
    return {
      success: false,
      message: "Product ID is required.",
    };
  }

  await connectDB();

  const product = await Product.findById(productId);

  if (!product) {
    return {
      success: false,
      message: "Product not found.",
    };
  }

  product.active = !product.active;

  await product.save();

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/chickens");
  revalidatePath("/poultry-feed");
  revalidatePath("/poultry-medicines");
  revalidatePath("/farm-equipment");
  revalidatePath(`/products/${product.slug}`);

  return {
    success: true,
    active: product.active,
    message: product.active
      ? "Product activated successfully."
      : "Product deactivated successfully.",
  };
}
