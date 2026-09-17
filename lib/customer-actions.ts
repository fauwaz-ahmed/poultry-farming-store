"use server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";

export async function registerCustomer(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) {
  try {
    await connectDB();

    const name = data.name?.trim() || "";
    const email =
      data.email?.trim().toLowerCase() || "";
    const phone = data.phone?.trim() || "";
    const password = data.password || "";

    if (!name) {
      return {
        success: false,
        message: "Name is required.",
      };
    }

    if (name.length < 2 || name.length > 100) {
      return {
        success: false,
        message:
          "Name must be between 2 and 100 characters.",
      };
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return {
        success: false,
        message: "Please enter a valid email address.",
      };
    }

    if (email.length > 150) {
      return {
        success: false,
        message: "Email address is too long.",
      };
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return {
        success: false,
        message:
          "Please enter a valid 10-digit phone number.",
      };
    }

    if (password.length < 8) {
      return {
        success: false,
        message:
          "Password must be at least 8 characters.",
      };
    }

    if (password.length > 128) {
      return {
        success: false,
        message: "Password is too long.",
      };
    }

    const existingUser = await User.findOne({
      email,
    }).lean();

    if (existingUser) {
      return {
        success: false,
        message:
          "An account with this email already exists.",
      };
    }

    const passwordHash =
      await hashPassword(password);

    const user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role: "customer",
    });

    await createSession(String(user._id));

    return {
      success: true,
      message: "Account created successfully.",
    };
  } catch (error) {
    console.error(
      "CUSTOMER REGISTRATION ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Something went wrong while creating your account.",
    };
  }
}