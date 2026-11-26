
"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

import { ApplyInventoryTransactionType } from "@/lib/types/ApplyInventoryTransactionType";
import { InventoryLedgerType } from "@/lib/types/inventory/InventoryLedgerType";

type InventoryAdjustInput = ApplyInventoryTransactionType & {
  inventoryItemName: string;
  consumptionUnit: string;
};

export async function inventoryAdjust(
  tx: FirebaseFirestore.Transaction,
  {
    inventoryItemId,
    inventoryItemName,

    type,
    direction,

    quantity,
    stockValue,
    averageCost,

    purchaseQuantity,
    purchaseUnit,
    purchaseUnitCost,
    conversionFactor,

    consumptionUnit,

    supplierId,
    supplierName,

    totalAmount = 0,
    paidAmount = 0,
    dueAmount = 0,
    paymentStatus = "PAID",
    paymentMethod = null,

    beforeStock,
    afterStock,
    transactionQuantity,
    transactionUnitCost,

    referenceType = "MANUAL",
    referenceId = "",

    note = "",
    createdBy = "system",

    source = "SYSTEM",
  }: InventoryAdjustInput
) {
  // VALIDATION
  if (!inventoryItemId) {
    throw new Error("Inventory item required");
  }

  if (!inventoryItemName) {
    throw new Error("Inventory item name required");
  }

  if (!Number.isFinite(beforeStock) || beforeStock < 0) {
    throw new Error("Invalid before stock quantity");
  }

  if (!Number.isFinite(afterStock) || afterStock < 0) {
    throw new Error("Invalid after stock quantity");
  }

  if (
    !Number.isFinite(transactionQuantity) ||
    transactionQuantity < 0
  ) {
    throw new Error("Invalid transaction quantity");
  }

  if (
    !Number.isFinite(conversionFactor) ||
    conversionFactor <= 0
  ) {
    throw new Error("Invalid conversion factor");
  }

  // PURCHASE QUANTITY
  const purchaseQty =
    purchaseQuantity ??
    transactionQuantity / conversionFactor;

  // CREATE LEDGER DOCUMENT
  const ledgerRef = adminDb
    .collection("stockLedgerInventory")
    .doc();

  const now = admin.firestore.FieldValue.serverTimestamp();

  const ledger: InventoryLedgerType = {
    transactionId: ledgerRef.id,

    // INVENTORY
    inventoryItemId,
    inventoryItemName,

    // PARTY
    partyId: supplierId || "",
    partyName: supplierName || "",
    partyType: supplierId ? "SUPPLIER" : "SYSTEM",

    // PURCHASE DETAILS
    purchaseQuantity: purchaseQty,
    purchaseUnit: purchaseUnit || "",

    purchaseUnitCost: Number(purchaseUnitCost ?? 0),

    // TRANSACTION DETAILS
    conversionFactor,

    transactionQuantity,

    transactionUnit: consumptionUnit || "gm",

    transactionUnitCost: Number(transactionUnitCost ?? 0),

    // STOCK
    beforeStock,
    afterStock,

    // VALUE
    totalAmount: Number(totalAmount ?? 0),

    // PAYMENT
    paidAmount: Number(paidAmount ?? 0),
    dueAmount: Number(dueAmount ?? 0),
    paymentStatus,
    paymentMethod,

    // TRANSACTION INFO
    referenceType,
    referenceId,

    type,
    direction,

    note,

    // SOURCE
    sourceModule: source,

    // AUDIT
    createdById: createdBy,
    createdAt: now,
  };

  // SAVE ONLY LEDGER RECORD
  tx.set(ledgerRef, ledger);

  return {
    transactionId: ledgerRef.id,
    beforeStock,
    afterStock,
    transactionQuantity,
  };
}
