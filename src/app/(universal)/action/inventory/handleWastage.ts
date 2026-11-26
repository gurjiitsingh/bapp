
"use server";

import type { InventoryHandlerInput } from "./handleAdjustmentOut";

export async function handleWastage({
  tx,
  inventoryRef,
  currentStock,
  currentAverageCost,
  inputQuantity,
  inputPrice,
  purchaseUnit,
  conversionFactor,
  now,
}: InventoryHandlerInput) {
  // VALIDATION
  if (inputQuantity <= 0) {
    throw new Error("Wastage quantity must be greater than zero");
  }

  if (conversionFactor <= 0) {
    throw new Error("Invalid conversion factor");
  }

  if (currentStock < 0) {
    throw new Error("Invalid current stock quantity");
  }

  // 1. CONVERT WASTAGE QUANTITY TO CONSUMPTION UNIT
  const wastageStockQty = inputQuantity * conversionFactor;

  // 2. CHECK AVAILABLE STOCK
  if (wastageStockQty > currentStock) {
    throw new Error("Insufficient stock for wastage");
  }

  // 3. CURRENT STOCK VALUE
  const currentStockValue =
    (currentAverageCost * currentStock) / conversionFactor;

  // 4. WASTAGE VALUE
  // Existing average purchase-unit cost × wastage purchase quantity.
  const wastageValue = inputPrice * inputQuantity;

  // 5. REMAINING STOCK
  const newStockQty = currentStock - wastageStockQty;

  // 6. REMAINING STOCK VALUE
  const totalAmount = Math.max(
    0,
    currentStockValue - wastageValue
  );

  // 7. KEEP EXISTING AVERAGE COST
  const averageCost = currentAverageCost;
  const purchaseUnitCost = currentAverageCost;

  // 8. UPDATE INVENTORY
  tx.update(inventoryRef, {
    currentStock: newStockQty,
    stockValue: totalAmount,

    // Wastage must not change average cost.
    averageCost,
    costPrice: averageCost,
    purchaseUnitCost,

    purchaseUnit,
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
