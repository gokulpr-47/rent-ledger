import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  rental: mongoose.Types.ObjectId;
  amount: number;
}

const paymentSchema = new Schema<IPayment>(
  {
    rental: { type: Schema.Types.ObjectId, ref: "Rental", required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true },
);

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
