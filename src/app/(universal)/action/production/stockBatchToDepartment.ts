"use server";

import { adminDb } from "@/lib/firebaseAdmin";


import { getRawInventoryData } from "../inventory/rawInventory/getRawInventoryData";
import { validateRawStock } from "../inventory/rawInventory/validateRawStock";
import { applyRawInventoryWrites } from "../inventory/rawInventory/applyRawInventoryWrites";
import { CreateProductionBatchInputType } from "@/lib/types/production/CreateProductionBatchInputType";
import { getManualRawInventoryData } from "./getManualRawInventoryData";
import { updateDepartmentStock } from "./updateDepartmentStock";
import { getProductionBatchItem } from "./getProductionBatchItem";
import { getDepartmentStockItemByIdTx } from "./departments/getDepartmentStockItemById";

export async function stockBatchToDepartment({
  batchId,
  itemId,
  returnQty,
}: {
  batchId: string;
  itemId: string;
  returnQty: number;
}) {
  const db = adminDb;

const now = new Date();
 

  try {
  

    if (!itemId) {
      return { success: false, message: "Add items" };
    }


    
 
  await db.runTransaction(async (tx) => {
  // =====================================
  // 1. READ BATCH ITEM
  // =====================================

  const batchItem = await getProductionBatchItem(
    tx,
    itemId
  );

  // Validate item belongs to batch
  if (batchItem.batchId !== batchId) {
    throw new Error("Invalid batch item.");
  }

  // =====================================
  // 2. READ PRODUCTION BATCH
  // =====================================

  const batchRef = db
    .collection("production_batches")
    .doc(batchId);

  const batchSnap = await tx.get(batchRef);

  if (!batchSnap.exists) {
    throw new Error("Production batch not found.");
  }

  const batchData = batchSnap.data()!;

  const departmentId = batchData.departmentId;

  if (!departmentId) {
    throw new Error("Department not found for batch.");
  }

  // =====================================
  // 3. READ DEPARTMENT STOCK
  // =====================================

  const departmentStock =
    await getDepartmentStockItemByIdTx(
      tx,
      departmentId,
      batchItem.inventoryItemId
    );

  // =====================================
  // 4. VALIDATION
  // =====================================

  if (returnQty <= 0) {
    throw new Error("Return quantity must be greater than zero.");
  }

  if (returnQty > batchItem.quantity) {
    throw new Error(
      "Return quantity exceeds issued quantity."
    );
  }

  // =====================================
  // 5. UPDATE BATCH ITEM
  // =====================================

  const itemRef = db
    .collection("production_batch_items")
    .doc(itemId);

  tx.update(itemRef, {
    quantity: batchItem.quantity - returnQty,
  });

  console.log("Department Stock:", departmentStock);

  // =====================================
// 6. UPDATE DEPARTMENT STOCK
// =====================================

const departmentStockRef = db
  .collection("departmentStock")
  .doc(departmentStock!.id);

tx.update(departmentStockRef, {
  quantity: departmentStock!.quantity + returnQty,
  updatedAt: now,
});
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