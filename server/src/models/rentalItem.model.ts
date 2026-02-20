import mongoose, { Schema, Document } from "mongoose";

export interface IRentalItem extends Document {
  rental: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  quantity: number;
  productName: string;
  pricePerDay: number;
  days: number;
  total: number;
}

const rentalItemSchema = new Schema<IRentalItem>(
  {
    rental: {
      type: Schema.Types.ObjectId,
      ref: "Rental",
      required: true,
    },
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

    // 🔒 Snapshot fields
    productName: {
      type: String,
      required: true,
    },

    pricePerDay: {
      type: Number,
      required: true,
      min: 0,
    },

    days: {
      type: Number,
      required: true,
      min: 1,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true },
);

export const RentalItem = mongoose.model<IRentalItem>(
  "RentalItem",
  rentalItemSchema,
);
