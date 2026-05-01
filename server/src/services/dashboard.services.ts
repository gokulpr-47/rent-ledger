import { Rental } from "../models/rental.model";
import { Payment } from "../models/payment.model";
import { Customer } from "../models/customer.model";
import { RentalItem } from "../models/rentalItem.model";

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

export const getCustomerRunningCredits = async () => {
  // 1. Get all OPEN rentals
  const openRentals = await Rental.find({ status: "OPEN" }).lean();

  if (openRentals.length === 0) return [];

  const rentalIds = openRentals.map((r) => r._id);
  const customerIds = openRentals.map((r) => r.customer.toString());

  // 2. Get all payments for these rentals (ONE QUERY)
  const payments = await Payment.find({
    rental: { $in: rentalIds },
  }).lean();

  // 3. Get all customers (ONE QUERY)
  const customers = await Customer.find({
    _id: { $in: customerIds },
  }).lean();

  // 4. Create lookup maps
  const paymentsMap: Record<string, number> = {};

  payments.forEach((p) => {
    const rentalId = p.rental.toString();
    paymentsMap[rentalId] = (paymentsMap[rentalId] || 0) + p.amount;
  });

  const customerMap: Record<string, string> = {};
  customers.forEach((c) => {
    customerMap[String(c._id)] = c.name;
  });

  // 5. Compute credits per customer
  const customerCreditsMap: Record<
    string,
    { totalOutstanding: number; openRentals: number }
  > = {};

  openRentals.forEach((rental) => {
    const rentalId = rental._id.toString();
    const customerId = rental.customer.toString();

    const totalPaid = paymentsMap[rentalId] || 0;
    const outstanding = rental.finalAmount - totalPaid;

    if (outstanding > 0) {
      if (!customerCreditsMap[customerId]) {
        customerCreditsMap[customerId] = {
          totalOutstanding: 0,
          openRentals: 0,
        };
      }

      customerCreditsMap[customerId].totalOutstanding += outstanding;
      customerCreditsMap[customerId].openRentals += 1;
    }
  });

  // 6. Final response
  return Object.entries(customerCreditsMap).map(([customerId, data]) => ({
    customerId,
    customerName: customerMap[String(customerId)] || "Unknown",
    totalOutstanding: data.totalOutstanding,
    openRentals: data.openRentals,
  }));
};

export const getOpenRentalsDetails = async () => {
  // Get all OPEN rentals with customer info and items
  const openRentals = await Rental.find({ status: "OPEN" }).lean();

  if (openRentals.length === 0) return [];

  const rentalIds = openRentals.map((r) => r._id);
  const customerIds = openRentals.map((r) => r.customer);

  // Get all payments for these rentals
  const payments = await Payment.find({
    rental: { $in: rentalIds },
  }).lean();

  // Get all customers
  const customers = await Customer.find({
    _id: { $in: customerIds },
  }).lean();

  // Get all items count for these rentals
  const itemCounts = await RentalItem.aggregate([
    {
      $match: {
        rental: { $in: rentalIds },
      },
    },
    {
      $group: {
        _id: "$rental",
        count: { $sum: 1 },
      },
    },
  ]);

  // Create lookup maps
  const paymentsMap: Record<string, number> = {};
  payments.forEach((p) => {
    const rentalId = p.rental.toString();
    paymentsMap[rentalId] = (paymentsMap[rentalId] || 0) + p.amount;
  });

  const customerMap: Record<string, string> = {};
  customers.forEach((c) => {
    customerMap[c._id.toString()] = c.name;
  });

  const itemCountMap: Record<string, number> = {};
  itemCounts.forEach((item) => {
    itemCountMap[item._id.toString()] = item.count;
  });

  // Build response
  return openRentals.map((rental) => {
    const rentalId = rental._id.toString();
    const customerId = rental.customer.toString();
    const totalPaid = paymentsMap[rentalId] || 0;
    const outstandingBalance = rental.finalAmount - totalPaid;
    const itemCount = itemCountMap[rentalId] || 0;

    return {
      rentalId,
      customerId,
      customerName: customerMap[customerId] || "Unknown",
      rentalDate: rental.createdAt,
      totalAmount: rental.finalAmount,
      outstandingBalance,
      itemCount,
    };
  });
};
