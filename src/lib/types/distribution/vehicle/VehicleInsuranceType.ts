import { Timestamp } from "firebase/firestore";

export type VehicleInsuranceType = {
  id: string;

  vehicleId: string;

  insuranceCompany: string;

  policyNumber: string;

  startDate: Timestamp;

  expiryDate: Timestamp;

  premiumAmount?: number;

  documentUrl?: string;

  remarks?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
};