"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerRunningCredit = exports.deleteCustomer = exports.updateCustomer = exports.getCustomers = exports.createCustomer = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const customer_services_1 = require("../services/customer.services");
const createCustomer = async (req, res) => {
    try {
        const customer = await (0, customer_services_1.createCustomerService)(req.body);
        res.status(201).json({ success: true, data: customer });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create customer",
        });
    }
};
exports.createCustomer = createCustomer;
const getCustomers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const search = req.query.search || "";
        const sort = req.query.sort || "-createdAt";
        const result = await (0, customer_services_1.getCustomersService)(page, limit, search, sort);
        res.json({
            success: true,
            data: result.customers,
            pagination: result.pagination,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch customers",
        });
    }
};
exports.getCustomers = getCustomers;
const updateCustomer = async (req, res) => {
    try {
        const customer = await (0, customer_services_1.updateCustomerService)(req.params.id, req.body);
        res.json({ success: true, data: customer });
    }
    catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res) => {
    try {
        await (0, customer_services_1.deleteCustomerService)(req.params.id);
        res.json({ success: true, message: "Customer deleted" });
    }
    catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};
exports.deleteCustomer = deleteCustomer;
const getCustomerRunningCredit = async (req, res) => {
    try {
        const { customerId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID",
            });
        }
        const result = await (0, customer_services_1.getCustomerRunningCreditService)(customerId);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to calculate running credit",
        });
    }
};
exports.getCustomerRunningCredit = getCustomerRunningCredit;
