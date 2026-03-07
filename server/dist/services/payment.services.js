"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPaymentService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const rental_model_1 = require("../models/rental.model");
const payment_model_1 = require("../models/payment.model");
const addPaymentService = async ({ rentalId, amount, }) => {
    if (!rentalId || !amount || amount <= 0) {
        throw new Error("Valid rentalId and amount are required");
    }
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const rental = await rental_model_1.Rental.findById(rentalId).session(session);
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
        ]).session(session);
        const totalPaid = paymentStats.length > 0 ? paymentStats[0].totalPaid : 0;
        const remainingBalance = rental.finalAmount - totalPaid;
        if (amount > remainingBalance) {
            throw new Error(`Payment exceeds remaining balance (${remainingBalance})`);
        }
        const payment = await payment_model_1.Payment.create([
            {
                rental: rentalId,
                amount,
            },
        ], { session });
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
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
exports.addPaymentService = addPaymentService;
