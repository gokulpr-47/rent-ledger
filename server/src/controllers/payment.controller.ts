import { Request, Response } from "express";
import {
  addPaymentService,
  applyCreditToRentalService,
} from "../services/payment.services";

export const addPayment = async (req: Request, res: Response) => {
  try {
    // allow itemIds array in body as well
    const result = await addPaymentService(req.body);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const message = error.message || "Failed to add payment";

    const statusCode =
      message === "Rental not found"
        ? 404
        : message.includes("exceeds") || message.includes("closed")
          ? 400
          : 500;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

export const applyCreditToRental = async (req: Request, res: Response) => {
  try {
    const { rentalId } = req.body;
    const result = await applyCreditToRentalService(rentalId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const message = error.message || "Failed to apply credit";
    res.status(400).json({ success: false, message });
  }
};
