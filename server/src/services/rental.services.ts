import mongoose from "mongoose";
import { Rental } from "../models/rental.model";
import { RentalItem } from "../models/rentalItem.model";
import { Payment } from "../models/payment.model";

interface CreateRentalInput {
  customerId: string;
  items: {
    productId: string;
    pricePerDay: number;
    days: number;
  }[];
  discount?: number;
}

export const createRentalService = async ({
  customerId,
  items,
  discount = 0,
}: CreateRentalInput) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!items || items.length === 0) {
      throw new Error("At least one rental item required");
    }

    let totalAmount = 0;

    const calculatedItems = items.map((item) => {
      const total = item.pricePerDay * item.days;
      totalAmount += total;

      return {
        product: item.productId,
        pricePerDay: item.pricePerDay,
        days: item.days,
        total,
      };
    });

    const finalAmount = totalAmount - discount;

    const rental = await Rental.create(
      [
        {
          customer: customerId,
          totalAmount,
          discount,
          finalAmount,
        },
      ],
      { session },
    );

    const rentalId = rental[0]._id;

    const rentalItems = calculatedItems.map((item) => ({
      rental: rentalId,
      ...item,
    }));

    await RentalItem.insertMany(rentalItems, { session });

    await session.commitTransaction();
    session.endSession();

    return rental[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const getRentalDetailsService = async (rentalId: string) => {
  const rental = await Rental.findById(rentalId).populate("customer");

  if (!rental) {
    throw new Error("Rental not found");
  }

  const items = await RentalItem.find({ rental: rentalId }).populate("product");
  const payments = await Payment.find({ rental: rentalId });

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingBalance = rental.finalAmount - totalPaid;

  return {
    rental,
    items,
    payments,
    totalPaid,
    remainingBalance,
    status: rental.status,
  };
};

export const getOpenRentalsService = async () => {
  const rentals = await Rental.aggregate([
    {
      $match: { status: "OPEN" },
    },
    {
      $lookup: {
        from: "payments",
        localField: "_id",
        foreignField: "rental",
        as: "payments",
      },
    },
    {
      $addFields: {
        totalPaid: { $sum: "$payments.amount" },
      },
    },
    {
      $addFields: {
        remainingBalance: {
          $subtract: ["$finalAmount", "$totalPaid"],
        },
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "customer",
        foreignField: "_id",
        as: "customer",
      },
    },
    {
      $unwind: "$customer",
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $project: {
        payments: 0,
      },
    },
  ]);

  return rentals;
};

export const getRentalsByCustomerService = async (customerId: string) => {
  const rentals = await Rental.find({ customer: customerId })
    .populate("customer")
    .sort({ createdAt: -1 });

  const result = [];
  let totalOutstanding = 0;

  for (const rental of rentals) {
    const payments = await Payment.find({ rental: rental._id });

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingBalance = rental.finalAmount - totalPaid;

    if (remainingBalance > 0) {
      totalOutstanding += remainingBalance;
    }

    result.push({
      rentalId: rental._id,
      finalAmount: rental.finalAmount,
      totalPaid,
      remainingBalance,
      status: rental.status,
      createdAt: rental.createdAt,
    });
  }

  return {
    rentals: result,
    totalOutstanding,
  };
};
