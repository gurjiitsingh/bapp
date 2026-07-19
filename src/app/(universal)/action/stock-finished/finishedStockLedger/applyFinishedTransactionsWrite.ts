"use server";

import admin from "firebase-admin";

import { adminDb } from "@/lib/firebaseAdmin";

import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { applyFinishedTransactionsRead } from "./applyFinishedTransactionsRead";

type ApplyFinishedMovementType = {
  productId: string;
  productName?: string;
  batchId: string;
  type: string;
  direction: "IN" | "OUT";

  quantity: number;
  transactionUnit: InventoryUnit;

  unitPrice?: number;

  customerId?: string;
  customerName?: string;

  totalAmount?: number;
  paidAmount?: number;
  dueAmount?: number;
  returnProductAmount?: number;
  paymentStatus?: string;
  paymentMethod?: string | null;

  referenceType?: string;
  referenceId?: string;

  note?: string;
  createdBy?: string;

  source?: string;
};

export async function applyFinishedTransactionsWrite(
  tx: FirebaseFirestore.Transaction,
  {
    productId,
    productName,

    type,
    direction,

    quantity,
    transactionUnit,
    unitPrice =0,
    
    customerId,
    customerName,

    totalAmount = 0,
    paidAmount = 0,
    dueAmount = 0,

    paymentStatus = "PAID",
    paymentMethod = null,

    referenceType = "MANUAL",
    referenceId = "",

    note = "",
    createdBy = "system",

    source = "SYSTEM",

    // NEW
    readResult,
  }: ApplyFinishedMovementType & {
    readResult: Awaited<
      ReturnType<typeof applyFinishedTransactionsRead>
    >;
  }
) {

 
  const now =
    admin.firestore.FieldValue.serverTimestamp();

  const {
    product,
    productRef,

    currentStock,
    stockValue,
    avgCost,
    costPrice,
    allowNegativeStock,
    sellingPrice,
  } = readResult;

  const beforeStock = currentStock;

  const afterStock =
    direction === "IN"
      ? beforeStock + quantity
      : beforeStock - quantity;

  if (
    direction === "OUT" &&
    afterStock < 0 &&
    !allowNegativeStock
  ) {
    throw new Error("Insufficient stock");
  }

  const movementUnitCost =
    Number(unitPrice ?? avgCost);

  let afterStockValue = stockValue;
  let afteravgCost = avgCost;
  let afterCostPrice = costPrice;

  if (direction === "IN") {
    afterStockValue =
      stockValue + totalAmount;

    afteravgCost =
      afterStock > 0
        ? afterStockValue / afterStock
        : 0;

    // Latest production cost
    afterCostPrice = movementUnitCost;
  } else {
    const removedValue =
      quantity * avgCost;

    afterStockValue = Math.max(
      0,
      stockValue - removedValue
    );


  }
 afterCostPrice = unitPrice;
 



  tx.update(productRef, {
    currentStock: afterStock,

    stockValue: Number(
      afterStockValue.toFixed(2)
    ),

    avgCost: Number(
      unitPrice.toFixed(2)
    ),

    costPrice: Number(
      afterCostPrice.toFixed(2)
    ),

    stockStatus:
      afterStock > 0
        ? "in_stock"
        : "out_of_stock",

    updatedAt: now,
  });

  const ledgerRef =
    adminDb.collection("stockLedgerFinished").doc();

  tx.set(ledgerRef, {
    transactionId: ledgerRef.id,

    productId,
    productName: product.name || "",

    type,
    direction,

    quantity,
    transactionUnit,

    unitPrice: movementUnitCost,

    productSnapshotPrice:
      Number(product.price) || 0,

    totalAmount,

    beforeStock,
    afterStock,

    customerId: customerId || "",
    customerName: customerName || "",

    paidAmount,
    dueAmount,

    paymentStatus,
    paymentMethod,

    referenceType,
    referenceId,

    note,
    createdBy,

    createdAt: now,
    source,
  });

  return {
    transactionId: ledgerRef.id,

    beforeStock,
    afterStock,

    unitPrice: movementUnitCost,

    avgCost: afteravgCost,

    stockValue: afterStockValue,
  };
}