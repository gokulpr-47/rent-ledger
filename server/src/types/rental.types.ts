export interface CreateRentalItemDTO {
  productId: string;
  quantity: number;
  numberOfDays: number;
  manualAmountOverride?: number;
}

export interface CreateRentalDTO {
  creditGroupId: string;
  billDate: Date;
  discount?: number;
  items: CreateRentalItemDTO[];
}
