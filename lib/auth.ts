import crypto from "crypto";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import User from "@/models/User";

const AUTH_COOKIE = "poultry_session";

const SESSION_DURATION_DAYS = 7;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  await connectDB();

  const token = crypto.randomBytes(32).toString("hex");

  const tokenHash = hashToken(token);

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
  );

  await Session.create({
    tokenHash,
    user: userId,
    expiresAt,
  });

  const cookieStore = await cookies();

  cookieStore.set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return {
    success: true,
  };
}

export async function getCurrentUser() {
  try {
    await connectDB();

    const cookieStore = await cookies();

    const token = cookieStore.get(AUTH_COOKIE)?.value;

    if (!token) {
      return null;
    }

    const tokenHash = hashToken(token);

    const sessionResult = await Session.findOne({
      tokenHash,
      expiresAt: {
        $gt: new Date(),
      },
    }).lean();

    if (!sessionResult) {
      return null;
    }

    const session = sessionResult as unknown as {
      _id: unknown;
      user: unknown;
      expiresAt: Date;
    };

    const userResult = await User.findById(session.user)
      .select("_id name email phone role image")
      .lean();

    if (!userResult) {
      await Session.deleteOne({
        _id: session._id,
      });

      cookieStore.delete(AUTH_COOKIE);

      return null;
    }

    const user = userResult as unknown as {
      _id: unknown;
      name?: string;
      email?: string;
      phone?: string;
      role?: string;
      image?: string;
    };

    return {
      id: String(user._id),
      name: String(user.name || ""),
      email: String(user.email || ""),
      phone: String(user.phone || ""),
      role: String(user.role || "customer"),
      image: String(user.image || ""),
    };
  } catch (error) {
    console.error("GET CURRENT USER ERROR:", error);

    return null;
  }
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  if (user.role !== "admin") {
    throw new Error("Admin access required.");
  }

  return user;
}

export async function deleteCurrentSession() {
  try {
    await connectDB();

    const cookieStore = await cookies();

    const token = cookieStore.get(AUTH_COOKIE)?.value;

    if (token) {
      const tokenHash = hashToken(token);

      await Session.deleteOne({
        tokenHash,
      });
    }

    cookieStore.delete(AUTH_COOKIE);
  } catch (error) {
    console.error("DELETE SESSION ERROR:", error);

    const cookieStore = await cookies();

    cookieStore.delete(AUTH_COOKIE);
  }
}