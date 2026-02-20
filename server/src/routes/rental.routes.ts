import { Router } from "express";
import {
  addItemsToOpenRental,
  updateReturnedTime,
  updateRentalItemPrice,
  getCustomerRentalItems,
  getAllCustomerRentals,
  closeRental,
} from "../controllers/rental.controller";

const router = Router();

router.post("/", addItemsToOpenRental);
router.patch("/item/:rentalItemId/return", updateReturnedTime);
router.patch("/item/:rentalItemId/price", updateRentalItemPrice);
router.get("/:customerId/rental-items", getCustomerRentalItems);
router.get("/:customerId/rentals", getAllCustomerRentals);
router.patch("/:rentalId/close", closeRental);

export default router;
