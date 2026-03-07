"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPayment = void 0;
const payment_services_1 = require("../services/payment.services");
const addPayment = async (req, res) => {
    try {
        const result = await (0, payment_services_1.addPaymentService)(req.body);
        res.status(201).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        const message = error.message || "Failed to add payment";
        const statusCode = message === "Rental not found"
            ? 404
            : message.includes("exceeds") || message.includes("closed")
                ? 400
                : 500;
        res.status(statusCode).json({
            success: false,
            message,
        });
    }
};
exports.addPayment = addPayment;
