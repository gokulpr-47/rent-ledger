"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerRunningCreditService = exports.deleteCustomerService = exports.updateCustomerService = exports.getCustomersService = exports.createCustomerService = void 0;
const customer_model_1 = require("../models/customer.model");
const rental_model_1 = require("../models/rental.model");
const payment_model_1 = require("../models/payment.model");
const mongoose_1 = __importDefault(require("mongoose"));
const createCustomerService = async (data) => {
    return await customer_model_1.Customer.create(data);
};
exports.createCustomerService = createCustomerService;
const getCustomersService = async (page = 1, limit = 10, search = "", sort = "-createdAt") => {
    const skip = (page - 1) * limit;
    // ✅ Whitelist allowed sort fields
    const allowedSortFields = ["name", "email", "phone", "createdAt"];
    const cleanSortField = sort.replace("-", "");
    if (!allowedSortFields.includes(cleanSortField)) {
        sort = "-createdAt";
    }
    // Search filter
    const searchFilter = search
        ? {
            $or: [
                { name: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ],
        }
        : {};
    // Sorting logic
    let sortOption = {};
    if (sort.startsWith("-")) {
        sortOption[sort.substring(1)] = -1;
    }
    else {
        sortOption[sort] = 1;
    }
    const [customers, totalDocuments] = await Promise.all([
        customer_model_1.Customer.find(searchFilter).sort(sortOption).skip(skip).limit(limit),
        customer_model_1.Customer.countDocuments(searchFilter),
    ]);
    const totalPages = Math.ceil(totalDocuments / limit);
    return {
        customers,
        pagination: {
            totalDocuments,
            totalPages,
            currentPage: page,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
};
exports.getCustomersService = getCustomersService;
const updateCustomerService = async (id, data) => {
    const customer = await customer_model_1.Customer.findByIdAndUpdate(id, data, {
        new: true,
    });
    if (!customer) {
        throw new Error("Customer not found");
    }
    return customer;
};
exports.updateCustomerService = updateCustomerService;
const deleteCustomerService = async (id) => {
    const customer = await customer_model_1.Customer.findByIdAndDelete(id);
    if (!customer) {
        throw new Error("Customer not found");
    }
    return customer;
};
exports.deleteCustomerService = deleteCustomerService;
const getCustomerRunningCreditService = async (customerId) => {
    // Validate ObjectId
    if (!mongoose_1.default.Types.ObjectId.isValid(customerId)) {
        throw new Error("Invalid customer ID");
    }
    // Check if customer exists
    const customer = await customer_model_1.Customer.findById(customerId);
    if (!customer) {
        throw new Error("Customer not found");
    }
    // Get OPEN rentals
    const rentals = await rental_model_1.Rental.find({
        customer: customerId,
        status: "OPEN",
    });
    const rentalIds = rentals.map((r) => r._id);
    // Calculate total rental amount
    const totalRentals = rentals.reduce((sum, rental) => sum + (rental.finalAmount || 0), 0);
    // Get payments related to those rentals
    const payments = await payment_model_1.Payment.find({
        rental: { $in: rentalIds },
    });
    // Calculate total payments
    const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const remainingBalance = totalRentals - totalPayments;
    return {
        totalRentals,
        totalPayments,
        remainingBalance,
    };
};
exports.getCustomerRunningCreditService = getCustomerRunningCreditService;
