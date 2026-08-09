"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

type CreateDriverSettlementInput = {
  tx: admin.firestore.Transaction;

  tripId: string;

  vehicleId: string;
  vehicleName: string;

  driverId?: string;
  driverName?: string;

  openingCash?: number;
};

export async function createDriverSettlement({
  tx,
  tripId,
  vehicleId,
  vehicleName,
  driverId = "",
  driverName = "",
  openingCash = 0,
}: CreateDriverSettlementInput) {
  const ref = adminDb
    .collection("driverSettlements")
    .doc(tripId);

  const now = new Date();

  tx.set(ref, {
    settlementId: tripId,

    tripId,

    vehicleId,
    vehicleName,

    driverId,
    driverName,

    openingCash: Number(openingCash || 0),

    totalSalesAmount: 0,

    newSaleCashCollected: 0,

    newSaleCreditAmount: 0,

    oldCreditCollected: 0,

    totalCashCollected: Number(openingCash || 0),

    totalExpenses: 0,

    amountPayableToManager: Number(
      openingCash || 0
    ),

    amountHandedOver: 0,

    shortageAmount: 0,

    excessAmount: 0,

    status: "OPEN",

    remarks: "",

    createdAt: now,
    updatedAt: now,
  });
}