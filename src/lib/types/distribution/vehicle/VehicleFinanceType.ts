import { Timestamp } from "firebase/firestore";

export type VehicleFinanceStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";

export type VehicleFinanceType = {
  id: string;

  vehicleId: string;

  financeCompany: string;

  loanAccountNumber?: string;

  loanAmount: number;

  emiAmount: number;

  numberOfInstallments: number;

  startDate: Timestamp;

  endDate: Timestamp;

  status: VehicleFinanceStatus;

  remarks?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
};