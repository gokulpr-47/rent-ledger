import { Product } from "../models/product.model";
import { RentalItem } from "../models/rentalItem.model";

export const createProductService = async (data: any) => {
  return await Product.create(data);
};

export const updateProductService = async (id: string, data: any) => {
  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

export const deleteProductService = async (id: string) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new Error("Product not found");
  }

  // 🚨 Check if product is used in any rental items
  const existingRentalItem = await RentalItem.findOne({
    product: id,
  });

  if (existingRentalItem) {
    throw new Error("Cannot delete product. It is used in rental records.");
  }

  await Product.findByIdAndDelete(id);

  return { message: "Product deleted successfully" };
};

export const getProductsService = async (
  page: number = 1,
  limit: number = 10,
  search: string = "",
  sort: string = "-createdAt",
) => {
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
  let sortOption: any = {};
  if (sort.startsWith("-")) {
    sortOption[sort.substring(1)] = -1;
  } else {
    sortOption[sort] = 1;
  }

  const [products, totalDocuments] = await Promise.all([
    Product.find(searchFilter).sort(sortOption).skip(skip).limit(limit),
    Product.countDocuments(searchFilter),
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
