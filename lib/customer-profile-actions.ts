"use server";

import { revalidatePath } from "next/cache";

import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import User from "@/models/User";

export async function updateCustomerProfile(
  name: string,
  phone: string
) {
  const user = await getCurrentUser();

  if (!user || user.role !== "customer") {
    return {
      success: false,
      message: "You must be logged in as a customer.",
    };
  }

  const cleanName = String(name || "").trim();
  const cleanPhone = String(phone || "").trim();

  if (
    cleanName.length < 2 ||
    cleanName.length > 100
  ) {
    return {
      success: false,
      message:
        "Name must be between 2 and 100 characters.",
    };
  }

  if (!/^[0-9]{10}$/.test(cleanPhone)) {
    return {
      success: false,
      message:
        "Please enter a valid 10-digit phone number.",
    };
  }

  await connectDB();

  const updatedUser = await User.findOneAndUpdate(
    {
      _id: user.id,
      role: "customer",
    },
    {
      $set: {
        name: cleanName,
        phone: cleanPhone,
      },
    },
    {
      new: true,
    }
  ).lean();

  if (!updatedUser) {
    return {
      success: false,
      message: "Customer account not found.",
    };
  }

  revalidatePath("/account");

  return {
    success: true,
    message: "Account details updated successfully.",
  };
}