import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  phone: string;
  address?: string;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    address: { type: String },
  },
  { timestamps: true },
);

export const Customer = mongoose.model<ICustomer>("Customer", customerSchema);
