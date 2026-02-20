import mongoose, { Schema, Document } from "mongoose";

export interface IRental extends Document {
  customer: mongoose.Types.ObjectId;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  status: "OPEN" | "CLOSED";
  createdAt: Date;
}

const rentalSchema = new Schema<IRental>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    status: { type: String, enum: ["OPEN", "CLOSED"], default: "OPEN" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const Rental = mongoose.model<IRental>("Rental", rentalSchema);
