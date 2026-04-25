import { Router } from "express";
import {
  addItemsToOpenRental,
  updateReturnedTime,
  updateRentalItemPrice,
  getCustomerRentalItems,
  getAllCustomerRentals,
  deleteRentalItem,
  closeRental,
  reopenRental,
} from "../controllers/rental.controller";

const router = Router();

router.post("/", addItemsToOpenRental);
router.patch("/item/:rentalItemId/return", updateReturnedTime);
router.patch("/item/:rentalItemId/price", updateRentalItemPrice);
router.delete("/item/:rentalItemId", deleteRentalItem);
router.get("/:customerId/rental-items", getCustomerRentalItems);
router.get("/:customerId/rentals", getAllCustomerRentals);
router.patch("/:rentalId/close", closeRental);router.patch('/:rentalId/reopen', reopenRental);
export default router;
