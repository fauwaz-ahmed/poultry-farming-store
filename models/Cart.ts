import mongoose, {
  Schema,
  Document,
  Model,
} from "mongoose";

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
}

export interface ICart extends Document {
  user?: mongoose.Types.ObjectId;
  sessionId?: string;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: false,
  }
);

const CartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    sessionId: {
      type: String,
      index: true,
    },

    items: {
      type: [CartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Cart: Model<ICart> =
  mongoose.models.Cart ||
  mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
