import { Router } from "express";
import {
  addPayment,
  applyCreditToRental,
} from "../controllers/payment.controller";

const router = Router();

router.post("/", addPayment);
router.post("/apply-credit", applyCreditToRental);

export default router;
