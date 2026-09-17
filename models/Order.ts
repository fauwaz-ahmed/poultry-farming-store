import mongoose, { Schema, models, model } from "mongoose";

const OrderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    instructions: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: unknown[]) =>
          Array.isArray(items) && items.length > 0,
        message: "Order must contain at least one item.",
      },
    },

    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["cod"],
      default: "cod",
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
      required: true,
    },

    paymentTransactionId: {
      type: String,
      default: "",
      trim: true,
    },

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Ready for Delivery",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Order =
  models.Order || model("Order", OrderSchema);

export default Order;