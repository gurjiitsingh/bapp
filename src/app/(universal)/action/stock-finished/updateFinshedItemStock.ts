"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";
import { applyFinishedTransactions } from "./finishedStockLedger/applyFinishedTransactions";
import { applyInventoryMovement } from "../inventory/applyInventoryMovement";
import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { processSaleInventory } from "../inventory/processSaleInventory";
import { processRawInventory } from "../inventory/processRawInventory";
import { applyRawInventoryWrites } from "../inventory/rawInventory/applyRawInventoryWrites";
import { validateRawStock } from "../inventory/rawInventory/validateRawStock";
import { getRawInventoryData } from "../inventory/rawInventory/getRawInventoryData";

import { getStockLocation } from "../distribution/getStockLocation";
import { addStockLocationTx } from "../distribution/addStockLocation";
import { addStockMovement } from "../distribution/addStockMovement";
import { applyFinishedTransactionsRead } from "./finishedStockLedger/applyFinishedTransactionsRead";
import { applyFinishedTransactionsWrite } from "./finishedStockLedger/applyFinishedTransactionsWrite";


type AdjustStockType = {
  id: string;
  batchId: string;
  productName: string;
  sellingPrice: number;
  wholesalePrice: number;
  costPrice: number;
  avgCost: number;
  direction: "IN" | "OUT";
  quantity: number;
  transactionUnit: InventoryUnit;
  note?: string;
  createdBy?: string;
};

export async function updateFinishedItemStock({
  id,
  batchId,
  productName,
  sellingPrice,
  wholesalePrice,
  costPrice,
  avgCost,
  direction,

  quantity,
  transactionUnit,
  note,
  createdBy,
}: AdjustStockType) {
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
      // ✅ 1. READ
      // =========================
      let rawUpdates: any[] = [];

      if (direction === "IN") {
        rawUpdates = await getRawInventoryData(tx, [
          { productId: id, quantity }
        ]);
      }
      let totalRawMaterialCost = 0;
      for (const u of rawUpdates) {
        // =====================================
        // Cost of this inventory item
        // =====================================

        const consumedValue =
          (Number(u.quantity) || 0) *
          (Number(u.unitCost) || 0);

        totalRawMaterialCost += consumedValue;

        const newStockValue = Math.max(
          0,
          (Number(u.stockValue) || 0) - consumedValue
        );

      }


      //=============================
      // READ STOCK LOCATION
      //=============================

      // const factoryLocation = await getStockLocation({
      //   tx,
      //   productId: id,
      //   locationType: "FACTORY",
      //   locationRef: "MAIN",
      // });

      const storeLocation = await getStockLocation({
        tx,
        productId: id,
        locationType: "STORE",
        locationRef: "MAIN",
      });

      // =========================
      // ✅ 2. VALIDATE
      // =========================
      if (direction === "IN") {
        validateRawStock(rawUpdates);
      }

      // 1 ✅ Read stock (finished currentStock)
      const finishedData = await applyFinishedTransactionsRead(tx, id);

      // =========================
      // ✅ 3. WRITE
      // =========================
      // 1 ✅ Update stock (inventroy currentStock)
      // 2 ✅ Create ledger entry (stockLedgerInventory transactions)

      // 1. Consume raw inventory

console.log("rawUpdates in working---------------", rawUpdates)
      if (direction === "IN") {
        await applyRawInventoryWrites(
          tx,
          rawUpdates,
          "production-" + id,
           "CONSUMPTION",
           "OUT",
           "Consumed in producttion",
           "PRODUCTION",
           "PROD"
        )
      }

  //     type: string,
  // direction: "OUT" | "IN" = "OUT",
  // note: string = "Consumed in production",
  // createdBy: string = "system",
  // source: string = "PRODUCTION",

      const productionCostPerUnit =
        quantity > 0
          ? totalRawMaterialCost / quantity
          : 0;



      // 1 ✅ Update stock (finished currentStock)
      // 2 ✅ Create ledger entry (stockLedgerFinished transactions)
      // 2. Update finished product
      await applyFinishedTransactionsWrite(tx, {
        productId: id,
        batchId:"ABC",
        productName,
        type: "PRODUCTION",
        direction,
        quantity,
        transactionUnit,

        unitPrice: productionCostPerUnit,
        totalAmount: totalRawMaterialCost,
        note,
        createdBy,
        source: "ADMIN",

        readResult: finishedData,
      });



      // =========================
      // ✅ Update Factory Location
      // =========================
      if (direction === "IN") {
       
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
      }

      await addStockMovement({
        tx,

        movementType: "TRANSFER",
batchId: "ABC",
        productId: id,
        productName,
        name: "FACTORY",
        locationCode: "NA",
        responsiblePerson: "ADMIN",
        //productMode: row.factory.productMode,

        quantity,

        fromLocationType: "FACTORY",
        fromLocationRef: "MAIN",

        toLocationType: "STOCK",
        toLocationRef: "NA",

        remarks: "NA",

        createdBy,
      });



    });



    // =====================================================
    // CACHE
    // =====================================================
    // revalidateTag("products", "max");
    // revalidatePath("/admin/products");
    // revalidatePath("/admin/products/dashboard");

    return {
      success: true,
      message: "Stock updated successfully",
    };
  } catch (error: any) {
    console.error("❌ updateFinishedItemStock:", error);

    return {
      success: false,
      message: error.message || "Failed to update stock",
    };
  }
}