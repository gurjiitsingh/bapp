"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

import { getActiveVehicleTrip } from "../getActiveVehicleTrip";
import { readCustomerAccountData } from "../redDataForSale/readCustomerAccountData";
import { applyCustomerTransaction } from "../../stock-finished/customer/applyCustomerTransaction";

import { PaymentMethodType } from "@/lib/types/distribution/PaymentMethodType";

type RecordTruckCustomerPaymentInput = {
  vehicleId: string;

  customerId: string;
  customerName: string;

  amount: number;

  paymentMethod: PaymentMethodType;

  remarks?: string;
  createdBy?: string;
};

export async function recordTruckCustomerPayment({
  vehicleId,
  customerId,
  customerName,
  amount,
  paymentMethod,
  remarks,
  createdBy,
}: RecordTruckCustomerPaymentInput) {

  if (!vehicleId) {
    return {
      success: false,
      message: "Vehicle is required.",
    };
  }

  if (!customerId) {
    return {
      success: false,
      message: "Customer is required.",
    };
  }

  if (!amount || amount <= 0) {
    return {
      success: false,
      message: "Invalid payment amount.",
    };
  }

  try {

    const paymentId =
      `PAY-${Date.now()}-${crypto.randomUUID()}`;

    await adminDb.runTransaction(async (tx) => {

      // ==========================================
      // ACTIVE TRIP
      // ==========================================

      const activeTrip =
        await getActiveVehicleTrip(
          tx,
          vehicleId
        );

      if (!activeTrip) {
        throw new Error(
          "No active trip found for this vehicle."
        );
      }

      const tripId =
        activeTrip.tripId;

      // ==========================================
      // CUSTOMER ACCOUNT
      // ==========================================

      const {
        currentBalance,
        currentCreditBalance,
      } =
        await readCustomerAccountData({
          tx,
          wholeSaleCutomerId:
            customerId,
        });

      if (amount > currentBalance) {
        throw new Error(
          `Payment exceeds customer outstanding balance. ` +
          `Outstanding: ${currentBalance}`
        );
      }

      // ==========================================
      // CUSTOMER LEDGER
      // ==========================================

      await applyCustomerTransaction(tx, {

        customerId,

        customerName,

        type: "PAYMENT",

        totalAmount: 0,

        returnProductAmount: 0,

        paidAmount: amount,

        dueAmount: 0,

        creditAmount: 0,

        currentCreditBalance,

        currentBalance,

        paymentMethod,

        referenceType:
          "TRIP_PAYMENT",

        referenceId:
          paymentId,

        note:
          remarks ||
          "Previous credit payment collected by driver",

        createdBy:
          createdBy ||
          "ADMIN",

        source: "ADMIN",
      });

      // ==========================================
      // TRUCK PAYMENT RECORD
      // ==========================================

      const paymentRef = adminDb
        .collection("truckPayments")
        .doc(paymentId);

      tx.set(paymentRef, {

        paymentId,

        tripId,

        vehicleId,
        vehicleName:
          activeTrip.vehicleName,

        driverId:
          activeTrip.driverId,

        driverName:
          activeTrip.driverName,

        customerId,

        customerName,

        amount,

        paymentMethod,

        paymentType:
          "OLD_CREDIT_COLLECTION",

        remarks:
          remarks || "",

        createdBy:
          createdBy ||
          "ADMIN",

        createdAt:
          new Date(),

      });

      // ==========================================
      // UPDATE TRIP
      // ==========================================

      const tripRef = adminDb
        .collection("distributionTrips")
        .doc(tripId);

      tx.update(tripRef, {

        totalCashCollected:
          admin.firestore.FieldValue.increment(
            amount
          ),

        totalPreviousCreditCollected:
          admin.firestore.FieldValue.increment(
            amount
          ),

          

        updatedAt:
          new Date(),
      });

      // ==========================================
      // UPDATE DRIVER ACCOUNT
      // ==========================================

      const settlementRef =
        adminDb
          .collection("driverSettlements")
          .doc(tripId);

      tx.update(settlementRef, {

        oldCreditCollected:
          admin.firestore.FieldValue.increment(
            amount
          ),

        totalCashCollected:
          admin.firestore.FieldValue.increment(
            amount
          ),

        amountPayableToManager:
          admin.firestore.FieldValue.increment(
            amount
          ),

        updatedAt:
          new Date(),
      });

    });

    return {
      success: true,
      paymentId,

      message:
        "Customer payment collected successfully.",
    };

  } catch (error: any) {

    console.error(
      "❌ recordTruckCustomerPayment:",
      error
    );

    return {
      success: false,
      message:
        error?.message ||
        "Failed to record customer payment.",
    };
  }
}