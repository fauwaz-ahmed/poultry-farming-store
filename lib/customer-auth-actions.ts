"use server";

import { redirect } from "next/navigation";

import { deleteCurrentSession } from "@/lib/auth";

export async function customerLogoutAction() {
  await deleteCurrentSession();

  redirect("/login");
}