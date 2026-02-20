import { Router } from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
} from "../controllers/product.controller";

const router = Router();

router.post("/", createProduct);
router.get("/", getProducts);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
