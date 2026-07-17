"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { DepartmentStockType } from "@/lib/types/department/DepartmentStockType";



export async function getDepartmentStock(
  departmentId: string
): Promise<DepartmentStockType[]> {
  try {
    const snapshot = await adminDb
      .collection("departmentStock")
      .where("departmentId", "==", departmentId)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        inventoryItemId: data.inventoryItemId ?? "",
        inventoryItemName: data.inventoryItemName ?? "",

        quantity: Number(data.quantity ?? 0),

        averageCost: Number(data.averageCost ?? 0),
stockValue: Number(data.stockValue ?? 0),
        purchaseUnit: data.purchaseUnit ?? "",
        consumptionUnit: data.consumptionUnit ?? "",
        conversionFactor: Number(data.conversionFactor ?? 1),
        purchaseUnitCost: Number(data.purchaseUnitCost ?? 0),
        updatedAt:
          data.updatedAt &&
          typeof data.updatedAt.toMillis === "function"
            ? data.updatedAt.toMillis()
            : Date.now(),
      };
    });
  } catch (error) {
    console.error("Error fetching department stock:", error);
    return [];
  }
}