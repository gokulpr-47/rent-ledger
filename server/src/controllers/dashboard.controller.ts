import { Request, Response } from "express";
import { calculateDashboardSummary } from "../services/dashboard.services";

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const summary = await calculateDashboardSummary();

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard summary",
    });
  }
};
