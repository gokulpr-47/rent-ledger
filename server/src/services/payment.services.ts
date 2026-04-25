import mongoose from "mongoose";
import { Rental } from "../models/rental.model";
import { Payment } from "../models/payment.model";
import { RentalItem } from "../models/rentalItem.model";

interface AddPaymentInput {
  rentalId: string;
  amount: number;
  itemIds?: string[]; // optional list of rental item ids covered by this payment
  isAdvance?: boolean;
  notes?: string; // optional payment notes
}

export const addPaymentService = async ({
  rentalId,
  amount,
  itemIds,
  isAdvance = false,
  notes,
}: AddPaymentInput) => {
  if (!rentalId || !amount || amount <= 0) {
    throw new Error("Valid rentalId and amount are required");
  }

  // Transactions require a replica set; many local dev environments run
  // standalone servers which will throw "Transaction numbers are only
  // allowed on a replica set member or mongos".  To keep things simple
  // we perform operations sequentially without an explicit session.
  try {
    const rental = await Rental.findById(rentalId);

    if (!rental) {
      throw new Error("Rental not found");
    }

    if (rental.status === "CLOSED") {
      throw new Error("Rental already closed");
    }

    // calculate current paid total
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
    ]);

    const totalPaid = paymentStats.length > 0 ? paymentStats[0].totalPaid : 0;
    const remainingBalance = rental.finalAmount - totalPaid;

    // Payment is always allowed, including overpayment (credit scenario)
    // as requested by the implementation requirements.

    // item validation
    if (itemIds && itemIds.length > 0) {
      // make sure all itemIds are part of this rental and are returned
      const items = await RentalItem.find({
        _id: { $in: itemIds },
        rental: rentalId,
        returnedTime: { $ne: null },
      });
      if (items.length !== itemIds.length) {
        throw new Error("One or more itemIds are invalid for this rental");
      }

      // allow partial and repeated allocations by not blocking duplicates
      // (advance or partial payments may reference same item in several payments)
    }

    const payment = await Payment.create({
      rental: rentalId,
      amount,
      items: itemIds,
      isAdvance,
      notes,
    });

    const newRemaining = remainingBalance - amount;

    return {
      payment,
      remainingBalance: newRemaining,
      rentalStatus: rental.status,
    };
  } catch (error) {
    throw error;
  }
};

const calculateCustomerCredit = async (customerId: string): Promise<number> => {
  const customerRentals = await Rental.find({ customer: customerId }).lean();
  const rentalIds = customerRentals.map((r) => r._id);

  const customerPayments = await Payment.find({
    rental: { $in: rentalIds },
  }).lean();

  const totalPayment = customerPayments.reduce((sum, p) => sum + p.amount, 0);

  const totalDue = customerRentals.reduce(
    (sum, r) => sum + (r.finalAmount || 0),
    0,
  );

  const credit = totalPayment - totalDue;
  return credit > 0 ? credit : 0;
};

export const applyCreditToRentalService = async (rentalId: string) => {
  if (!rentalId) {
    throw new Error("rentalId is required");
  }

  const rental = await Rental.findById(rentalId);
  if (!rental) {
    throw new Error("Rental not found");
  }

  const totalCurrentPayments = await Payment.aggregate([
    { $match: { rental: new mongoose.Types.ObjectId(rentalId) } },
    { $group: { _id: null, totalPaid: { $sum: "$amount" } } },
  ]);

  const currentPaid =
    totalCurrentPayments.length > 0 ? totalCurrentPayments[0].totalPaid : 0;
  const remaining = rental.finalAmount - currentPaid;

  const customerCredit = await calculateCustomerCredit(
    rental.customer.toString(),
  );

  if (customerCredit <= 0 || remaining <= 0) {
    return {
      appliedAmount: 0,
      remainingBalance: remaining,
      customerCredit,
    };
  }

  const amountToApply = Math.min(customerCredit, remaining);

  const payment = await Payment.create({
    rental: rental._id,
    amount: amountToApply,
    isAdvance: true,
  });

  return {
    payment,
    appliedAmount: amountToApply,
    remainingBalance: remaining - amountToApply,
    customerCredit: customerCredit - amountToApply,
  };
};
