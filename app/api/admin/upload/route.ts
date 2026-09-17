import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "No image file was provided.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only JPG, PNG, and WebP images are allowed.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Image size must be 5 MB or less.",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "poultry-store/products",
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Cloudinary upload failed."));
            return;
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully.",
      image: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    console.error("ADMIN IMAGE UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while uploading the image.",
      },
      { status: 500 }
    );
  }
}