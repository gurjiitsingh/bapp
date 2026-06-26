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
      inventoryItemId: u.inventoryItemId,
      inventoryItemName: u.itemName,
      type: "CONSUMPTION",
      direction: "OUT",
      quantity: u.required,
      beforeStock: u.prev,
      afterStock: u.next,
      referenceId: orderId,
      referenceType: "PRODUCTION",
      createdAt: now,
    });
  }
}