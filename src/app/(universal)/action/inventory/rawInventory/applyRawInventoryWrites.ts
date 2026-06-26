"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";


export async function applyRawInventoryWrites(
  tx: FirebaseFirestore.Transaction,
  updates: any[],
  orderId: string
) {
  const now = admin.firestore.FieldValue.serverTimestamp();

  for (const u of updates) {
    // ✅ update stock
    tx.update(u.ref, {
      currentStock: u.next,
      updatedAt: now,
    });

    // ✅ create ledger
    const ledgerRef = adminDb.collection("inventoryLedger").doc();

    tx.set(ledgerRef, {
      inventoryItemId: u.inventoryItemId,
      itemName: u.itemName,
      type: "CONSUMPTION",
      direction: "OUT",
      qty: u.required,
      beforeStock: u.prev,
      afterStock: u.next,
      referenceId: orderId,
      referenceType: "PRODUCTION",
      createdAt: now,
    });
  }
}