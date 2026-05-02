import { Request, Response } from "express";
import {
  calculateDashboardSummary,
  getCustomerRunningCredits,
  getOpenRentalsDetails,
} from "../services/dashboard.services";

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const summary = await calculateDashboardSummary();
    const runningCredits = await getCustomerRunningCredits();

    res.status(200).json({
      success: true,
      data: {
        ...summary,
        runningCredits,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard summary",
    });
  }
};

export const getOpenRentals = async (req: Request, res: Response) => {
  try {
    const sortField = String(req.query.sortField || "outstandingBalance");
    const sortOrder = String(req.query.sortOrder || "desc");
    const openRentals = await getOpenRentalsDetails(sortField, sortOrder);

    res.status(200).json({
      success: true,
      data: openRentals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load open rentals",
    });
  }
};
