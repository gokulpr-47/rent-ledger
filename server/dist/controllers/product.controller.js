"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = void 0;
const product_services_1 = require("../services/product.services");
const createProduct = async (req, res) => {
    try {
        const product = await (0, product_services_1.createProductService)(req.body);
        res.status(201).json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create product",
        });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const product = await (0, product_services_1.updateProductService)(req.params.id, req.body);
        res.json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        await (0, product_services_1.deleteProductService)(req.params.id);
        res.json({
            success: true,
            message: "Product deleted",
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};
exports.deleteProduct = deleteProduct;
const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const search = req.query.search || "";
        const sort = req.query.sort || "-createdAt";
        const result = await (0, product_services_1.getProductsService)(page, limit, search, sort);
        res.json({
            success: true,
            data: result.products,
            pagination: result.pagination,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
        });
    }
};
exports.getProducts = getProducts;
