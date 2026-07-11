"use server";

import { adminDb } from "@/lib/firebaseAdmin";

interface DepartmentStockRequest {
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number;
  averageCost: number;
  purchaseUnit: string;
  consumptionUnit: string;
  conversionFactor: number;
}

export interface DepartmentStockUpdate {
  ref: FirebaseFirestore.DocumentReference | null;
  exists: boolean;

  departmentId: string;

  inventoryItemId: string;
  inventoryItemName: string;

  currentQuantity: number;
  transferQuantity: number;

  averageCost: number;

  purchaseUnit: string;
  consumptionUnit: string;
  conversionFactor: number;
}

export async function getDepartmentStockDataM(
  tx: FirebaseFirestore.Transaction,
  departmentId: string,
  items: DepartmentStockRequest[]
): Promise<DepartmentStockUpdate[]> {
  const db = adminDb;

  const updates: DepartmentStockUpdate[] = [];

  for (const item of items) {
    const query = db
      .collection("departmentStock")
      .where("departmentId", "==", departmentId)
      .where("inventoryItemId", "==", item.inventoryItemId)
      .limit(1);

    const snap = await tx.get(query);

    if (!snap.empty) {
      const doc = snap.docs[0];
      const data = doc.data();

      updates.push({
        ref: doc.ref,
        exists: true,

        departmentId,

        inventoryItemId: item.inventoryItemId,
        inventoryItemName: item.inventoryItemName,

        currentQuantity: Number(data.quantity || 0),
        transferQuantity: item.quantity,

        averageCost: item.averageCost,

        purchaseUnit: item.purchaseUnit,
        consumptionUnit: item.consumptionUnit,
        conversionFactor: item.conversionFactor,
      });
    } else {
      updates.push({
        ref: null,
        exists: false,

        departmentId,

        inventoryItemId: item.inventoryItemId,
        inventoryItemName: item.inventoryItemName,

        currentQuantity: 0,
        transferQuantity: item.quantity,

        averageCost: item.averageCost,

        purchaseUnit: item.purchaseUnit,
        consumptionUnit: item.consumptionUnit,
        conversionFactor: item.conversionFactor,
      });
    }
  }

  return updates;
}