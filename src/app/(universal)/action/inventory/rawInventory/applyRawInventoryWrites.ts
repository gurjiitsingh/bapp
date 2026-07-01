"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";


export async function applyRawInventoryWrites(
  tx: FirebaseFirestore.Transaction,
  updates: any[],
  orderId: string
) {

  console.log("rawUpdates FINAL:", updates);
  const now = admin.firestore.FieldValue.serverTimestamp();

  for (const u of updates) {
    // ✅ update stock
    tx.update(u.ref, {
      currentStock: u.next,
      updatedAt: now,
    });

     
    // ✅ create ledger
    const ledgerRef = adminDb.collection("stockLedgerInventory").doc();

    tx.set(ledgerRef, {
  transactionId: ledgerRef.id,

  inventoryItemId: u.inventoryItemId,
  inventoryItemName: u.itemName,

  supplierId: "",
  supplierName: "",

  type: "CONSUMPTION",
  direction: "OUT",

  // Units
  purchaseQuantity: 0,
  purchaseUnit: u.purchaseUnit || "",
  purchaseUnitCost: 0,

  conversionFactor: u.conversionFactor,

  quantity: u.quantity || 0,
  unit: u.transactionUnit,

  // Cost
  unitCost: u.unitCost,

  // Stock
  beforeStock: u.prev,
  afterStock: u.next,

  // Financial
  totalAmount: 0,
  paidAmount: 0,
  dueAmount: 0,
  paymentStatus: null,
  paymentMethod: null,

  // References
  referenceType: "PRODUCTION",
  referenceId: orderId,

  // Meta
  note: "Consumed in production",
  createdBy: "system",
  source: "PRODUCTION",

  createdAt: now,
});
  }
}