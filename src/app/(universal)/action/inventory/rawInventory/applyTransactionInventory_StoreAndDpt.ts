"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { RawInventoryUpdate } from "@/lib/types/inventory/RawInventoryUpdateType";

export async function applyTransactionInventory_StoreAndDpt( 
  tx: FirebaseFirestore.Transaction,
  updates: RawInventoryUpdate[],
  referenceId: string,
  type: string,
  direction: "IN" | "OUT" = "OUT"
) {
  const now = admin.firestore.FieldValue.serverTimestamp();

  let totalValue = 0;

  for (const u of updates) {

    console.log("u.purchaseUnitCost----------------------", u.purchaseUnitCost)

    const quantity = Number(u.sendQty || 0);
    // const unitCost = Number(u.storeAvgCost || 0);
    const unitCost =
      direction === "IN"
        ? Number(u.dptAvgCost || 0)   // ✅ return
        : Number(u.storeAvgCost || 0); // ✅ issue
    const stockValue = Number(u.storeStockValue || 0);

    const movementValue = quantity * unitCost;

    totalValue += movementValue;

    const beforeStock = Number(u.storeStock);

    const afterStock =
      direction === "OUT"
        ? beforeStock - quantity
        : beforeStock + quantity;


    console.log("========== Inventory Movement ==========");
    console.log(u);
    console.log("========================================");


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
      inventoryItemName: u.inventoryItemName,

      partyId: "",
      partyName: "",

      type,

      direction,

      purchaseQuantity: u.sendQty/u.conversionFactor,
      purchaseUnit: u.purchaseUnit || "",
      purchaseUnitCost: u.purchaseUnitCost,

      conversionFactor:
        u.conversionFactor,


        partyType: "SYSTEM",

transactionQuantity: u.sendQty,

transactionUnit: u.consumptionUnit,

transactionUnitCost: unitCost,

sourceModule:
  direction === "OUT"
    ? "PRODUCTION"
    : "DEPARTMENT_RETURN", 

createdById: "system",

      quantity: u.sendQty/u.conversionFactor,
      consumptionUnit: u.consumptionUnit,

      unitCost: unitCost,

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