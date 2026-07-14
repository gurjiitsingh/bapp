"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

export async function applyInventoryTransactionDptReturn(
  tx: FirebaseFirestore.Transaction,
  updates: any[],
  referenceId: string,
  type:string,
  direction: "IN" | "OUT" = "OUT"
) {
  const now = admin.firestore.FieldValue.serverTimestamp();

  let totalValue = 0;

  for (const u of updates) {

console.log("u purchaseUnit----------------------", u.purchaseUnit)

    const quantity = Number(u.returnQty || 0);
    const unitCost = Number(u.averageCostStore || 0);
    const stockValue = Number(u.stockValueStore || 0);

    const movementValue = quantity * unitCost;

    totalValue += movementValue;

    const beforeStock = Number(u.currentStockStore);

    const afterStock =
      direction === "OUT"
        ? beforeStock - quantity
        : beforeStock + quantity;

    const afterStockValue =
      direction === "OUT"
        ? Math.max(0, stockValue - movementValue)
        : stockValue + movementValue;

  
    // =====================================
    // Ledger
    // =====================================

    const ledgerRef =
      adminDb
        .collection("stockLedgerInventory")
        .doc();

    tx.set(ledgerRef, {
      transactionId: ledgerRef.id,

      inventoryItemId: u.inventoryItemId,
      inventoryItemName: u.itemName,

      supplierId: "",
      supplierName: "",

      type,

      direction,

      purchaseQuantity: 0,
      purchaseUnit: u.purchaseUnit || "",
      purchaseUnitCost: 0,

      conversionFactor:
        u.conversionFactor,

      quantity,
      unit: u.consumptionUnit,

      unitCost:u.averageCostStore,

      beforeStock,
      afterStock,

      totalAmount: Number(
        movementValue.toFixed(2)
      ),

      paidAmount: 0,
      dueAmount: 0,
      paymentStatus: null,
      paymentMethod: null,

      referenceType:
        direction === "OUT"
          ? "PRODUCTION"
          : "RETURN_TO_MAIN_STORE",

      referenceId,

      note:
        direction === "OUT"
          ? "Consumed in production"
          : "Returned from department",

      createdBy: "system",

      source:
        direction === "OUT"
          ? "PRODUCTION"
          : "DEPARTMENT_RETURN",

      createdAt: now,
    });
  }

  return Number(totalValue.toFixed(2));
}