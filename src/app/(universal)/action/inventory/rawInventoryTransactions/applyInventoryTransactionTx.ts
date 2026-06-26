"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

export async function applyInventoryTransactionTx(
  tx: FirebaseFirestore.Transaction,
  {
    inventoryItemId,
    type,
    direction,
    quantity,
    unitCost,
    purchaseQuantity,
    purchaseUnit,
    purchaseUnitCost,
    conversionFactor,
    supplierId,
    supplierName,
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
  }: ApplyInventoryMovementType
) {
  const now = admin.firestore.FieldValue.serverTimestamp();

  if (quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  const inventoryRef =
    adminDb.collection("inventoryItems").doc(inventoryItemId);

  // ✅ READ
  const snap = await tx.get(inventoryRef);

  if (!snap.exists) {
    throw new Error("Inventory item not found");
  }

  const inventory = snap.data()!;

  const beforeStock = Number(inventory.currentStock) || 0;

  const afterStock =
    direction === "IN"
      ? beforeStock + quantity
      : beforeStock - quantity;

  if (direction === "OUT" && afterStock < 0) {
    throw new Error("Insufficient stock");
  }

  const isCostMovement = COST_TYPES.has(type);

  const finalUnitCost = isCostMovement
    ? (unitCost ?? Number(inventory.costPrice) ?? 0)
    : 0;

  let updatedCostPrice = Number(inventory.costPrice) || 0;

  if (isCostMovement && direction === "IN") {
    const oldValue = beforeStock * updatedCostPrice;
    const newValue = quantity * finalUnitCost;
    const totalQty = beforeStock + quantity;

    if (totalQty > 0) {
      updatedCostPrice = (oldValue + newValue) / totalQty;
    }
  }

  // ✅ WRITE
  tx.update(inventoryRef, {
    currentStock: afterStock,
    costPrice: updatedCostPrice,
    updatedAt: now,
  });

  const purchaseQty =
    purchaseQuantity ??
    quantity /
      Number(
        conversionFactor ??
          inventory.conversionFactor ??
          1
      );

  const ledgerRef =
    adminDb.collection("stockLedgerInventory").doc();

  tx.set(ledgerRef, {
    transactionId: ledgerRef.id,

    inventoryItemId,
    inventoryItemName: inventory.name || "",

    supplierId: supplierId || "",
    supplierName: supplierName || "",

    type,
    direction,

    purchaseQuantity: purchaseQty,

    purchaseUnit:
      purchaseUnit ||
      inventory.purchaseUnit ||
      inventory.consumptionUnit,

    purchaseUnitCost: isCostMovement
      ? (purchaseUnitCost ?? finalUnitCost)
      : 0,

    conversionFactor:
      conversionFactor ??
      inventory.conversionFactor ??
      1,

    quantity,
    unit: inventory.consumptionUnit || "pcs",

    unitCost: finalUnitCost,

    beforeStock,
    afterStock,

    totalAmount: isCostMovement ? totalAmount : 0,
    paidAmount: isCostMovement ? paidAmount : 0,
    dueAmount: isCostMovement ? dueAmount : 0,
    paymentStatus: isCostMovement ? paymentStatus : null,
    paymentMethod: isCostMovement ? paymentMethod : null,

    referenceType,
    referenceId,

    note,
    createdBy,

    createdAt: now,
    source,
  });

  return {
    beforeStock,
    afterStock,
    unitCost: finalUnitCost,
  };
}