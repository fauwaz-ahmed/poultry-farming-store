"use server";

import { redirect } from "next/navigation";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyPassword } from "@/lib/password";
import { createSession, deleteCurrentSession } from "@/lib/auth";

function getSafeNextPath(next: string | undefined, fallback: string) {
  if (!next) {
    return fallback;
  }

  if (!next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }

  return next;
}

export async function loginAdmin(email: string, password: string) {
  try {
    await connectDB();

    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return {
        success: false,
        message: "Email and password are required.",
      };
    }

    const userResult = await User.findOne({
      email,
    })
      .select("+passwordHash _id name email phone role image")
      .lean();

    const user = userResult as unknown as {
      _id: unknown;
      name: string;
      email?: string;
      phone?: string;
      role: "customer" | "admin";
      image?: string;
      passwordHash?: string;
    };

    if (!user || !user.passwordHash) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    if (user.role !== "admin") {
      return {
        success: false,
        message: "You do not have administrator access.",
      };
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);

    if (!passwordValid) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    await createSession(String(user._id));

    return {
      success: true,
      message: "Login successful.",
    };
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    return {
      success: false,
      message: "Something went wrong while logging in.",
    };
  }
}

export async function loginCustomer(email: string, password: string) {
  try {
    await connectDB();

    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return {
        success: false,
        message: "Email and password are required.",
      };
    }

    const userResult = await User.findOne({
      email,
    })
      .select("+passwordHash _id name email phone role image")
      .lean();

    const user = userResult as unknown as {
      _id: unknown;
      name: string;
      email?: string;
      phone?: string;
      role: "customer" | "admin";
      image?: string;
      passwordHash?: string;
    };

    if (!user || !user.passwordHash) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    if (user.role !== "customer") {
      return {
        success: false,
        message: "This account is not a customer account.",
      };
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);

    if (!passwordValid) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    await createSession(String(user._id));

    return {
      success: true,
      message: "Login successful.",
    };
  } catch (error) {
    console.error("CUSTOMER LOGIN ERROR:", error);

    return {
      success: false,
      message: "Something went wrong while logging in.",
    };
  }
}

export async function logoutAdmin() {
  await deleteCurrentSession();
  redirect("/admin/login");
}

export async function logoutCustomer() {
  await deleteCurrentSession();
  redirect("/login");
}
