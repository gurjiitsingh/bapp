"use server";

import { InventoryHandlerInput } from "./handleAdjustmentOut";

 

export async function handleAdjustmentIn({
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
    throw new Error("Input quantity must be greater than zero");
  }

  if (inputPrice <= 0) {
    throw new Error("Input price must be greater than zero");
  }

  if (conversionFactor <= 0) {
    throw new Error("Invalid conversion factor");
  }

  // 1. NEW STOCK QTY (CONSUMPTION UNIT)
  const newStockQty =
    currentStock + inputQuantity * conversionFactor;

  // 2. CURRENT STOCK VALUE
  const currentStockValue =
    (currentAverageCost * currentStock) / conversionFactor;

  // 3. NEW TOTAL STOCK VALUE
  const incomingStockValue =
    inputPrice * inputQuantity;

  const totalAmount =
    currentStockValue + incomingStockValue;

  // 4. NEW AVERAGE PURCHASE PRICE
  const totalPurchaseQty =
    currentStock / conversionFactor + inputQuantity;

  const newPrice =
    totalPurchaseQty > 0
      ? totalAmount / totalPurchaseQty
      : 0;

  // 5. NEW AVERAGE COST (CONSUMPTION UNIT)
  const averageCost =
    newPrice  ;

  // 6. UPDATE INVENTORY
  tx.update(inventoryRef, {
    currentStock: newStockQty,
    stockValue: totalAmount,
    averageCost,
    costPrice: averageCost,
    purchaseUnit,
    purchaseUnitCost: newPrice,
    conversionFactor,
    updatedAt: now,
  });

  return {
    quantity: newStockQty,
    totalAmount,
    averageCost,
    purchaseUnitCost: newPrice,
  };
}