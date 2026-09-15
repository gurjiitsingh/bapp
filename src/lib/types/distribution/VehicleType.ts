import { StorageType } from "./StorageType";

export type VehicleStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SOLD"
  | "SCRAPPED";

export type VehicleType = {
  id: string;

  // Existing field — keep for backward compatibility
  locationCode: string; // PB10AB1234

  // New field — use this going forward
  vehicleNumber: string; // PB10AB1234

  name: string; // Pickup, Tata Ace, Bolero

  capacity?: number;

  type: StorageType;

  wholeSalePrice?: number;

  responsiblePersonId: string; // Employee ID
  responsiblePersonName: string; // Snapshot

  active: boolean;

  remarks?: string;
VehicleStatus?: VehicleStatus;
  createdAt?: number;
  updatedAt: number;
};