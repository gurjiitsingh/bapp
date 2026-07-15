"use server";
import { adminDb } from "@/lib/firebaseAdmin";
import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { getStockLocation } from "../distribution/getStockLocation";
import { applyFinishedTransactionsRead } from "./finishedStockLedger/applyFinishedTransactionsRead";
import { getDepartmentStockDataM } from "../production/departments/getDepartmentStockDataM";
import { readRawInventoryRecipes } from "../inventory/rawInventory/readRawInventoryRecipes";
import { updateDepartmentStockTxM } from "../production/departments/updateDepartmentStockTxM";
import { applyRawInventoryWrites } from "../inventory/rawInventory/applyRawInventoryWrites";
import { writeRawInventoryTx } from "../inventory/rawInventory/writeRawInventoryTx";
import { getManualRawInventoryData } from "../production/getManualRawInventoryData";
import { validateRawStock } from "../inventory/rawInventory/validateRawStock";
import { applyFinishedTransactionsWrite } from "./finishedStockLedger/applyFinishedTransactionsWrite";


type AdjustStockType = {
  id: string;
  batchId?: string;
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

  departmentId: string;
  departmentName: string;
  managerName?: string;
  employeeCount?: number;
};


export async function autoStockProduction({
  id,
  //batchId,
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

  // DPARTMENT
  departmentId,
  departmentName,
  managerName,
  employeeCount,
}: AdjustStockType) {
  const db = adminDb;
  const now = new Date();
  try {
    if (!id) {
      return { success: false, message: "Product ID required" };
    }

    if (!quantity || quantity <= 0) {
      return { success: false, message: "Invalid quantity" };
    }

        const now = new Date();
    const datePart = now
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, ""); // 20260710
    const timestamp = Date.now(); // unique
    const deptCode = departmentName?.replace(/\s+/g, "-").toUpperCase() || "DEPT";
    const batchId = `${deptCode}-${datePart}-${timestamp}`;

    await db.runTransaction(async (tx) => {
      // =========================
      // ✅ 1. READ
      // =========================
      let rawUpdates: any[] = [];

      if (direction === "IN") {
        rawUpdates = await readRawInventoryRecipes(tx, [
          { productId: id, quantity }
        ]);
      }

      //=============================
      // DEPARTMENT STOCK
      //=============================



      const departmentRecord =
        await getDepartmentStockDataM(
          tx,
          departmentId,
          rawUpdates
        );   
        
      //=============================
      // READ STOCK 
      //=============================

      const finishedData = await applyFinishedTransactionsRead(tx, id);

      //=============================
      // READ STOCK LOCATION
      //=============================

      const storeLocation = await getStockLocation({
        tx,
        productId: id,
        locationType: "STORE",
        locationRef: "MAIN",
      });


      // =========================
      // ✅ 4. CREATE BATCH
      // =========================

      const totalStockValue = Number(
  rawUpdates
    .reduce(
      (total, item) => total + (Number(item.stockValue) || 0),
      0
    )
    .toFixed(2)
);

const newBatchAvgCost = totalStockValue / quantity;

      const batchRef = db
        .collection("production_batches")
        .doc(batchId);

      tx.set(batchRef, {
        id: batchId,
        departmentId: departmentId,
        departmentName: departmentName,
        outputQty: quantity,
        avgCostPerUnit: newBatchAvgCost,
        createdAt: now,
        note: note || "",
        startTime: now,
        employeeCount: employeeCount,
        isClosed: false,
      });

      // =========================
      // ✅ 5. SAVE ITEMS IN BATCH
      // =========================
       

      for (const item of rawUpdates) {
        console.log("rawUpdates-----------------------",item)

        const ref = db.collection("production_batch_items").doc();
 
        tx.set(ref, {
          id: ref.id,
          batchId,
          inventoryItemId: item.inventoryItemId,
          inventoryItemName: item.inventoryItemName,
          quantity: item.quantity,
          averageCost: item.averageCost,        // 🔥 RAW (per gm)
          purchaseUnit: item.purchaseUnit,
          conversionFactor: item.conversionFactor,
          consumptionUnit: item.consumptionUnit,
          costPerUnit: item.costPerUnit,
          totalCost: item.quantity * item.costPerUnit,
          createdAt: now,
        });


        // =========================
        // ✅ 6. CONSUME DEPARTMENT STOCK
        // =========================

        const update = departmentRecord.find(
          (u) => u.inventoryItemId === item.inventoryItemId
        );

        if (!update) {
          throw new Error(
            `Department stock not found for ${item.inventoryItemName}`
          );
        }

        await updateDepartmentStockTxM({
          transaction: tx,
          update,
          qtyChange: -item.quantity,
        });      
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

      // =========================
      // ✅ 2. VALIDATE
      // =========================
      
      if (direction === "IN") {
        validateRawStock(rawUpdates);
      }


      // =========================
      // ✅ 3. WRITE
      // =========================
      // 1 ✅ Update stock (inventroy currentStock)
      // 2 ✅ Create ledger entry (stockLedgerInventory transactions)

      // 1. Consume raw inventory


      if (direction === "IN") {
        await writeRawInventoryTx(
          tx,
          rawUpdates,
          "production-" + id,
          "CONSUMPTION",
          "OUT",
          "Consumed in producttion",
          "PRODUCTION",
          "PRODUCTION"
        )


      }

       const productionCostPerUnit =
        quantity > 0
          ? totalRawMaterialCost / quantity
          : 0;



      // 1 ✅ Update stock (finished currentStock)
        await applyFinishedTransactionsWrite(tx, {
        productId: id,
        batchId: "ABC",
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

        // await addStockLocationTx({
        //   tx,
        //   stockLocation: storeLocation,

        //   productId: id,
        //   productName,
        //   sellingPrice,
        //   wholesalePrice,
        //   costPrice,
        //   avgCost,
        //   productMode: "finished_stock",

        //   locationType: "STORE",
        //   locationRef: "MAIN",

        //   quantity,
        // });
      }

      // await addStockMovement({
      //   tx,

      //   movementType: "TRANSFER",
      //   batchId: "ABC",
      //   productId: id,
      //   productName,
      //   name: "FACTORY",
      //   locationCode: "NA",
      //   responsiblePerson: "ADMIN",
      //   //productMode: row.factory.productMode,

      //   quantity,

      //   fromLocationType: "FACTORY",
      //   fromLocationRef: "MAIN",

      //   toLocationType: "STOCK",
      //   toLocationRef: "NA",

      //   remarks: "NA",

      //   createdBy,
      // });



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
    console.error("❌ autoStockProduction:", error);

    return {
      success: false,
      message: error.message || "Failed to update stock",
    };
  }
}