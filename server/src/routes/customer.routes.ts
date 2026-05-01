import { Router } from "express";
import {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
  getCustomerRunningCredit,
  getCustomerById,
} from "../controllers/customer.controller";

const router = Router();

router.get("/:customerId/running-credit", getCustomerRunningCredit);
router.get("/:id", getCustomerById);
router.post("/", createCustomer);
router.get("/", getCustomers);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
