"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { DepartmentStockUpdate } from "@/lib/types/department/DepartmentStockUpdate";

interface DepartmentStockRequest {
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number;
  averageCost: number;
  purchaseUnitCost: number;
  purchaseUnit: string;
  consumptionUnit: string;
  conversionFactor: number;
}

export async function getDepartmentStockDataForProduction(
  tx: FirebaseFirestore.Transaction,
  departmentId: string,
  dirction: "IN" | "OUT",
  items: DepartmentStockRequest[]
): Promise<DepartmentStockUpdate[]> {
  const updates: DepartmentStockUpdate[] = [];

  for (const item of items) {
    // Inventory Item (only to ensure it exists)
    const inventoryRef = adminDb
      .collection("inventoryItems")
      .doc(item.inventoryItemId);

    const inventorySnap = await tx.get(inventoryRef);

    if (!inventorySnap.exists) {
      throw new Error(
        `Inventory not found: ${item.inventoryItemId}`
      );
    }

    // Department Stock
    const query = adminDb
      .collection("departmentStock")
      .where("departmentId", "==", departmentId)
      .where("inventoryItemId", "==", item.inventoryItemId)
      .limit(1);

    const snap = await tx.get(query);

    const exists = !snap.empty;
    const doc = exists ? snap.docs[0] : null;
    const data = doc?.data();

    const currentQuantity = Number(data?.quantity ?? 0);
    const currentAverageCost = Number(data?.averageCost ?? 0);

    if (
      dirction === "OUT" &&
      item.quantity > currentQuantity
    ) {
      throw new Error(
        `Insufficient department stock for ${item.inventoryItemName}`
      );
    }

    const newQuantity =
      dirction === "IN"
        ? currentQuantity + item.quantity
        : currentQuantity - item.quantity;

    let newAverageCost = 0;
    let newStockValue = 0;

    if (dirction === "IN") {
      newAverageCost =
        currentQuantity === 0 || currentAverageCost === 0
          ? Number(item.averageCost)
          : (
              currentQuantity * currentAverageCost +
              item.quantity * item.averageCost
            ) / newQuantity;

      newAverageCost = Number(
        newAverageCost.toFixed(10)
      );

      newStockValue = Number(
        (newQuantity * newAverageCost).toFixed(2)
      );
    } else {
      newAverageCost = currentAverageCost;
      newStockValue = Number(
        (newQuantity * currentAverageCost).toFixed(2)
      );
    }

    updates.push({
      ref: doc?.ref ?? null,
      exists,

      departmentId,

      inventoryItemId: item.inventoryItemId,
      inventoryItemName: item.inventoryItemName,

      quantityChange: item.quantity,
     
      currentQuantity,
      newQuantity,

      newAverageCost,
      newStockValue,

      // Use Department Stock values if available
      purchaseUnit:
        data?.purchaseUnit ?? item.purchaseUnit,

  newPurchaseUnitCost:
    data?.purchaseUnitCost ??
    item.purchaseUnitCost, 

      consumptionUnit:
        data?.consumptionUnit ??
        item.consumptionUnit,

      conversionFactor: Number(
        data?.conversionFactor ??
          item.conversionFactor
      ),
    });
  }

  return updates;
}