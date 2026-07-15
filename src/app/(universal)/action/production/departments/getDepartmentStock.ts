"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export type DepartmentStock = {
  inventoryItemId: string;
  inventoryItemName: string;

  quantity: number;

  averageCost: number;

  purchaseUnit: string;
  consumptionUnit: string;
  conversionFactor: number;

  updatedAt: number;
};

export async function getDepartmentStock(
  departmentId: string
): Promise<DepartmentStock[]> {
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

        purchaseUnit: data.purchaseUnit ?? "",
        consumptionUnit: data.consumptionUnit ?? "",
        conversionFactor: Number(data.conversionFactor ?? 1),
 purchaseMappings: Array.isArray(data?.purchaseMappings)
    ? data.purchaseMappings.map((m: any) => ({
        purchaseUnit: m.purchaseUnit ?? "",
        consumptionUnit: m.consumptionUnit ?? "",
        factor: Number(m.factor ?? 1),
      }))
    : [],
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