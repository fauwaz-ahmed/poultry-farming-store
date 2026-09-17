import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export async function GET(req: Request) {
  try {
    await connectDB();

    const url = new URL(req.url);

    const q = url.searchParams.get("q");
    const category = url.searchParams.get("category");

    const filter: Record<string, unknown> = {
      active: true,
    };

    if (category) {
      filter.category = category;
    }

    if (q) {
      filter.$text = {
        $search: q,
      };
    }

    const products = await Product.find(filter)
      .sort({
        featured: -1,
        createdAt: -1,
      })
      .limit(40)
      .lean();

    return NextResponse.json(products);
  } catch (error) {
    console.error("PRODUCT API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load products.",
      },
      {
        status: 500,
      }
    );
  }
}
