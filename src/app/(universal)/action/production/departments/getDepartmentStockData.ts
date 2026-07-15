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

  averageCost?: number;
  newAverageCost?: number;

  purchaseUnit: string;
  consumptionUnit: string;
  conversionFactor: number;

  purchaseMappings?: {
    purchaseUnit: string;
    consumptionUnit: string;
    factor: number;
  }[];
}

export async function getDepartmentStockData(
  tx: FirebaseFirestore.Transaction,
  departmentId: string,
  items: DepartmentStockRequest[]
): Promise<DepartmentStockUpdate[]> {
  const db = adminDb;

  const updates: DepartmentStockUpdate[] = [];

  for (const item of items) {


    const inventoryRef = adminDb
      .collection("inventoryItems")
      .doc(item.inventoryItemId);

    const inventorySnap = await tx.get(inventoryRef);

    if (!inventorySnap.exists) {
      throw new Error(
        `Inventory not found: ${item.inventoryItemId}`
      );
    }

    const inventoryData = inventorySnap.data()!;


    const query = db
      .collection("departmentStock")
      .where("departmentId", "==", departmentId)
      .where("inventoryItemId", "==", item.inventoryItemId)
      .limit(1);

    const snap = await tx.get(query);

    if (!snap.empty) {
      const doc = snap.docs[0];
      const data = doc.data();

      const currentStockDPT = Number(data.quantity || 0);
      const currentAvgCost = Number(data.averageCost || 0);

      const newQuantity = currentStockDPT + item.quantity;

      const newAverageCost =
        currentStockDPT === 0 || currentAvgCost === 0
          ? item.averageCost
          : (
            currentStockDPT * currentAvgCost +
            item.quantity * item.averageCost
          ) / newQuantity;

      console.log("currentStockDPT-----------------------------", currentStockDPT)
      console.log("currentAvgCost-----------------------------", currentAvgCost)
      console.log("item.quantity-----------------------------", item.quantity)
      console.log("item.averageCost-----------------------------", item.averageCost)
      console.log("newQuantity-----------------------------", newQuantity)
      console.log("newAverageCost-----------------------------", newAverageCost.toFixed(10));
      const avgCost = Number(newAverageCost.toFixed(10))

      updates.push({
        ref: doc.ref,
        exists: true,

        departmentId,

        inventoryItemId: item.inventoryItemId,
        inventoryItemName: item.inventoryItemName,

        currentQuantity: currentStockDPT,
        newQuantity: currentStockDPT + item.quantity,

        averageCost: newAverageCost,
        newAverageCost,

        purchaseUnit: item.purchaseUnit,
        consumptionUnit: item.consumptionUnit,
        conversionFactor: item.conversionFactor,
        purchaseMappings: inventoryData.purchaseMappings ?? [],
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

        averageCost: 1,// item.averageCost,

        purchaseUnit: item.purchaseUnit,
        consumptionUnit: item.consumptionUnit,
        conversionFactor: item.conversionFactor,
        purchaseMappings: inventoryData.purchaseMappings ?? [],
      });
    }
  }

  return updates;
}