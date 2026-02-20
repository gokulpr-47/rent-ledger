import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  createCustomerService,
  getCustomersService,
  updateCustomerService,
  deleteCustomerService,
  getCustomerRunningCreditService,
} from "../services/customer.services";

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await createCustomerService(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create customer",
    });
  }
};

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;

    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);

    const search = (req.query.search as string) || "";
    const sort = (req.query.sort as string) || "-createdAt";

    const result = await getCustomersService(page, limit, search, sort);

    res.json({
      success: true,
      data: result.customers,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await updateCustomerService(
      req.params.id as string,
      req.body,
    );
    res.json({ success: true, data: customer });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    await deleteCustomerService(req.params.id as string);
    res.json({ success: true, message: "Customer deleted" });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const getCustomerRunningCredit = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(customerId as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const result = await getCustomerRunningCreditService(customerId as string);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to calculate running credit",
    });
  }
};
