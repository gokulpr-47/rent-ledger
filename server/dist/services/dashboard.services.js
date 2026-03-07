"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDashboardSummary = void 0;
const rental_model_1 = require("../models/rental.model");
const payment_model_1 = require("../models/payment.model");
const calculateDashboardSummary = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysPayments = await payment_model_1.Payment.find({
        createdAt: { $gte: today },
    });
    const todaysRevenue = todaysPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const openRentals = await rental_model_1.Rental.find({ status: "OPEN" });
    let totalOutstanding = 0;
    for (const rental of openRentals) {
        const payments = await payment_model_1.Payment.find({ rental: rental._id });
        const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
        totalOutstanding += rental.finalAmount - totalPaid;
    }
    const customersWithDebt = new Set(openRentals.map((r) => r.customer.toString()));
    return {
        todaysRevenue,
        totalOutstanding,
        openRentalsCount: openRentals.length,
        customersWithOutstanding: customersWithDebt.size,
    };
};
exports.calculateDashboardSummary = calculateDashboardSummary;
