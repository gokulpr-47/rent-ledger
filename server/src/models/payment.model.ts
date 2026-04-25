import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  rental: mongoose.Types.ObjectId;
  amount: number;
  items?: mongoose.Types.ObjectId[]; // which rental items this payment covers
  isAdvance?: boolean; // true for stand-alone advance/credit payments
  notes?: string; // optional payment notes
}

const paymentSchema = new Schema<IPayment>(
  {
    rental: { type: Schema.Types.ObjectId, ref: "Rental", required: true },
    amount: { type: Number, required: true },
    items: [{ type: Schema.Types.ObjectId, ref: "RentalItem" }],
    isAdvance: { type: Boolean, default: false },
    notes: { type: String, optional: true },
  },
  { timestamps: true },
);

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
