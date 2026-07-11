"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { applyRawInventoryWrites } from "../inventory/rawInventory/applyRawInventoryWrites";
import { validateRawStock } from "../inventory/rawInventory/validateRawStock";
import { getRawInventoryData } from "../inventory/rawInventory/getRawInventoryData";

import { getStockLocation } from "../distribution/getStockLocation";
import { addStockLocationTx } from "../distribution/addStockLocation";
import { addStockMovement } from "../distribution/addStockMovement";
import { applyFinishedTransactionsRead } from "../stock-finished/finishedStockLedger/applyFinishedTransactionsRead";
import { applyFinishedTransactionsWrite } from "../stock-finished/finishedStockLedger/applyFinishedTransactionsWrite";
import { getProductionBatchById } from "./getProductionBatchById";



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

export async function stockProductionManual({
  id,
  batchId,
  productName,
  sellingPrice,
  wholesalePrice,
  costPrice,
  //avgCost,
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


      const batchRes = await getProductionBatchById(batchId);

      if (!batchRes.success) {
        throw new Error("Batch not found");
      }

      const batchData = batchRes.data;

      console.log("batch--------------", batchData)



      // 🔥 total raw cost (already correct)
      const totalRawCost = batchData!.calculatedTotalCost;

      if (!quantity || quantity <= 0) {
        throw new Error("Finished quantity must be greater than 0");
      }

      const avgCostPerUnit = totalRawCost / quantity;
      console.log("avgCostPerUnit----------------", avgCostPerUnit, totalRawCost, quantity)
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


      // 1 ✅ Read stock (finished currentStock)
      const finishedData = await applyFinishedTransactionsRead(tx, id);

      // =========================
      // ✅ 3. WRITE
      // =========================
      // 1  Decrease department stock

// await updateDepartmentStock({
//   departmentId,
//   inventoryItemId,
//   qtyChange: -usedQty,
// });


      // 2 ✅ Update Batch


      tx.update(
        db.collection("production_batches").doc(batchId),
        {
          outputQty: quantity,              // ✅ finished goods qty
          avgCostPerUnit: avgCostPerUnit,   // ✅ calculated cost
          totalCost: totalRawCost,          // (keep consistent)
          status: "CLOSED",                 // ✅ mark done
          endTime: new Date(),

        }
      );



      // 1 ✅ Update stock (finished currentStock)
      // 2 ✅ Create ledger entry (stockLedgerFinished transactions)
      // 2. Update finished product
      await applyFinishedTransactionsWrite(tx, {
        productId: id,
        batchId: batchId,
        productName,
        type: "PRODUCTION",
        direction,
        quantity,
        transactionUnit,

        unitPrice: 0,
        totalAmount: 0,
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
          avgCost: avgCostPerUnit,
          productMode: "finished_stock",

          locationType: "STORE",
          locationRef: "MAIN",

          quantity,
        });
      }

      await addStockMovement({
        tx,

        movementType: "TRANSFER",
        batchId: batchId,
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