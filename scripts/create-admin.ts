
import { connectDB } from "../lib/db";
import User from "../models/User";
import { hashPassword } from "../lib/password";

async function createAdmin() {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local"
    );
  }

  if (password.length < 12) {
    throw new Error(
      "ADMIN_PASSWORD must be at least 12 characters long."
    );
  }

  await connectDB();

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const existingUser =
    await User.findOne({
      email: normalizedEmail,
    }).select("+passwordHash");

  const passwordHash =
    await hashPassword(password);

  if (existingUser) {
    existingUser.name = name.trim();
    existingUser.passwordHash =
      passwordHash;
    existingUser.role = "admin";

    await existingUser.save();

    console.log(
      `Admin user updated: ${normalizedEmail}`
    );
  } else {
    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "admin",
    });

    console.log(
      `Admin user created: ${normalizedEmail}`
    );
  }

  process.exit(0);
}

createAdmin().catch((error) => {
  console.error(
    "CREATE ADMIN ERROR:",
    error
  );

  process.exit(1);
});