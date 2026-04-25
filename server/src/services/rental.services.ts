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

  // update the item's total directly
  item.total = newPrice;
  await item.save();

  // if this item is returned (or any other returned items exist), the
  // parent rental's totals need to reflect the new price.  We only sum
  // items that have a returnedTime since the open-rental summary only
  // displays those.
  const rentalItems = await RentalItem.find({
    rental: item.rental,
    returnedTime: { $ne: null },
  });

  const totalAmount = rentalItems.reduce((sum, ri) => sum + ri.total, 0);

  const rental = await Rental.findById(item.rental);
  if (rental) {
    rental.totalAmount = totalAmount;
    // apply any existing discount (normally 0 for open rentals)
    rental.finalAmount = totalAmount - (rental.discount || 0);
    await rental.save();
  }

  return item;
};

export const deleteRentalItemService = async (rentalItemId: string) => {
  console.log("entered");
  if (!mongoose.Types.ObjectId.isValid(rentalItemId)) {
    throw new Error("Invalid rentalItemId");
  }

  const item = await RentalItem.findById(rentalItemId);
  if (!item) {
    throw new Error("Rental item not found");
  }

  if (!item.returnedTime) {
    throw new Error("Cannot delete item that has not been returned");
  }

  const rental = await Rental.findById(item.rental);
  if (!rental) {
    throw new Error("Parent rental not found");
  }

  console.log(`Deleting rental item ${rentalItemId} from rental ${rental._id}`);

  // Allow deleting returned items even for closed rentals (keeping flow simple).
  // This may leave final total/back references for closed rentals, so recompute accordingly.
  await RentalItem.findByIdAndDelete(item._id);

  // Recalculate totals for the rental (only returned items)
  const returnedItems = await RentalItem.find({
    rental: rental._id,
    returnedTime: { $ne: null },
  });

  const totalAmount = returnedItems.reduce((sum, ri) => sum + ri.total, 0);

  rental.totalAmount = totalAmount;
  rental.finalAmount = totalAmount - (rental.discount || 0);
  await rental.save();

  return { rental, deletedItemId: rentalItemId };
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

  // Recalculate totals from the item records (safeguard if rental document is stale)
  const returnedItemsTotal = items
    .filter((i) => i.returnedTime)
    .reduce((sum, i) => sum + i.total, 0);
  if (rental.totalAmount !== returnedItemsTotal) {
    rental.totalAmount = returnedItemsTotal;
    rental.finalAmount = returnedItemsTotal - (rental.discount || 0);
    await rental.save();
  }

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

    // recalc totals from items
    const returnedItemsTotal = items
      .filter((i) => i.returnedTime)
      .reduce((sum, i) => sum + i.total, 0);

    if (rental.totalAmount !== returnedItemsTotal) {
      rental.totalAmount = returnedItemsTotal;
      rental.finalAmount = returnedItemsTotal - (rental.discount || 0);
      await rental.save();
    }

    results.push({
      rental,
      items,
    });
  }

  return results;
};

export const reopenRentalService = async (rentalId: string) => {
  if (!mongoose.Types.ObjectId.isValid(rentalId)) {
    throw new Error("Invalid rentalId");
  }

  const rental = await Rental.findById(rentalId);
  if (!rental) {
    throw new Error("Rental not found");
  }

  if (rental.status !== "CLOSED") {
    throw new Error("Only closed rentals can be reopened");
  }

  const existingOpen = await Rental.findOne({
    customer: rental.customer,
    status: "OPEN",
  });

  if (existingOpen) {
    throw new Error("Cannot reopen rental while another open rental exists for this customer");
  }

  // Re-open rental for edits/payments. Recompute totals from returned items
  // and clear discount so remaining balance is accurate for the reopened state.
  const returnedItems = await RentalItem.find({ rental: rental._id, returnedTime: { $ne: null } });
  const returnTotal = returnedItems.reduce((sum, ri) => sum + ri.total, 0);

  rental.totalAmount = returnTotal;
  rental.discount = 0;
  rental.finalAmount = returnTotal;
  rental.status = "OPEN";

  await rental.save();

  return rental;
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
