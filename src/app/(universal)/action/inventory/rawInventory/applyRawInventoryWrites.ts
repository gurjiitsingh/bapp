"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";


export async function applyRawInventoryWrites(
  tx: FirebaseFirestore.Transaction,
  updates: any[],
  orderId: string
) {
  const now = admin.firestore.FieldValue.serverTimestamp();

  let totalRawMaterialCost = 0;

  for (const u of updates) {
    // =====================================
    // Cost of this inventory item
    // =====================================

    const consumedValue =
      (Number(u.quantity) || 0) *
      (Number(u.unitCost) || 0);

    totalRawMaterialCost += consumedValue;

    const newStockValue = Math.max(
      0,
      (Number(u.stockValue) || 0) - consumedValue
    );

    tx.update(u.ref, {
      currentStock: u.next,
      stockValue: Number(newStockValue.toFixed(2)),
      updatedAt: now,
    });

    // =====================================
    // Ledger
    // =====================================

    const ledgerRef =
      adminDb.collection("stockLedgerInventory").doc();

    tx.set(ledgerRef, {
      transactionId: ledgerRef.id,

      inventoryItemId: u.inventoryItemId,
      inventoryItemName: u.itemName,

      supplierId: "",
      supplierName: "",

      type: "CONSUMPTION",
      direction: "OUT",

      purchaseQuantity: 0,
      purchaseUnit: u.purchaseUnit || "",
      purchaseUnitCost: 0,

      conversionFactor: u.conversionFactor,

      quantity: u.quantity || 0,
      unit: u.transactionUnit,

      unitCost: u.unitCost,

      beforeStock: u.prev,
      afterStock: u.next,

      totalAmount: Number(consumedValue.toFixed(2)),
      paidAmount: 0,
      dueAmount: 0,
      paymentStatus: null,
      paymentMethod: null,

      referenceType: "PRODUCTION",
      referenceId: orderId,

      note: "Consumed in production",
      createdBy: "system",
      source: "PRODUCTION",

      createdAt: now,
    });
  }

  return Number(totalRawMaterialCost.toFixed(2));
}


