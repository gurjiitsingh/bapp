 
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { addStockMovement } from "../addStockMovement";

// =====================================================
// TYPES
// =====================================================

export type VehicleStockReturnType =
  | "SPOILED"
  | "DAMAGED"
  | "UNSOLD_RETURN"
  | "CUSTOMER_RETURN";

type ReturnVehicleStockProps = {
  // ===================================================
  // TRIP
  // ===================================================

  tripId: string;
  tripNo: string;

  // ===================================================
  // VEHICLE
  // ===================================================

  vehicleId: string;
  vehicleName: string;
  locationCode: string;

  // ===================================================
  // SALESMAN
  // ===================================================

  salesmanId: string;
  salesmanName: string;

  // ===================================================
  // PRODUCT
  // ===================================================

  productId: string;
  productName: string;

  quantity: number;

  // ===================================================
  // PRICE
  // ===================================================

  wholesalePrice: number;

  sellingPrice?: number;
  costPrice?: number;
  avgCost?: number;

  // ===================================================
  // RETURN
  // ===================================================

  returnType: VehicleStockReturnType;

  reason?: string;

  // ===================================================
  // CUSTOMER
  // ===================================================

  customerId?: string;
  customerName?: string;

  // ===================================================
  // META
  // ===================================================

  remarks?: string;
  createdBy?: string;
};

// =====================================================
// RETURN VEHICLE STOCK
// =====================================================
//
// IMPORTANT:
//
// This function DOES NOT change stock.
//
// It only:
//   1. Creates vehicleStockReturns record
//   2. Creates stock movement/history record
//
// Customer return:
//
//   CUSTOMER
//       ↓
//   RETURN RECORD
//
// Truck stock remains unchanged.
//
// =====================================================

