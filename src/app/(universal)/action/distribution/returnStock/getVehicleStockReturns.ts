"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

export type GetVehicleStockReturnsParams = {
  date?: string;
  returnType?: string;
  vehicleId?: string;
};

export async function getVehicleStockReturns({
  date,
  returnType = "ALL",
  vehicleId = "ALL",
}: GetVehicleStockReturnsParams = {}) {
  try {
    // =================================================
    // DATE
    // =================================================

    const selectedDate = date
      ? new Date(`${date}T00:00:00`)
      : new Date();

    const startOfDay = new Date(
      selectedDate
    );

    startOfDay.setHours(
      0,
      0,
      0,
      0
    );

    const endOfDay = new Date(
      selectedDate
    );

    endOfDay.setHours(
      23,
      59,
      59,
      999
    );

    // =================================================
    // QUERY
    // =================================================

    let query =
      adminDb
        .collection(
          "vehicleStockReturns"
        )
        .where(
          "createdAt",
          ">=",
          Timestamp.fromDate(
            startOfDay
          )
        )
        .where(
          "createdAt",
          "<=",
          Timestamp.fromDate(
            endOfDay
          )
        );

    // =================================================
    // RETURN TYPE
    // =================================================

    if (
      returnType &&
      returnType !== "ALL"
    ) {
      query = query.where(
        "returnType",
        "==",
        returnType
      );
    }

    // =================================================
    // VEHICLE
    // =================================================

    if (
      vehicleId &&
      vehicleId !== "ALL"
    ) {
      query = query.where(
        "vehicleId",
        "==",
        vehicleId
      );
    }

    // =================================================
    // GET DATA
    // =================================================

    const snapshot =
      await query.get();

    // =================================================
    // MAP
    // =================================================

    const data =
      snapshot.docs.map(
        (doc) => {
          const item =
            doc.data();

          return {
            id:
              doc.id,

            returnId:
              item.returnId ||
              doc.id,

            returnType:
              item.returnType ||
              "",

            tripId:
              item.tripId ||
              "",

            tripNo:
              item.tripNo ||
              "",

            customerId:
              item.customerId ||
              "",

            customerName:
              item.customerName ||
              "",

            vehicleId:
              item.vehicleId ||
              "",

            vehicleName:
              item.vehicleName ||
              "",

            locationCode:
              item.locationCode ||
              "",

            salesmanId:
              item.salesmanId ||
              "",

            salesmanName:
              item.salesmanName ||
              "",

            productId:
              item.productId ||
              "",

            productName:
              item.productName ||
              "",

            quantity:
              Number(
                item.quantity || 0
              ),

            wholesalePrice:
              Number(
                item.wholesalePrice ||
                  0
              ),

            returnValue:
              Number(
                item.returnValue ||
                  0
              ),

            reason:
              item.reason ||
              "",

            remarks:
              item.remarks ||
              "",

            createdAt:
              item.createdAt
                ?.toDate
                ? item.createdAt.toDate().toISOString()
                : item.createdAt ||
                  null,
          };
        }
      );

    // =================================================
    // SORT
    // =================================================

    data.sort(
      (a, b) =>
        new Date(
          b.createdAt || 0
        ).getTime() -
        new Date(
          a.createdAt || 0
        ).getTime()
    );

    return {
      success: true,
      data,
    };

  } catch (error: any) {

    console.error(
      "❌ getVehicleStockReturns:",
      error
    );

    return {
      success: false,
      data: [],
      message:
        error?.message ||
        "Failed to load return records.",
    };
  }
}