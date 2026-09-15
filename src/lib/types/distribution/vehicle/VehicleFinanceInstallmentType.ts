import { Timestamp } from "firebase/firestore";

export type VehicleEMIStatus =
  | "PENDING"
  | "PAID"
  | "OVERDUE"
  | "WAIVED";

export type VehicleFinanceInstallmentType = {
  id: string;

  vehicleId: string;
  financeId: string;

  installmentNumber: number;

  dueDate: Timestamp;

  amount: number;

  principalAmount?: number;
  interestAmount?: number;

  status: VehicleEMIStatus;

  paidDate?: Timestamp;

  paymentReference?: string;

  remarks?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
};