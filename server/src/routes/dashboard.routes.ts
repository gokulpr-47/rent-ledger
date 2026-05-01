import { Router } from "express";
import { getDashboardSummary, getOpenRentals } from "../controllers/dashboard.controller";

const router = Router();

router.get("/summary", getDashboardSummary);
router.get("/open-rentals", getOpenRentals);

export default router;
