import { Router } from "express";
import { addPayment } from "../controllers/payment.controller";

const router = Router();

router.post("/", addPayment);

export default router;
