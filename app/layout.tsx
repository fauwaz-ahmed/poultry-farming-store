import type { Metadata } from "next";
import { headers } from "next/headers";

import "./globals.css";

import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "DPoultryHub",
  description:
    "Poultry farming store for chickens, poultry feed, medicines and farm equipment.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <html lang="en">
      <body>
        {!isAdminRoute && <Navbar />}

        {children}
      </body>
    </html>
  );
}