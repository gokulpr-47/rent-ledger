import { Request, Response } from "express";
import {
  createRentalService,
  getRentalDetailsService,
  getOpenRentalsService,
  getRentalsByCustomerService,
} from "../services/rental.services";

export const createRental = async (req: Request, res: Response) => {
  try {
    const rental = await createRentalService(req.body);

    res.status(201).json({
      success: true,
      data: rental,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create rental",
    });
  }
};

export const getRentalDetails = async (req: Request, res: Response) => {
  try {
    const data = await getRentalDetailsService(req.params.id as string);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(error.message === "Rental not found" ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOpenRentals = async (req: Request, res: Response) => {
  try {
    const data = await getOpenRentalsService();

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch open rentals",
    });
  }
};

export const getRentalsByCustomer = async (req: Request, res: Response) => {
  try {
    const { rentals, totalOutstanding } = await getRentalsByCustomerService(
      req.params.customerId as string,
    );

    res.status(200).json({
      success: true,
      count: rentals.length,
      totalOutstanding,
      data: rentals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch rentals for customer",
    });
  }
};
