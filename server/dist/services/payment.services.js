"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPaymentService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const rental_model_1 = require("../models/rental.model");
const payment_model_1 = require("../models/payment.model");
const rentalItem_model_1 = require("../models/rentalItem.model");
const addPaymentService = async ({ rentalId, amount, itemIds }) => {
  if (!rentalId || !amount || amount <= 0) {
    throw new Error("Valid rentalId and amount are required");
  }
  try {
    const rental = await rental_model_1.Rental.findById(rentalId);
    if (!rental) {
      throw new Error("Rental not found");
    }
    if (rental.status === "CLOSED") {
      throw new Error("Rental already closed");
    }
    // 🔥 Aggregation instead of Payment.find()
    const paymentStats = await payment_model_1.Payment.aggregate([
      {
        $match: {
          rental: new mongoose_1.default.Types.ObjectId(rentalId),
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
    if (amount > remainingBalance) {
      throw new Error(
        `Payment exceeds remaining balance (${remainingBalance})`,
      );
    }
    // item validation
    if (itemIds && itemIds.length > 0) {
      const items = await rentalItem_model_1.RentalItem.find({
        _id: { $in: itemIds },
        rental: rentalId,
      });
      if (items.length !== itemIds.length) {
        throw new Error("One or more itemIds are invalid for this rental");
      }
      const previousPayments = await payment_model_1.Payment.find({
        rental: rentalId,
      });
      const paidSet = new Set();
      previousPayments.forEach((p) => {
        if (p.items && Array.isArray(p.items)) {
          p.items.forEach((id) => paidSet.add(id.toString()));
        }
      });
      for (const id of itemIds) {
        if (paidSet.has(id)) {
          throw new Error("One or more items have already been paid");
        }
      }
    }
    const payment = await payment_model_1.Payment.create({
      rental: rentalId,
      amount,
      items: itemIds,
    });
    const newRemaining = remainingBalance - amount;
    // rental remains open no matter what; closing is handled explicitly
    // via the CloseRentalModal endpoint.
    return {
      payment,
      remainingBalance: newRemaining,
      rentalStatus: rental.status,
    };
  } catch (error) {
    throw error;
  }
};
exports.addPaymentService = addPaymentService;
