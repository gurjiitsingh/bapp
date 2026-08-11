"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export type SalemanSettlement = {
  settlementId: string;

  tripId: string;

  vehicleId: string;
  vehicleName: string;

  salesmanId: string;
  salesmanName: string;

  openingCash: number;

  totalSalesAmount: number;

  newSaleCashCollected: number;
  newSaleCreditAmount: number;

  oldCreditCollected: number;

  totalCashCollected: number;

  totalExpenses: number;

  amountPayableToManager: number;
  amountHandedOver: number;

  shortageAmount: number;
  excessAmount: number;

  status: string;

  remarks: string;

  createdAt: string | null;
  updatedAt: string | null;
};

function convertTimestamp(value: any): string | null {
  if (!value) return null;

  if (value.toDate) {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return null;
}

export async function getSalemanSettlements(): Promise<{
  success: boolean;
  data: SalemanSettlement[];
  message?: string;
}> {
  try {
    const snapshot = await adminDb
      .collection("salemanSettlements")
      .orderBy("createdAt", "desc")
      .get();

    const data: SalemanSettlement[] = snapshot.docs.map((doc) => {
      const row = doc.data();

      return {
        settlementId: row.settlementId || doc.id,

        tripId: row.tripId || "",

        vehicleId: row.vehicleId || "",
        vehicleName: row.vehicleName || "",

        salesmanId: row.salesmanId || row.driverId || "",
        salesmanName: row.salesmanName || row.driverName || "",

        openingCash: Number(row.openingCash || 0),

        totalSalesAmount: Number(row.totalSalesAmount || 0),

        newSaleCashCollected: Number(
          row.newSaleCashCollected || 0
        ),

        newSaleCreditAmount: Number(
          row.newSaleCreditAmount || 0
        ),

        oldCreditCollected: Number(
          row.oldCreditCollected || 0
        ),

        totalCashCollected: Number(
          row.totalCashCollected || 0
        ),

        totalExpenses: Number(
          row.totalExpenses || 0
        ),

        amountPayableToManager: Number(
          row.amountPayableToManager || 0
        ),

        amountHandedOver: Number(
          row.amountHandedOver || 0
        ),

        shortageAmount: Number(
          row.shortageAmount || 0
        ),

        excessAmount: Number(
          row.excessAmount || 0
        ),

        status: row.status || "OPEN",

        remarks: row.remarks || "",

        createdAt: convertTimestamp(row.createdAt),
        updatedAt: convertTimestamp(row.updatedAt),
      };
    });

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error(
      "❌ getSalemanSettlements:",
      error
    );

    return {
      success: false,
      data: [],
      message:
        error?.message ||
        "Failed to load salesman settlements.",
    };
  }
}