import { Router } from "express";
import { getCustomerRunningCredit } from "../controllers/customer.controller";
import {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controller";

const router = Router();

router.get("/:customerId/running-credit", getCustomerRunningCredit);
router.post("/", createCustomer);
router.get("/", getCustomers);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
