"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsService = exports.deleteProductService = exports.updateProductService = exports.createProductService = void 0;
const product_model_1 = require("../models/product.model");
const rentalItem_model_1 = require("../models/rentalItem.model");
const createProductService = async (data) => {
    return await product_model_1.Product.create(data);
};
exports.createProductService = createProductService;
const updateProductService = async (id, data) => {
    const product = await product_model_1.Product.findByIdAndUpdate(id, data, {
        new: true,
    });
    if (!product) {
        throw new Error("Product not found");
    }
    return product;
};
exports.updateProductService = updateProductService;
const deleteProductService = async (id) => {
    const product = await product_model_1.Product.findById(id);
    if (!product) {
        throw new Error("Product not found");
    }
    // 🚨 Check if product is used in any rental items
    const existingRentalItem = await rentalItem_model_1.RentalItem.findOne({
        product: id,
    });
    if (existingRentalItem) {
        throw new Error("Cannot delete product. It is used in rental records.");
    }
    await product_model_1.Product.findByIdAndDelete(id);
    return { message: "Product deleted successfully" };
};
exports.deleteProductService = deleteProductService;
const getProductsService = async (page = 1, limit = 10, search = "", sort = "-createdAt") => {
    const skip = (page - 1) * limit;
    // ✅ Whitelist allowed sort fields
    const allowedSortFields = ["name", "price", "category", "createdAt"];
    const cleanSortField = sort.replace("-", "");
    if (!allowedSortFields.includes(cleanSortField)) {
        sort = "-createdAt";
    }
    // 🔎 Search filter
    const searchFilter = search
        ? {
            $or: [
                { name: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
            ],
        }
        : {};
    // 🔁 Sorting logic
    let sortOption = {};
    if (sort.startsWith("-")) {
        sortOption[sort.substring(1)] = -1;
    }
    else {
        sortOption[sort] = 1;
    }
    const [products, totalDocuments] = await Promise.all([
        product_model_1.Product.find(searchFilter).sort(sortOption).skip(skip).limit(limit),
        product_model_1.Product.countDocuments(searchFilter),
    ]);
    const totalPages = Math.ceil(totalDocuments / limit);
    return {
        products,
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
exports.getProductsService = getProductsService;
