"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

type SettleDriverTripInput = {
  tripId: string;

  amountHandedOver: number;

  remarks?: string;

  createdBy?: string;
};

export async function settleDriverTrip({
  tripId,
  amountHandedOver,
  remarks,
  createdBy,
}: SettleDriverTripInput) {
  if (!tripId) {
    return {
      success: false,
      message: "Trip is required.",
    };
  }

  if (
    amountHandedOver === undefined ||
    amountHandedOver < 0
  ) {
    return {
      success: false,
      message: "Invalid handed over amount.",
    };
  }

  try {
    await adminDb.runTransaction(async (tx) => {
      // =====================================================
      // REFERENCES
      // =====================================================

      const settlementRef = adminDb
        .collection("salemanSettlements")
        .doc(tripId);

      const tripRef = adminDb
        .collection("distributionTrips")
        .doc(tripId);


      // =====================================================
      // 1. READ ALL DOCUMENTS FIRST
      // =====================================================

      const settlementSnap =
        await tx.get(settlementRef);

      const tripSnap =
        await tx.get(tripRef);


      // =====================================================
      // 2. VALIDATE SETTLEMENT
      // =====================================================

      if (!settlementSnap.exists) {
        throw new Error(
          "Driver settlement not found."
        );
      }


      // =====================================================
      // 3. VALIDATE TRIP
      // =====================================================

      if (!tripSnap.exists) {
        throw new Error(
          "Distribution trip not found."
        );
      }


      const settlement =
        settlementSnap.data()!;

      const trip =
        tripSnap.data()!;


      // =====================================================
      // 4. CHECK ALREADY SETTLED
      // =====================================================

      if (
        settlement.status === "SETTLED"
      ) {
        throw new Error(
          "This trip has already been settled."
        );
      }


      // =====================================================
      // 5. CALCULATE PAYABLE
      // =====================================================

      const amountPayable =
        Number(
          settlement.amountPayableToManager || 0
        );


      const handedOver =
        Number(amountHandedOver || 0);


      // =====================================================
      // 6. CALCULATE SHORTAGE
      // =====================================================

      const shortageAmount =
        handedOver < amountPayable
          ? amountPayable - handedOver
          : 0;


      // =====================================================
      // 7. CALCULATE EXCESS
      // =====================================================

      const excessAmount =
        handedOver > amountPayable
          ? handedOver - amountPayable
          : 0;


      // =====================================================
      // 8. SETTLEMENT DIFFERENCE
      // =====================================================

      const settlementDifference =
        handedOver - amountPayable;


      const now = new Date();


      // =====================================================
      // 9. NOW START WRITES
      // =====================================================

      // ---------------------------------------------
      // UPDATE SALESMAN SETTLEMENT
      // ---------------------------------------------

      tx.update(settlementRef, {

        amountHandedOver:
          handedOver,

        shortageAmount,

        excessAmount,

        status:
          "SETTLED",

        remarks:
          remarks || "",

        settledAt:
          now,

        settledBy:
          createdBy || "ADMIN",

        updatedAt:
          now,
      });


      // ---------------------------------------------
      // UPDATE DISTRIBUTION TRIP
      // ---------------------------------------------

      tx.update(tripRef, {

        totalAmountHandedOver:
          handedOver,

        settlementDifference,

        status:
          "SETTLED",

        updatedAt:
          now,
      });
    });


    // =====================================================
    // SUCCESS
    // =====================================================

    return {
      success: true,

      tripId,

      amountHandedOver,

      message:
        "Trip settled successfully.",
    };


  } catch (error: any) {

    console.error(
      "❌ settleDriverTrip:",
      error
    );

    return {
      success: false,

      message:
        error?.message ||
        "Failed to settle trip.",
    };
  }
}