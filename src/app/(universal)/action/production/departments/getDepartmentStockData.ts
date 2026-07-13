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

export interface DepartmentStockUpdateM {
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

export interface DepartmentStockUpdate {
  ref: FirebaseFirestore.DocumentReference | null;
  exists: boolean;

  departmentId: string;

  inventoryItemId: string;
  inventoryItemName: string;

  currentQuantity: number;
  newQuantity: number;

  averageCost: number;

  purchaseUnit: string;
  consumptionUnit: string;
  conversionFactor: number;
}

export async function getDepartmentStockData(
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

    const currentQuantity = Number(data.quantity || 0);
const currentAvgCost = Number(data.averageCost || 0);

const newQuantity = currentQuantity + item.quantity;

const newAverageCost =
  newQuantity === 0
    ? 0
    : (
        currentQuantity * currentAvgCost +
        item.quantity * item.averageCost
      ) / newQuantity;

      updates.push({
        ref: doc.ref,
        exists: true,

        departmentId,

        inventoryItemId: item.inventoryItemId,
        inventoryItemName: item.inventoryItemName,

        currentQuantity,
        newQuantity: currentQuantity + item.quantity,

          averageCost: newAverageCost,

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
        newQuantity: item.quantity,

        averageCost: item.averageCost,

        purchaseUnit: item.purchaseUnit,
        consumptionUnit: item.consumptionUnit,
        conversionFactor: item.conversionFactor,
      });
    }
  }

  return updates;
}