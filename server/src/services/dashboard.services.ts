import { Rental } from "../models/rental.model";
import { Payment } from "../models/payment.model";

export const calculateDashboardSummary = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysPayments = await Payment.find({
    createdAt: { $gte: today },
  });

  const todaysRevenue = todaysPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  const openRentals = await Rental.find({ status: "OPEN" });

  let totalOutstanding = 0;

  for (const rental of openRentals) {
    const payments = await Payment.find({ rental: rental._id });

    const totalPaid = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    totalOutstanding += rental.finalAmount - totalPaid;
  }

  const customersWithDebt = new Set(
    openRentals.map((r) => r.customer.toString()),
  );

  return {
    todaysRevenue,
    totalOutstanding,
    openRentalsCount: openRentals.length,
    customersWithOutstanding: customersWithDebt.size,
  };
};
