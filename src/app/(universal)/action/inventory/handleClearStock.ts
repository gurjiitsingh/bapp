
"use server";

import type { InventoryHandlerInput } from "./handleAdjustmentOut";

export async function handleClearStock({
  tx,
  inventoryRef,
  purchaseUnit,
  conversionFactor,
  now,
}: InventoryHandlerInput) {
  // VALIDATION
  if (conversionFactor <= 0) {
    throw new Error("Invalid conversion factor");
  }

  // 1. CLEAR ALL STOCK AND VALUATION
  const newStockQty = 0;
  const totalAmount = 0;
  const averageCost = 0;
  const purchaseUnitCost = 0;

  // 2. UPDATE INVENTORY
  tx.update(inventoryRef, {
    currentStock: newStockQty,
    stockValue: totalAmount,
    averageCost,
    costPrice: averageCost,
    purchaseUnit,
    purchaseUnitCost,
    conversionFactor,
    updatedAt: now,
  });

  return {
    quantity: newStockQty,
    totalAmount,
    averageCost,
    purchaseUnitCost,
  };
}
