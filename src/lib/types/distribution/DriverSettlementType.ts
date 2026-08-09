export type DriverSettlementStatus =
  | "OPEN"
  | "SETTLED"
  | "SHORT"
  | "EXCESS";

export type DriverSettlement = {
  settlementId: string;
  tripId: string;

  vehicleId: string;
  vehicleName: string;

  driverId: string;
  driverName: string;

  // ---------------------------------------
  // OPENING
  // ---------------------------------------

  openingCash: number;

  // ---------------------------------------
  // NEW SALES
  // ---------------------------------------

  totalSalesAmount: number;

  newSaleCashCollected: number;

  newSaleCreditAmount: number;

  // ---------------------------------------
  // OLD CREDIT COLLECTION
  // ---------------------------------------

  oldCreditCollected: number;

  // ---------------------------------------
  // CASH
  // ---------------------------------------

  totalCashCollected: number;

  // ---------------------------------------
  // EXPENSES
  // ---------------------------------------

  totalExpenses: number;

  // ---------------------------------------
  // SETTLEMENT
  // ---------------------------------------

  amountPayableToManager: number;

  amountHandedOver: number;

  shortageAmount: number;

  excessAmount: number;

  status: DriverSettlementStatus;

  remarks?: string;

  createdAt?: Date;
  updatedAt?: Date;
  settledAt?: Date;
};