"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { DepartmentStockUpdate, DepartmentStockUpdateM } from "./getDepartmentStockData";

interface UpdateDepartmentStockInput {
  transaction: FirebaseFirestore.Transaction;
  update: DepartmentStockUpdateM;

  // Actual stock movement:
  // +5 = add 5
  // -5 = remove 5
  qtyChange: number;
}

export async function updateDepartmentStockTxM({
  transaction: tx,
  update,
  qtyChange,
}: UpdateDepartmentStockInput) {
  const db = adminDb;
  const now = new Date();

  const newQuantity =
    update.currentQuantity + qtyChange;

  if (newQuantity < 0) {
    throw new Error(
      `Insufficient department stock for "${update.inventoryItemName}". Available: ${update.currentQuantity}, Requested: ${Math.abs(
        qtyChange
      )}`
    );
  }

  if (update.exists && update.ref) {
    tx.update(update.ref, {
      quantity: newQuantity,
      averageCost: update.averageCost,
      updatedAt: now,
    });

    return;
  }

  // Cannot remove stock from a non-existing document
  if (qtyChange < 0) {
    throw new Error(
      `${update.inventoryItemName} does not exist in department stock.`
    );
  }

  const ref = db.collection("departmentStock").doc();

  tx.set(ref, {
    id: ref.id,

    departmentId: update.departmentId,

    inventoryItemId: update.inventoryItemId,
    inventoryItemName: update.inventoryItemName,

    quantity: newQuantity,

    averageCost: update.averageCost,

    purchaseUnit: update.purchaseUnit,
    consumptionUnit: update.consumptionUnit,
    conversionFactor: update.conversionFactor,

    updatedAt: now,
  });
}