"use server";

import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { getCurrentUser } from "@/lib/auth";

const CART_COOKIE = "poultry_cart";

async function getOrCreateSessionId() {
  const cookieStore = await cookies();

  let sessionId = cookieStore.get(CART_COOKIE)?.value;

  if (!sessionId) {
    sessionId = crypto.randomUUID();

    cookieStore.set(CART_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  return sessionId;
}

export async function addToCart(productId: string, quantity = 1) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product.");
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Invalid quantity.");
  }

  await connectDB();

  const productResult = await Product.findById(productId).lean();

  if (!productResult) {
    throw new Error("Product not found.");
  }

  const product = productResult as unknown as {
    _id: unknown;
    name: string;
    slug: string;
    sku: string;
    price: number;
    unit: string;
    stock: number;
    images?: string[];
    active?: boolean;
  };

  if (product.stock < quantity) {
    throw new Error("Not enough stock available.");
  }

  const sessionId = await getOrCreateSessionId();
  const user = await getCurrentUser();

  const cartQuery = user
    ? {
        sessionId,
        user: user.id,
      }
    : {
        sessionId,
      };

  let cart = await Cart.findOne(cartQuery);

  if (!cart) {
    cart = await Cart.create({
      sessionId,
      ...(user ? { user: user.id } : {}),
      items: [
        {
          product: product._id,
          quantity,
        },
      ],
    });
  } else {
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > product.stock) {
        throw new Error("Requested quantity exceeds available stock.");
      }

      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: product._id as import("mongoose").Types.ObjectId,
        quantity,
      });
    }

    await cart.save();
  }

  return {
    success: true,
    message: "Product added to cart.",
  };
}

export async function updateCartItem(productId: string, quantity: number) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product.");
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Invalid quantity.");
  }

  await connectDB();
const productResult = await Product.findById(productId).lean();

if (!productResult) {
  throw new Error("Product not found.");
}

const product = productResult as unknown as {
  _id: unknown;
  name: string;
  slug: string;
  sku: string;
  price: number;
  unit: string;
  stock: number;
  images?: string[];
  active?: boolean;
};

if (quantity > product.stock) {
    throw new Error("Requested quantity exceeds available stock.");
  }

  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_COOKIE)?.value;

  if (!sessionId) {
    throw new Error("Cart session not found.");
  }

  const user = await getCurrentUser();

  const cartQuery = user
    ? {
        sessionId,
        user: user.id,
      }
    : {
        sessionId,
      };

  const cart = await Cart.findOne(cartQuery);

  if (!cart) {
    throw new Error("Cart not found.");
  }

  const item = cart.items.find(
    (cartItem) => cartItem.product.toString() === productId,
  );

  if (!item) {
    throw new Error("Cart item not found.");
  }

  item.quantity = quantity;

  await cart.save();

  return {
    success: true,
  };
}

export async function removeFromCart(productId: string) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product.");
  }

  await connectDB();

  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_COOKIE)?.value;

  if (!sessionId) {
    return {
      success: true,
    };
  }

  const user = await getCurrentUser();

  const cartQuery = user
    ? {
        sessionId,
        user: user.id,
      }
    : {
        sessionId,
      };

  const cart = await Cart.findOne(cartQuery);

  if (!cart) {
    return {
      success: true,
    };
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId,
  );

  await cart.save();

  return {
    success: true,
  };
}
