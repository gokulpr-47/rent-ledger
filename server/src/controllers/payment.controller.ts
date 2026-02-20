import { Request, Response } from "express";
import { addPaymentService } from "../services/payment.services";

export const addPayment = async (req: Request, res: Response) => {
  try {
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
