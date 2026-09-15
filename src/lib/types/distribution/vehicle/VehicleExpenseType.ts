import { Timestamp } from "firebase/firestore";

export type VehicleExpenseType =
  | "FUEL"
  | "REPAIR"
  | "SERVICE"
  | "TYRE"
  | "PARTS"
  | "TOLL"
  | "PARKING"
  | "OTHER";

export type VehicleExpenseTypeRecord = {
  id: string;

  vehicleId: string;

  type: VehicleExpenseType;

  amount: number;

  expenseDate: Timestamp;

  description?: string;

  referenceNumber?: string;

  documentUrl?: string;

  createdBy: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
};