export async function returnVehicleStock({
  tripId,
  tripNo,

  vehicleId,
  vehicleName,
  locationCode,

  salesmanId,
  salesmanName,

  productId,
  productName,

  quantity,

  wholesalePrice,

  sellingPrice = 0,
  costPrice = 0,
  avgCost = 0,

  returnType,

  reason,

  customerId = "",
  customerName = "",

  remarks,
  createdBy,
}: ReturnVehicleStockProps) {
  const db = adminDb;

  try {
    // =================================================
    // BASIC VALIDATION
    // =================================================

    if (!tripId) {
      return {
        success: false,
        message: "Trip is required.",
      };
    }

    if (!tripNo) {
      return {
        success: false,
        message: "Trip number is required.",
      };
    }

    if (!vehicleId) {
      return {
        success: false,
        message: "Vehicle is required.",
      };
    }

    if (!vehicleName?.trim()) {
      return {
        success: false,
        message: "Vehicle name is required.",
      };
    }

    if (!salesmanId) {
      return {
        success: false,
        message: "Salesman is required.",
      };
    }

    if (!salesmanName?.trim()) {
      return {
        success: false,
        message: "Salesman is required.",
      };
    }

    if (!productId) {
      return {
        success: false,
        message: "Product is required.",
      };
    }

    if (!productName?.trim()) {
      return {
        success: false,
        message: "Product name is required.",
      };
    }

    // =================================================
    // QUANTITY
    // =================================================

    const returnQuantity =
      Number(quantity);

    if (
      !Number.isFinite(returnQuantity) ||
      returnQuantity <= 0
    ) {
      return {
        success: false,
        message: "Invalid return quantity.",
      };
    }

    // =================================================
    // WHOLESALE PRICE
    // =================================================

    const returnWholesalePrice =
      Number(wholesalePrice);

    if (
      !Number.isFinite(
        returnWholesalePrice
      ) ||
      returnWholesalePrice < 0
    ) {
      return {
        success: false,
        message: "Invalid wholesale price.",
      };
    }

    // =================================================
    // CUSTOMER RETURN VALIDATION
    // =================================================

    if (
      returnType ===
      "CUSTOMER_RETURN"
    ) {
      if (!customerId) {
        return {
          success: false,
          message:
            "Customer is required.",
        };
      }

      if (!customerName?.trim()) {
        return {
          success: false,
          message:
            "Customer name is required.",
        };
      }
    }

    // =================================================
    // CREATE RETURN ID
    // =================================================

    const returnRef = db
      .collection(
        "vehicleStockReturns"
      )
      .doc();

    const returnId =
      returnRef.id;

    const now =
      new Date();

    // =================================================
    // RETURN VALUE
    // =================================================

    const returnValue =
      returnQuantity *
      returnWholesalePrice;

    // =================================================
    // TRANSACTION
    // =================================================

    await db.runTransaction(
      async (tx) => {

        // =================================================
        // 1. CREATE RETURN RECORD
        // =================================================
        //
        // NO STOCK CHANGE HERE.
        //
        // This collection is the actual return register.
        //
        // =================================================

        tx.set(
          returnRef,
          {
            id:
              returnId,

            returnId,

            // =============================================
            // RETURN TYPE
            // =============================================

            returnType,

            // =============================================
            // TRIP
            // =============================================

            tripId,
            tripNo,

            // =============================================
            // CUSTOMER
            // =============================================

            customerId:
              customerId || "",

            customerName:
              customerName || "",

            // =============================================
            // VEHICLE
            // =============================================

            vehicleId,
            vehicleName,
            locationCode,

            // =============================================
            // SALESMAN
            // =============================================

            salesmanId,
            salesmanName,

            // =============================================
            // PRODUCT
            // =============================================

            productId,
            productName,

            quantity:
              returnQuantity,

            // =============================================
            // VALUES
            // =============================================

            avgCost:
              Number(
                avgCost || 0
              ),

            costPrice:
              Number(
                costPrice || 0
              ),

            sellingPrice:
              Number(
                sellingPrice || 0
              ),

            wholesalePrice:
              returnWholesalePrice,

            returnValue,

            // =============================================
            // LOCATIONS
            // =============================================
            //
            // For CUSTOMER_RETURN:
            //
            // CUSTOMER → TRUCK
            //
            // But this is ONLY recorded as history.
            // It does NOT modify stock.
            //
            // =============================================

            fromLocationType:
              returnType ===
              "CUSTOMER_RETURN"
                ? "CUSTOMER"
                : "TRUCK",

            fromLocationRef:
              returnType ===
              "CUSTOMER_RETURN"
                ? customerId || ""
                : vehicleId,

            toLocationType:
              returnType ===
              "CUSTOMER_RETURN"
                ? "TRUCK"
                : returnType ===
                    "UNSOLD_RETURN"
                  ? "STORE"
                  : returnType ===
                      "DAMAGED"
                    ? "DAMAGED"
                    : "SPOILED",

            toLocationRef:
              returnType ===
              "CUSTOMER_RETURN"
                ? vehicleId
                : returnType ===
                    "UNSOLD_RETURN"
                  ? "MAIN"
                  : returnType ===
                      "DAMAGED"
                    ? "DAMAGED"
                    : "SPOILED",

            // =============================================
            // REASON
            // =============================================

            reason:
              reason || "",

            remarks:
              remarks || "",

            // =============================================
            // META
            // =============================================

            createdBy:
              createdBy ||
              "ADMIN",

            createdAt:
              now,

            updatedAt:
              now,
          }
        );

        // =================================================
        // 2. STOCK MOVEMENT / AUDIT
        // =================================================
        //
        // IMPORTANT:
        //
        // addStockMovement() records the movement history.
        // It does NOT modify stockLocations.
        //
        // For CUSTOMER_RETURN:
        //
        // CUSTOMER → TRUCK
        //
        // Truck stock itself remains unchanged.
        //
        // =================================================

        await addStockMovement({
          tx,

          batchId:
            returnId,

          tripId,
          tripNo,

          movementType:
            "RETURN",

          productId,
          productName,

          // =============================================
          // VEHICLE
          // =============================================

          name:
            vehicleName,

          vehicleId,
          locationCode,

          // =============================================
          // SALESMAN
          // =============================================

          responsiblePerson:
            salesmanName,

          // =============================================
          // PRICE
          // =============================================

          wholesalePrice:
            returnWholesalePrice,

          quantity:
            returnQuantity,

          // =============================================
          // FROM
          // =============================================

          fromLocationType:
            returnType ===
            "CUSTOMER_RETURN"
              ? "CUSTOMER"
              : "TRUCK",

          fromLocationRef:
            returnType ===
            "CUSTOMER_RETURN"
              ? customerId || ""
              : vehicleId,

          // =============================================
          // TO
          // =============================================

          toLocationType:
            returnType ===
            "CUSTOMER_RETURN"
              ? "TRUCK"
              : returnType ===
                  "UNSOLD_RETURN"
                ? "STORE"
                : returnType ===
                    "DAMAGED"
                  ? "DAMAGED"
                  : "SPOILED",

          toLocationRef:
            returnType ===
            "CUSTOMER_RETURN"
              ? vehicleId
              : returnType ===
                  "UNSOLD_RETURN"
                ? "MAIN"
                : returnType ===
                    "DAMAGED"
                  ? "DAMAGED"
                  : "SPOILED",

          remarks:
            reason ||
            remarks,

          createdBy:
            createdBy ||
            "ADMIN",
        });
      }
    );

    // =================================================
    // SUCCESS
    // =================================================

    return {
      success: true,

      returnId,

      tripId,

      message:
        returnType ===
        "CUSTOMER_RETURN"
          ? "Customer return recorded successfully."
          : "Return recorded successfully.",
    };

  } catch (error: any) {

    console.error(
      "❌ returnVehicleStock:",
      error
    );

    return {
      success: false,

      message:
        error?.message ||
        "Failed to record return.",
    };
  }
}
