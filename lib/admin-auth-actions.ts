"use server";

import { redirect } from "next/navigation";

import { deleteCurrentSession } from "@/lib/auth";

export async function adminLogoutAction() {
  await deleteCurrentSession();

  redirect("/admin/login");
}