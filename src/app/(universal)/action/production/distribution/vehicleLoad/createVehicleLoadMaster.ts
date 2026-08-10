"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { VehicleLoadStatus } from "@/lib/types/distribution/VehicleLoadStatus";

import admin from "firebase-admin";

type CreateVehicleLoadMasterInput = {
  // =====================================================
  // LOAD
  // =====================================================

  loadId: string;
  loadNo: string;

  // =====================================================
  // TRIP
  // =====================================================

  tripId: string;

  // =====================================================
  // ROUTE
  // =====================================================

  routeId: string;
  routeName: string;

  // =====================================================
  // SALESMAN
  // =====================================================

  salesmanId?: string;
  salesmanName?: string;

  // =====================================================
  // LEGACY DRIVER
  // =====================================================
  //
  // Keep for old records / compatibility.
  //

  driverId?: string;
  driverName?: string;

  // =====================================================
  // VEHICLE
  // =====================================================

  vehicleId: string;
  vehicleName: string;
  locationCode?: string;

  // =====================================================
  // LEGACY RESPONSIBLE PERSON
  // =====================================================

  responsiblePerson?: string;

  // =====================================================
  // META
  // =====================================================

  remarks?: string;
  createdBy?: string;

  // =====================================================
  // TOTALS
  // =====================================================

  totalItems: number;
  totalQuantity: number;
  totalValue: number;

  businessDate: string;

  status: VehicleLoadStatus;
};


// =====================================================
// CREATE VEHICLE LOAD MASTER
// =====================================================

export async function createVehicleLoadMaster(
  tx: FirebaseFirestore.Transaction,
  input: CreateVehicleLoadMasterInput
) {

  const ref = adminDb
    .collection("vehicleLoads")
    .doc(input.loadId);


  tx.set(ref, {

    // ===================================================
    // LOAD
    // ===================================================

    loadId:
      input.loadId,

    loadNo:
      input.loadNo,

    // ===================================================
    // TRIP
    // ===================================================

    tripId:
      input.tripId,

    // ===================================================
    // ROUTE
    // ===================================================

    routeId:
      input.routeId || "",

    routeName:
      input.routeName || "",

    // ===================================================
    // SALESMAN
    // ===================================================

    salesmanId:
      input.salesmanId || "",

    salesmanName:
      input.salesmanName || "",

    // ===================================================
    // LEGACY DRIVER
    // ===================================================

    driverId:
      input.driverId ||
      input.salesmanId ||
      "",

    driverName:
      input.driverName ||
      input.salesmanName ||
      "",

    // ===================================================
    // VEHICLE
    // ===================================================

    vehicleId:
      input.vehicleId,

    vehicleName:
      input.vehicleName,

    locationCode:
      input.locationCode || "",

    // ===================================================
    // LEGACY RESPONSIBLE PERSON
    // ===================================================

    responsiblePerson:
      input.responsiblePerson ||
      input.salesmanName ||
      "",

    // ===================================================
    // META
    // ===================================================

    remarks:
      input.remarks || "",

    createdBy:
      input.createdBy || "",

    businessDate:
      input.businessDate,

    // ===================================================
    // TOTALS
    // ===================================================

    totalItems:
      input.totalItems,

    totalQuantity:
      input.totalQuantity,

    totalValue:
      input.totalValue,

    // ===================================================
    // STATUS
    // ===================================================

    status:
      input.status,

    // ===================================================
    // TIMESTAMPS
    // ===================================================

    createdAt:
      admin.firestore.FieldValue.serverTimestamp(),

    updatedAt:
      admin.firestore.FieldValue.serverTimestamp(),
  });


  return ref;
}