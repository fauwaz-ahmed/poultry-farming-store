import { Schema, model, models } from "mongoose";
const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      unique: true,
      index: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    phone: { type: String, index: true, trim: true },
    passwordHash: { type: String, select: false },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    image: { type: String },
  },
  { timestamps: true },
);
export default models.User || model("User", UserSchema);
