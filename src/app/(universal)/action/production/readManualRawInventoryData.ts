"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function readManualRawInventoryData(
  tx: FirebaseFirestore.Transaction,
  items: {
    inventoryItemId: string;
    quantity: number;
    averageCostDpt:number;
    purchaseUnitDpt:string;
  }[]
) {
  const updates: any[] = [];

  for (const item of items) {
    const returnQty = Number(item.quantity) || 0;

    if (returnQty <= 0) continue;

    // ✅ DIRECT inventory read (NO productStock)
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

    const currentStockStore = Number(data.currentStock) || 0;

    const afterStock = currentStockStore - returnQty;

    console.log("inv item---------------------------",data)

    updates.push({
      ref: inventoryRef,

      inventoryItemId: item.inventoryItemId,
      itemName: data.name || "",

      // ===== Units =====
      purchaseQuantity: 0,

      purchaseUnit: item.purchaseUnitDpt, 

      conversionFactor:
        Number(data.conversionFactor) || 1,

      returnQty: returnQty,

      consumptionUnit:
        data.consumptionUnit || "gm",

      // ===== Cost =====
      averageCostStore:
        Number(data.averageCost) || 0,
        averageCostDpt:
        Number(item.averageCostDpt) || 0,

      stockValueStore:
        Number(data.stockValue) || 0,
    

      purchaseUnitCost:data.purchaseUnitCost,
      // ===== Stock =====
      currentStockStore: currentStockStore,
      afterStock: afterStock,
      next: afterStock,
    });
  }

  return updates;
}