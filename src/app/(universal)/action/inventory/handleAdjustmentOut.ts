
import type { Transaction } from "firebase-admin/firestore";
import type { DocumentReference } from "firebase-admin/firestore";

export type InventoryHandlerInput = {
  tx: Transaction;

  inventoryRef: DocumentReference;

  currentStock: number;
  currentAverageCost: number;

  inputQuantity: number;
  inputPrice: number;

  purchaseUnit: string;
  conversionFactor: number;

  now: FirebaseFirestore.Timestamp;
};



export async function handleAdjustmentOut({
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

  if (conversionFactor <= 0) {
    throw new Error("Invalid conversion factor");
  }

  if (currentStock < 0) {
    throw new Error("Invalid current stock quantity");
  }

  // 1. CONVERT REMOVAL QUANTITY TO CONSUMPTION UNIT
  const removedStockQty = inputQuantity * conversionFactor;

  // 2. CHECK AVAILABLE STOCK
  if (removedStockQty > currentStock) {
    throw new Error("Insufficient stock for adjustment");
  }

  // 3. CURRENT STOCK VALUE
  const currentStockValue =
    (currentAverageCost * currentStock) / conversionFactor;

  // 4. REMOVED STOCK VALUE
  // inputPrice is the existing average purchase-unit cost.
  const removedStockValue = inputPrice * inputQuantity;

  // 5. REMAINING STOCK
  const newStockQty = currentStock - removedStockQty;

  // 6. REMAINING STOCK VALUE
  const totalAmount = Math.max(
    0,
    currentStockValue - removedStockValue
  );

  // 7. KEEP EXISTING AVERAGE COST
  const averageCost = currentAverageCost;
  const purchaseUnitCost = currentAverageCost;

  // 8. UPDATE INVENTORY
  tx.update(inventoryRef, {
    currentStock: newStockQty,
    stockValue: totalAmount,

    // Do not recalculate average cost for stock removal.
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
