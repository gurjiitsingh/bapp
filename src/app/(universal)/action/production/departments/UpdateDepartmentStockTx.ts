"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { DepartmentStockUpdate } from "./getDepartmentStockData";

interface UpdateDepartmentStockInput {
  transaction: FirebaseFirestore.Transaction;
  update: DepartmentStockUpdate;
}

export async function updateDepartmentStockTx({
  transaction: tx,
  update,
}: UpdateDepartmentStockInput) {
  const db = adminDb;
  const now = new Date();

  if (update.exists && update.ref) {
    tx.update(update.ref, {
      quantity: update.newQuantity,
      averageCost: update.averageCost,
      updatedAt: now,
    });

    return;
  }

  const ref = db.collection("departmentStock").doc();

  tx.set(ref, {
    id: ref.id,

    departmentId: update.departmentId,

    inventoryItemId: update.inventoryItemId,
    inventoryItemName: update.inventoryItemName,

    quantity: update.newQuantity,

    averageCost: update.averageCost,

    purchaseUnit: update.purchaseUnit,
    consumptionUnit: update.consumptionUnit,
    conversionFactor: update.conversionFactor,

    updatedAt: now,
  });
}