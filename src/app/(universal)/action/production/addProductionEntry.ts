"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { InventoryUnit } from "@/lib/types/InventoryItemType";

import { getStockLocation } from "../distribution/getStockLocation";
import { addStockLocationTx } from "../distribution/addStockLocation";
import { addStockMovement } from "../distribution/addStockMovement";
import { applyFinishedTransactionsRead } from "../stock-finished/finishedStockLedger/applyFinishedTransactionsRead";
import { applyFinishedTransactionsWrite } from "../stock-finished/finishedStockLedger/applyFinishedTransactionsWrite";

 

type ProductionEntryType = {
  id: string;
  productName: string;

  sellingPrice: number;
  wholesalePrice: number;
  costPrice: number;
  avgCost: number;

  quantity: number;
  transactionUnit: InventoryUnit;

  note?: string;
  createdBy?: string;

  batchId: string; // ✅ IMPORTANT
};

export async function addProductionEntry({
  id,
  productName,
  sellingPrice,
  wholesalePrice,
  costPrice,
  avgCost,
  quantity,
  transactionUnit,
  note,
  createdBy,
  batchId,
}: ProductionEntryType) {
  const db = adminDb;

  try {
    if (!id) {
      return { success: false, message: "Product ID required" };
    }

    if (!quantity || quantity <= 0) {
      return { success: false, message: "Invalid quantity" };
    }

    await db.runTransaction(async (tx) => {

      // =========================
      // ✅ 1. READ FINISHED STOCK
      // =========================
      const finishedData =
        await applyFinishedTransactionsRead(tx, id);

      // =========================
      // ✅ 2. GET STORE LOCATION
      // =========================
      const storeLocation = await getStockLocation({
        tx,
        productId: id,
        locationType: "STORE",
        locationRef: "MAIN",
      });

      // =========================
      // ✅ 3. WRITE FINISHED STOCK
      // =========================
      await applyFinishedTransactionsWrite(tx, {
        productId: id,
        productName,

        type: "PRODUCTION",
        direction: "IN",

        quantity,
        transactionUnit,

        unitPrice: avgCost || costPrice || 0, // ✅ simple cost
        totalAmount:
          (avgCost || costPrice || 0) * quantity,

        note,
        createdBy,
        source: "BATCH",

        batchId, // ✅ LINK TO BATCH

        readResult: finishedData,
      });

      // =========================
      // ✅ 4. UPDATE STORE STOCK
      // =========================
      await addStockLocationTx({
        tx,
        stockLocation: storeLocation,

        productId: id,
        productName,
        sellingPrice,
        wholesalePrice,
        costPrice,
        avgCost,
        productMode: "finished_stock",

        locationType: "STORE",
        locationRef: "MAIN",

        quantity,
      });

      // =========================
      // ✅ 5. STOCK MOVEMENT
      // =========================
      await addStockMovement({
        tx,

        movementType: "TRANSFER",

        productId: id,
        productName,
batchId,
        name: "BATCH_PRODUCTION",
        locationCode: batchId,

        responsiblePerson: createdBy || "ADMIN",

        quantity,

        fromLocationType: "FACTORY",
        fromLocationRef: batchId,

        toLocationType: "STORE",
        toLocationRef: "MAIN",

        remarks: note || "Batch Production",

        createdBy,
      });

    });

    return {
      success: true,
      message: "Production added successfully",
    };

  } catch (error: any) {
    console.error("❌ addProductionEntry:", error);

    return {
      success: false,
      message: error.message || "Failed to add production",
    };
  }
}