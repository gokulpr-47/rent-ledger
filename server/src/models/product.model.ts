import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  pricePerDay: number;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    pricePerDay: { type: Number, required: true },
  },
  { timestamps: true },
);

export const Product = mongoose.model<IProduct>("Product", productSchema);
