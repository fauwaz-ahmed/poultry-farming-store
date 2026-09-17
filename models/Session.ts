import mongoose, {
  Schema,
  type Model,
} from "mongoose";

export interface ISession {
  tokenHash: string;
  user: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const SessionSchema =
  new Schema<ISession>(
    {
      tokenHash: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },

      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      expiresAt: {
        type: Date,
        required: true,
       
      },
    },
    {
      timestamps: true,
    }
  );

SessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const Session =
  (mongoose.models.Session as Model<ISession>) ||
  mongoose.model<ISession>(
    "Session",
    SessionSchema
  );

export default Session;