export * from './rental.types';

// export types from models for shared use
import { ICustomer } from '../models/customer.model';
import { IProduct } from '../models/product.model';
import { IRental } from '../models/rental.model';
import { IRentalItem } from '../models/rentalItem.model';
import { IPayment } from '../models/payment.model';

export type CustomerType = ICustomer;
export type ProductType = IProduct;
export type RentalType = IRental;
export type RentalItemType = IRentalItem;
export type PaymentType = IPayment;
