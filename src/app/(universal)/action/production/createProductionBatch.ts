"use server";

import { adminDb } from "@/lib/firebaseAdmin";
 

import { getRawInventoryData } from "../inventory/rawInventory/getRawInventoryData";
import { validateRawStock } from "../inventory/rawInventory/validateRawStock";
import { applyRawInventoryWrites } from "../inventory/rawInventory/applyRawInventoryWrites";
import { CreateProductionBatchInputType } from "@/lib/types/production/CreateProductionBatchInputType";
import { getManualRawInventoryData } from "./getManualRawInventoryData";

export async function createProductionBatch(
  input: CreateProductionBatchInputType
) {
  const db = adminDb;


  

  try {
    if (!input.departmentId) {
      return { success: false, message: "Department required" };
    }

    if (!input.items.length) {
      return { success: false, message: "Add items" };
    }


    // ======================== BATCH ===============
    
    

const now = new Date();

const datePart = now
  .toISOString()
  .slice(0, 10)
  .replace(/-/g, ""); // 20260710

const timestamp = Date.now(); // unique

const deptCode =
  input.departmentName?.replace(/\s+/g, "-").toUpperCase() || "DEPT";

const batchId = `${deptCode}-${datePart}-${timestamp}`;

 

    await db.runTransaction(async (tx) => {
      // =========================
      // ✅ 1. PREPARE RAW REQUEST
      // =========================

     const rawRequest = input.items.map((item) => ({
  inventoryItemId: item.inventoryItemId,
  quantity: item.quantity,
}));



      // =========================
      // ✅ 2. READ RAW INVENTORY
      // =========================

     const rawUpdates = await getManualRawInventoryData(
  tx,
  rawRequest
);

      // =========================
      // ✅ 3. VALIDATE STOCK
      // =========================

      validateRawStock(rawUpdates);

      // =========================
      // ✅ 4. CREATE BATCH
      // =========================

      const batchRef = db
        .collection("production_batches")
        .doc(batchId);

      tx.set(batchRef, {
        id: batchId,
        departmentId: input.departmentId,
        departmentName: input.departmentName,
        createdAt: now,
        note: input.note || "",
        isClosed: false,
      });

      // =========================
      // ✅ 5. SAVE ITEMS
      // =========================

      for (const item of input.items) {
        const ref = db.collection("production_batch_items").doc();

        tx.set(ref, {
          id: ref.id,
          batchId,
          inventoryItemId: item.inventoryItemId,
          inventoryItemName: item.inventoryItemName,
          quantity: item.quantity,
          unit: item.unit,
          costPerUnit: item.costPerUnit,
          totalCost: item.quantity * item.costPerUnit,
          createdAt: now,
        });
      }

      // =========================
      // ✅ 6. APPLY INVENTORY (IMPORTANT 🔥)
      // =========================

      await applyRawInventoryWrites(
        tx,
        rawUpdates,
        `production-batch-${batchId}`
      );
    });

    return {
      success: true,
      message: "Batch created successfully",
      batchId,
    };
  } catch (error: any) {
    console.error("❌ createProductionBatch:", error);

    return {
      success: false,
      message: error.message || "Failed",
    };
  }
}