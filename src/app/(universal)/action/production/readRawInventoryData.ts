"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function readRawInventoryData(
  tx: FirebaseFirestore.Transaction,
  direction: "IN" | "OUT",
  items: {
    inventoryItemId: string;
    quantity: number;
    averageCostDpt: number;
    purchaseUnitDpt: string;
    conversionFactorUsed: number;
  }[]
) {
  const updates: any[] = [];

  for (const item of items) {
    const qty = Number(item.quantity) || 0;

    if (qty <= 0) continue;

    const inventoryRef = adminDb
      .collection("inventoryItems")
      .doc(item.inventoryItemId);

    const snap = await tx.get(inventoryRef);

    if (!snap.exists) {
      throw new Error(
        `Inventory not found: ${item.inventoryItemId}`
      );
    }

    const data = snap.data()!;

    // ===== Store Data =====
    const storeStock = Number(data.currentStock) || 0;
    const storeAvgCost = Number(data.averageCost) || 0;
    const storeStockValue = Number(data.stockValue) || 0;

    // ===== Stock Calculation =====
    let afterStock = 0;

    if (direction === "IN") {
      afterStock = storeStock + qty;
    } else {
      // ✅ Prevent negative stock
      if (qty > storeStock) {
        throw new Error(
          `Insufficient stock for ${data.name}`
        );
      }

      afterStock = storeStock - qty;
    }

updates.push({
  ref: inventoryRef,

  inventoryItemId: item.inventoryItemId,
  itemName: data.name || "",

  // ===== Quantity =====
  sendQty:qty, // 🔄 was "quantity"

  // ===== Units =====
  purchaseUnit: item.purchaseUnitDpt, // 🔄 was store purchaseUnit

  consumptionUnit:
    data.consumptionUnit || "gm",

  conversionFactor:
    Number(item.conversionFactorUsed) || 1, // 🔄 was "conversionFactor"

  // ===== Cost =====
  storeAvgCost, // 🔄 was "unitCost"

  dptAvgCost:
    Number(item.averageCostDpt) || 0,

  storeStockValue, // 🔄 was "stockValue"

  purchaseUnitCost: data.purchaseUnitCost,

  // ===== Stock =====
  storeStock, // 🔄 was "prev"

  afterStock, // 🔄 now calculated earlier (was later)
});
  }

  return updates;
}