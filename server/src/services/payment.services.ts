import mongoose from "mongoose";
import { Rental } from "../models/rental.model";
import { Payment } from "../models/payment.model";

interface AddPaymentInput {
  rentalId: string;
  amount: number;
}

export const addPaymentService = async ({
  rentalId,
  amount,
}: AddPaymentInput) => {
  if (!rentalId || !amount || amount <= 0) {
    throw new Error("Valid rentalId and amount are required");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const rental = await Rental.findById(rentalId).session(session);

    if (!rental) {
      throw new Error("Rental not found");
    }

    if (rental.status === "CLOSED") {
      throw new Error("Rental already closed");
    }

    // 🔥 Aggregation instead of Payment.find()
    const paymentStats = await Payment.aggregate([
      {
        $match: {
          rental: new mongoose.Types.ObjectId(rentalId),
        },
      },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: "$amount" },
        },
      },
    ]).session(session);

    const totalPaid = paymentStats.length > 0 ? paymentStats[0].totalPaid : 0;

    const remainingBalance = rental.finalAmount - totalPaid;

    if (amount > remainingBalance) {
      throw new Error(
        `Payment exceeds remaining balance (${remainingBalance})`,
      );
    }

    const payment = await Payment.create(
      [
        {
          rental: rentalId,
          amount,
        },
      ],
      { session },
    );

    const newRemaining = remainingBalance - amount;

    if (newRemaining === 0) {
      rental.status = "CLOSED";
      await rental.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return {
      payment: payment[0],
      remainingBalance: newRemaining,
      rentalStatus: rental.status,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
