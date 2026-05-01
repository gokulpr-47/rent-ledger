import { Customer } from "../models/customer.model";
import { Rental } from "../models/rental.model";
import { Payment } from "../models/payment.model";
import mongoose from "mongoose";

const normalizeCustomerPhone = (data: any) => {
  if (typeof data.phone === "string") {
    const trimmed = data.phone.trim();
    if (trimmed === "") {
      delete data.phone;
    } else {
      data.phone = trimmed;
    }
  }
  return data;
};

export const createCustomerService = async (data: any) => {
  const normalizedData = normalizeCustomerPhone({ ...data });
  return await Customer.create(normalizedData);
};

export const getCustomersService = async (
  page: number = 1,
  limit: number = 10,
  search: string = "",
  sort: string = "-createdAt",
) => {
  const skip = (page - 1) * limit;

  // ✅ Whitelist allowed sort fields
  const allowedSortFields = ["name", "email", "phone", "createdAt"];
  const cleanSortField = sort.replace("-", "");

  if (!allowedSortFields.includes(cleanSortField)) {
    sort = "-createdAt";
  }

  // Search filter
  const searchFilter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  // Sorting logic
  let sortOption: any = {};
  if (sort.startsWith("-")) {
    sortOption[sort.substring(1)] = -1;
  } else {
    sortOption[sort] = 1;
  }

  const [customers, totalDocuments] = await Promise.all([
    Customer.find(searchFilter).sort(sortOption).skip(skip).limit(limit),
    Customer.countDocuments(searchFilter),
  ]);

  const totalPages = Math.ceil(totalDocuments / limit);

  return {
    customers,
    pagination: {
      totalDocuments,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

export const updateCustomerService = async (id: string, data: any) => {
  const normalizedData = normalizeCustomerPhone({ ...data });

  const customer = await Customer.findByIdAndUpdate(id, normalizedData, {
    new: true,
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  return customer;
};

export const deleteCustomerService = async (id: string) => {
  // Prevent deleting a customer who has any rentals (open or closed)
  const existingRental = await Rental.findOne({ customer: id });
  if (existingRental) {
    throw new Error("Cannot delete customer who has rental records");
  }

  const customer = await Customer.findByIdAndDelete(id);

  if (!customer) {
    throw new Error("Customer not found");
  }

  return customer;
};

export const getCustomerByIdService = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid customer ID");
  }

  const customer = await Customer.findById(id);
  if (!customer) {
    throw new Error("Customer not found");
  }

  return customer;
};

export const getCustomerRunningCreditService = async (customerId: string) => {
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new Error("Invalid customer ID");
  }

  // Check if customer exists
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new Error("Customer not found");
  }

  // Get OPEN rentals
  const rentals = await Rental.find({
    customer: customerId,
    status: "OPEN",
  });

  const rentalIds = rentals.map((r) => r._id);

  // Calculate total rental amount
  const totalRentals = rentals.reduce(
    (sum, rental) => sum + (rental.finalAmount || 0),
    0,
  );

  // Get payments related to those rentals
  const payments = await Payment.find({
    rental: { $in: rentalIds },
  });

  // Calculate total payments
  const totalPayments = payments.reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0,
  );

  const remainingBalance = totalRentals - totalPayments;

  return {
    totalRentals,
    totalPayments,
    remainingBalance,
  };
};
