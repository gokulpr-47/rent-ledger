import { Request, Response } from "express";
import {
  createProductService,
  updateProductService,
  deleteProductService,
  getProductsService,
} from "../services/product.services";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await createProductService(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await updateProductService(
      req.params.id as string,
      req.body,
    );

    res.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await deleteProductService(req.params.id as string);

    res.json({
      success: true,
      message: "Product deleted",
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;

    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);

    const search = (req.query.search as string) || "";
    const sort = (req.query.sort as string) || "-createdAt";

    const result = await getProductsService(page, limit, search, sort);

    res.json({
      success: true,
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};
