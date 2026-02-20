import { Router } from "express";
import { createRental } from "../controllers/rental.controller";
import { getRentalDetails } from "../controllers/rental.controller";
import { getOpenRentals } from "../controllers/rental.controller";
import { getRentalsByCustomer } from "../controllers/rental.controller";

const router = Router();

router.post("/", createRental);
router.get("/open/all", getOpenRentals);
router.get("/:id", getRentalDetails);
router.get("/customer/:customerId", getRentalsByCustomer);

export default router;
