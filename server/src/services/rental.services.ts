import mongoose from "mongoose";
import { Rental } from "../models/rental.model";
import { RentalItem } from "../models/rentalItem.model";
import { Payment } from "../models/payment.model";
import { Product } from "../models/product.model";

interface RentalItemInput {
  productId: string;
  quantity: number;
  takenTime: Date | string;
  returnedTime?: Date | string | null;
  notes?: string;
  pricePerDay?: number;
}

interface AddItemsInput {
  customerId: string;
  items: RentalItemInput[];
}

interface UpdateReturnedTimeInput {
  rentalItemId: string;
  returnedTime: Date | string;
}

interface CloseRentalInput {
  rentalId: string;
  discount?: number; // optional discount
}

export const addItemsToOpenRentalService = async ({
  customerId,
  items,
}: AddItemsInput) => {
  if (!items || items.length === 0) {
    throw new Error("At least one rental item is required");
  }

  try {
    // 🔎 Find existing OPEN rental or create a new one
    let rental = await Rental.findOne({
      customer: customerId,
      status: "OPEN",
    });

    if (!rental) {
      const newRental = await Rental.create({
        customer: customerId,
        totalAmount: 0,
        finalAmount: 0,
        status: "OPEN",
      });
      rental = newRental;
    }

    const rentalItemsToInsert: any[] = [];

    // 🔁 Process each item
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      // Determine price per day (override or product price)
      const pricePerDay = item.pricePerDay ?? product.pricePerDay;

      let total = 0;
      let returnedTime: Date | null = null;

      if (item.returnedTime) {
        returnedTime = new Date(item.returnedTime);
        const takenTime = new Date(item.takenTime);
        const days =
          Math.ceil(
            (returnedTime.getTime() - takenTime.getTime()) /
              (1000 * 60 * 60 * 24),
          ) || 1;

        total = pricePerDay * item.quantity * days;
      }

      rentalItemsToInsert.push({
        rental: rental?._id,
        product: product._id,
        quantity: item.quantity,
        productName: product.name,
        pricePerDay,
        takenTime: new Date(item.takenTime),
        returnedTime,
        notes: item.notes,
        total,
      });
    }

    // 🔹 Insert rental items
    const createdItems = await RentalItem.insertMany(rentalItemsToInsert);

    // 🔹 Recalculate totalAmount (only items with returnedTime)
    const returnedItemsTotals = await RentalItem.aggregate([
      { $match: { rental: rental?._id, returnedTime: { $ne: null } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const totalAmount = returnedItemsTotals[0]?.total ?? 0;

    rental.totalAmount = totalAmount;
    rental.finalAmount = totalAmount; // discount applied only at closing
    await rental.save();

    return {
      rental,
      items: createdItems,
    };
  } catch (error) {
    throw error;
  }
};

export const updateReturnedTimeService = async ({
  rentalItemId,
  returnedTime,
}: UpdateReturnedTimeInput) => {
  const item = await RentalItem.findById(rentalItemId);
  if (!item) {
    throw new Error("Rental item not found");
  }

  // Update returnedTime
  const returnedDate = new Date(returnedTime);
  item.returnedTime = returnedDate;

  // Calculate days
  const takenDate = new Date(item.takenTime);
  const diffTime = returnedDate.getTime() - takenDate.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  // Recalculate total
  item.total = item.pricePerDay * item.quantity * days;

  await item.save();

  // Recalculate parent rental totals (only items with returnedTime)
  const rentalItems = await RentalItem.find({
    rental: item.rental,
    returnedTime: { $ne: null },
  });

  const totalAmount = rentalItems.reduce((sum, ri) => sum + ri.total, 0);

  const rental = await Rental.findById(item.rental);
  if (rental) {
    rental.totalAmount = totalAmount;
    rental.finalAmount = totalAmount; // discount only applied when closing credit
    await rental.save();
  }

  return { item, rental };
};

export const updateRentalItemPriceService = async (
  rentalItemId: string,
  newPrice: number,
) => {
  const item = await RentalItem.findById(rentalItemId);
  if (!item) throw new Error("Rental item not found");

  item.total = newPrice;

  // Optionally, recalc total if returnedTime exists
  // if (item.returnedTime) {
  //   const duration =
  //     (item.returnedTime.getTime() - item.takenTime.getTime()) /
  //     (1000 * 60 * 60 * 24);
  //   item.total = item.pricePerDay * item.quantity * Math.ceil(duration);
  // }

  await item.save();
  return item;
};

export const getCustomerRentalItemsService = async (customerId: string) => {
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new Error("Invalid customerId");
  }

  // Find the customer's open rental
  const rental = await Rental.findOne({ customer: customerId, status: "OPEN" });
  if (!rental) {
    return null; // No open rental
  }

  // Get all items for this rental
  const items = await RentalItem.find({ rental: rental._id }).populate(
    "product",
  );

  // Get all payments made for this rental
  const payments = await Payment.find({ rental: rental._id });

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  const remainingBalance = rental.finalAmount - totalPaid;

  return {
    rental,
    items,
    payments,
    totalPaid,
    remainingBalance,
  };
};

export const getAllCustomerRentalsService = async (customerId: string) => {
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new Error("Invalid customerId");
  }

  // Fetch all rentals for the customer
  const rentals = await Rental.find({ customer: customerId }).sort({
    createdAt: -1,
  });

  const results = [];

  for (const rental of rentals) {
    // Get rental items
    const items = await RentalItem.find({ rental: rental._id }).populate(
      "product",
    );

    // Get payments
    const payments = await Payment.find({ rental: rental._id });

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingBalance = rental.finalAmount - totalPaid;

    results.push({
      rental,
      items,
      payments,
      totalPaid,
      remainingBalance,
    });
  }

  return results;
};

export const closeRentalService = async ({
  rentalId,
  discount = 0,
}: CloseRentalInput) => {
  if (!mongoose.Types.ObjectId.isValid(rentalId)) {
    throw new Error("Invalid rentalId");
  }

  const rental = await Rental.findById(rentalId);
  if (!rental) {
    throw new Error("Rental not found");
  }

  if (rental.status === "CLOSED") {
    throw new Error("Rental is already closed");
  }

  // Fetch all items for this rental
  const rentalItems = await RentalItem.find({ rental: rental._id });

  // Check if any items do not have returnedTime
  const pendingItems = rentalItems.filter((item) => !item.returnedTime);

  if (pendingItems.length > 0) {
    throw new Error(
      `Cannot close rental. ${pendingItems.length} item(s) have not been returned yet.`,
    );
  }

  // All items returned — calculate total
  const totalAmount = rentalItems.reduce((sum, item) => sum + item.total, 0);

  rental.totalAmount = totalAmount;
  rental.discount = discount;
  rental.finalAmount = totalAmount - discount;
  rental.status = "CLOSED";

  await rental.save();

  return rental;
};

// export const getRentalDetailsService = async (rentalId: string) => {
//   const rental = await Rental.findById(rentalId).populate("customer");

//   if (!rental) {
//     throw new Error("Rental not found");
//   }

//   const items = await RentalItem.find({ rental: rentalId }).populate("product");
//   const payments = await Payment.find({ rental: rentalId });

//   const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
//   const remainingBalance = rental.finalAmount - totalPaid;

//   return {
//     rental,
//     items,
//     payments,
//     totalPaid,
//     remainingBalance,
//     status: rental.status,
//   };
// };

// export const getOpenRentalsService = async () => {
//   const rentals = await Rental.aggregate([
//     {
//       $match: { status: "OPEN" },
//     },
//     {
//       $lookup: {
//         from: "payments",
//         localField: "_id",
//         foreignField: "rental",
//         as: "payments",
//       },
//     },
//     {
//       $addFields: {
//         totalPaid: { $sum: "$payments.amount" },
//       },
//     },
//     {
//       $addFields: {
//         remainingBalance: {
//           $subtract: ["$finalAmount", "$totalPaid"],
//         },
//       },
//     },
//     {
//       $lookup: {
//         from: "customers",
//         localField: "customer",
//         foreignField: "_id",
//         as: "customer",
//       },
//     },
//     {
//       $unwind: "$customer",
//     },
//     {
//       $sort: { createdAt: -1 },
//     },
//     {
//       $project: {
//         payments: 0,
//       },
//     },
//   ]);

//   return rentals;
// };

// export const getRentalsByCustomerService = async (customerId: string) => {
//   const rentals = await Rental.find({ customer: customerId })
//     .populate("customer")
//     .sort({ createdAt: -1 });

//   const result = [];
//   let totalOutstanding = 0;

//   for (const rental of rentals) {
//     const payments = await Payment.find({ rental: rental._id });

//     const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
//     const remainingBalance = rental.finalAmount - totalPaid;

//     if (remainingBalance > 0) {
//       totalOutstanding += remainingBalance;
//     }

//     result.push({
//       rentalId: rental._id,
//       finalAmount: rental.finalAmount,
//       totalPaid,
//       remainingBalance,
//       status: rental.status,
//       createdAt: rental.createdAt,
//     });
//   }

//   return {
//     rentals: result,
//     totalOutstanding,
//   };
// };
