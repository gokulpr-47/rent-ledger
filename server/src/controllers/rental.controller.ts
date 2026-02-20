import { Request, Response } from "express";
import {
  addItemsToOpenRentalService,
  getCustomerRentalItemsService,
  updateReturnedTimeService,
  updateRentalItemPriceService,
  getAllCustomerRentalsService,
  closeRentalService,
} from "../services/rental.services";

export const addItemsToOpenRental = async (req: Request, res: Response) => {
  try {
    const { customerId, items } = req.body;

    if (!customerId || !items) {
      return res.status(400).json({
        success: false,
        message: "customerId and items are required",
      });
    }

    const result = await addItemsToOpenRentalService({ customerId, items });

    res.status(201).json({
      success: true,
      message: "Items added to rental successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add items to rental",
    });
  }
};

export const updateReturnedTime = async (req: Request, res: Response) => {
  try {
    const { rentalItemId } = req.params as { rentalItemId: string };
    const { returnedTime } = req.body;

    if (!returnedTime) {
      return res.status(400).json({
        success: false,
        message: "returnedTime is required",
      });
    }
    console.log(
      "Updating returned time for rental item:",
      rentalItemId,
      returnedTime,
    );
    const result = await updateReturnedTimeService({
      rentalItemId,
      returnedTime,
    });

    res.status(200).json({
      success: true,
      message: "Returned time updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update returned time",
    });
  }
};

export const updateRentalItemPrice = async (req: Request, res: Response) => {
  try {
    const { rentalItemId } = req.params as { rentalItemId: string };
    const { price } = req.body;

    if (price === undefined || price < 0) {
      return res.status(400).json({ success: false, message: "Invalid price" });
    }

    const updatedItem = await updateRentalItemPriceService(rentalItemId, price);

    res.status(200).json({ success: true, data: updatedItem });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerRentalItems = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params as { customerId: string };

    const data = await getCustomerRentalItemsService(customerId);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No open rentals found for this customer",
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch customer rental items",
    });
  }
};

export const getAllCustomerRentals = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params as { customerId: string };

    const data = await getAllCustomerRentalsService(customerId);

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch rentals for customer",
    });
  }
};

export const closeRental = async (req: Request, res: Response) => {
  try {
    const { rentalId } = req.params as { rentalId: string };
    const { discount } = req.body;

    const rental = await closeRentalService({ rentalId, discount });

    res.status(200).json({
      success: true,
      message: "Rental closed successfully",
      data: rental,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to close rental",
    });
  }
};

// export const getRentalDetails = async (req: Request, res: Response) => {
//   try {
//     const data = await getRentalDetailsService(req.params.id as string);

//     res.status(200).json({
//       success: true,
//       data,
//     });
//   } catch (error: any) {
//     res.status(error.message === "Rental not found" ? 404 : 500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// export const getOpenRentals = async (req: Request, res: Response) => {
//   try {
//     const data = await getOpenRentalsService();

//     res.status(200).json({
//       success: true,
//       count: data.length,
//       data,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch open rentals",
//     });
//   }
// };

// export const getRentalsByCustomer = async (req: Request, res: Response) => {
//   try {
//     const { rentals, totalOutstanding } = await getRentalsByCustomerService(
//       req.params.customerId as string,
//     );

//     res.status(200).json({
//       success: true,
//       count: rentals.length,
//       totalOutstanding,
//       data: rentals,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch rentals for customer",
//     });
//   }
// };
