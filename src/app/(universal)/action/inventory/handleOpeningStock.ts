
"use server";

import type { InventoryHandlerInput } from "./handleAdjustmentOut";

export async function handleOpeningStock({
  tx,
  inventoryRef,
  currentStock,
  inputQuantity,
  inputPrice,
  purchaseUnit,
  conversionFactor,
  now,
}: InventoryHandlerInput) {
  // VALIDATION
  if (inputQuantity <= 0) {
    throw new Error("Opening quantity must be greater than zero");
  }

  if (inputPrice <= 0) {
    throw new Error("Opening price must be greater than zero");
  }

  if (conversionFactor <= 0) {
    throw new Error("Invalid conversion factor");
  }

  // OPENING STOCK SHOULD ONLY INITIALIZE EMPTY INVENTORY
  if (currentStock > 0) {
    throw new Error(
      "Opening stock already exists. Use Adjustment to change stock."
    );
  }

  // 1. OPENING STOCK QUANTITY (CONSUMPTION UNIT)
  const newStockQty = inputQuantity * conversionFactor;

  // 2. OPENING STOCK VALUE
  const totalAmount = inputPrice * inputQuantity;

  // 3. OPENING AVERAGE PURCHASE PRICE
  const purchaseUnitCost = inputPrice;

  // 4. AVERAGE COST
  const averageCost = purchaseUnitCost;

  // 5. UPDATE INVENTORY
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
