"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

export async function applyTransactionInventory_StoreAndDpt(
  tx: FirebaseFirestore.Transaction,
  updates: any[],
  referenceId: string,
  type:string,
  direction: "IN" | "OUT" = "OUT"
) {
  const now = admin.firestore.FieldValue.serverTimestamp();

  let totalValue = 0;

  for (const u of updates) {

//console.log("u purchaseUnit----------------------", u.purchaseUnit)

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

        

    // const afterStockValue =
    //   direction === "OUT"
    //     ? Math.max(0, stockValue - movementValue)
    //     : stockValue + movementValue;

  // const newAvgCost =
  // afterStock > 0
  //   ? afterStockValue / afterStock
  //   : 0; // ✅ ADDED: recalculated store average cost


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
      consumptionUnit: u.consumptionUnit,

      unitCost:unitCost,

      beforeStock ,
      afterStock ,

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