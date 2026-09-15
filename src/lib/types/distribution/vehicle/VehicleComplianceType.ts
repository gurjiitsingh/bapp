import { Timestamp } from "firebase/firestore";

export type VehicleComplianceType =
  | "PASSING"
  | "FITNESS"
  | "PERMIT"
  | "PUC"
  | "ROAD_TAX"
  | "OTHER";

export type VehicleComplianceRecordType = {
  id: string;

  vehicleId: string;

  type: VehicleComplianceType;

  documentNumber?: string;

  issueDate?: Timestamp;

  expiryDate: Timestamp;

  amount?: number;

  documentUrl?: string;

  remarks?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
};