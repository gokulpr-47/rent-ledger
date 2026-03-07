"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeRentalService = exports.getAllCustomerRentalsService = exports.getCustomerRentalItemsService = exports.updateRentalItemPriceService = exports.updateReturnedTimeService = exports.addItemsToOpenRentalService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const rental_model_1 = require("../models/rental.model");
const rentalItem_model_1 = require("../models/rentalItem.model");
const payment_model_1 = require("../models/payment.model");
const product_model_1 = require("../models/product.model");
const addItemsToOpenRentalService = async ({ customerId, items, }) => {
    if (!items || items.length === 0) {
        throw new Error("At least one rental item is required");
    }
    try {
        // 🔎 Find existing OPEN rental or create a new one
        let rental = await rental_model_1.Rental.findOne({
            customer: customerId,
            status: "OPEN",
        });
        if (!rental) {
            const newRental = await rental_model_1.Rental.create({
                customer: customerId,
                totalAmount: 0,
                finalAmount: 0,
                status: "OPEN",
            });
            rental = newRental;
        }
        const rentalItemsToInsert = [];
        // 🔁 Process each item
        for (const item of items) {
            const product = await product_model_1.Product.findById(item.productId);
            if (!product) {
                throw new Error(`Product not found: ${item.productId}`);
            }
            // Determine price per day (override or product price)
            const pricePerDay = item.pricePerDay ?? product.pricePerDay;
            let total = 0;
            let returnedTime = null;
            if (item.returnedTime) {
                returnedTime = new Date(item.returnedTime);
                const takenTime = new Date(item.takenTime);
                const days = Math.ceil((returnedTime.getTime() - takenTime.getTime()) /
                    (1000 * 60 * 60 * 24)) || 1;
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
        const createdItems = await rentalItem_model_1.RentalItem.insertMany(rentalItemsToInsert);
        // 🔹 Recalculate totalAmount (only items with returnedTime)
        const returnedItemsTotals = await rentalItem_model_1.RentalItem.aggregate([
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
    }
    catch (error) {
        throw error;
    }
};
exports.addItemsToOpenRentalService = addItemsToOpenRentalService;
const updateReturnedTimeService = async ({ rentalItemId, returnedTime, }) => {
    const item = await rentalItem_model_1.RentalItem.findById(rentalItemId);
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
    const rentalItems = await rentalItem_model_1.RentalItem.find({
        rental: item.rental,
        returnedTime: { $ne: null },
    });
    const totalAmount = rentalItems.reduce((sum, ri) => sum + ri.total, 0);
    const rental = await rental_model_1.Rental.findById(item.rental);
    if (rental) {
        rental.totalAmount = totalAmount;
        rental.finalAmount = totalAmount; // discount only applied when closing credit
        await rental.save();
    }
    return { item, rental };
};
exports.updateReturnedTimeService = updateReturnedTimeService;
const updateRentalItemPriceService = async (rentalItemId, newPrice) => {
    const item = await rentalItem_model_1.RentalItem.findById(rentalItemId);
    if (!item)
        throw new Error("Rental item not found");
    item.pricePerDay = newPrice;
    // Optionally, recalc total if returnedTime exists
    if (item.returnedTime) {
        const duration = (item.returnedTime.getTime() - item.takenTime.getTime()) /
            (1000 * 60 * 60 * 24);
        item.total = item.pricePerDay * item.quantity * Math.ceil(duration);
    }
    await item.save();
    return item;
};
exports.updateRentalItemPriceService = updateRentalItemPriceService;
const getCustomerRentalItemsService = async (customerId) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(customerId)) {
        throw new Error("Invalid customerId");
    }
    // Find the customer's open rental
    const rental = await rental_model_1.Rental.findOne({ customer: customerId, status: "OPEN" });
    if (!rental) {
        return null; // No open rental
    }
    // Get all items for this rental
    const items = await rentalItem_model_1.RentalItem.find({ rental: rental._id }).populate("product");
    // Get all payments made for this rental
    const payments = await payment_model_1.Payment.find({ rental: rental._id });
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
exports.getCustomerRentalItemsService = getCustomerRentalItemsService;
const getAllCustomerRentalsService = async (customerId) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(customerId)) {
        throw new Error("Invalid customerId");
    }
    // Fetch all rentals for the customer
    const rentals = await rental_model_1.Rental.find({ customer: customerId }).sort({
        createdAt: -1,
    });
    const results = [];
    for (const rental of rentals) {
        // Get rental items
        const items = await rentalItem_model_1.RentalItem.find({ rental: rental._id }).populate("product");
        // Get payments
        const payments = await payment_model_1.Payment.find({ rental: rental._id });
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
exports.getAllCustomerRentalsService = getAllCustomerRentalsService;
const closeRentalService = async ({ rentalId, discount = 0, }) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(rentalId)) {
        throw new Error("Invalid rentalId");
    }
    const rental = await rental_model_1.Rental.findById(rentalId);
    if (!rental) {
        throw new Error("Rental not found");
    }
    if (rental.status === "CLOSED") {
        throw new Error("Rental is already closed");
    }
    // Fetch all items for this rental
    const rentalItems = await rentalItem_model_1.RentalItem.find({ rental: rental._id });
    // Check if any items do not have returnedTime
    const pendingItems = rentalItems.filter((item) => !item.returnedTime);
    if (pendingItems.length > 0) {
        throw new Error(`Cannot close rental. ${pendingItems.length} item(s) have not been returned yet.`);
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
exports.closeRentalService = closeRentalService;
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
