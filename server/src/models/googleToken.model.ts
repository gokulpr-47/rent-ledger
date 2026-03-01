import mongoose from "mongoose";

const GoogleTokenSchema = new mongoose.Schema(
  {
    access_token: String,
    refresh_token: String,
    scope: String,
    expiry_date: Number,
  },
  { timestamps: true },
);

export const GoogleToken = mongoose.model("GoogleToken", GoogleTokenSchema);
