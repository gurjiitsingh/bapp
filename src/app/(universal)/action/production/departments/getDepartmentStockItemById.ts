"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export type DepartmentStockType = {
  id: string;

  departmentId: string;

  inventoryItemId: string;
  inventoryItemName: string;

  quantity: number;

  averageCost: number;

  purchaseUnit: string;
  consumptionUnit: string;
  conversionFactor: number;

  updatedAt: number;
};

export async function getDepartmentStockItemByIdTx(
  tx: FirebaseFirestore.Transaction,
  departmentId: string,
  inventoryItemId: string
): Promise<DepartmentStockType | null> {
  const ref = adminDb
    .collection("departmentStock")
    .doc(`${departmentId}_${inventoryItemId}`);

  const snap = await tx.get(ref);

  if (!snap.exists) {
    return null;
  }

  const data = snap.data()!;

  return {
    id: snap.id,

    departmentId: data.departmentId,

    inventoryItemId: data.inventoryItemId,
    inventoryItemName: data.inventoryItemName,

    quantity: Number(data.quantity) || 0,

    averageCost: Number(data.averageCost) || 0,

    purchaseUnit: data.purchaseUnit || "",
    consumptionUnit: data.consumptionUnit || "",
    conversionFactor: Number(data.conversionFactor) || 1,

    updatedAt: data.updatedAt
      ? data.updatedAt.toMillis()
      : 0,
  };
}