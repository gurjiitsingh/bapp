"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { CreateProductionBatchInputType } from "@/lib/types/production/CreateProductionBatchInputType";
import { getManualRawInventoryData } from "../getManualRawInventoryData";
import { validateRawStock } from "../../inventory/rawInventory/validateRawStock";
import { applyRawInventoryWrites } from "../../inventory/rawInventory/applyRawInventoryWrites";
import { departmentStockTransaction } from "./departmentStockTransaction";
import { updateDepartmentStockTx } from "./UpdateDepartmentStockTx";
import { getDepartmentStockData } from "./getDepartmentStockData";

export async function issueStockToDepartment(
  input: CreateProductionBatchInputType
) {
  const db = adminDb;

  try {
    if (!input.departmentId) {
      return {
        success: false,
        message: "Department required",
      };
    }

    if (!input.items.length) {
      return {
        success: false,
        message: "Add items",
      };
    }

    const now = new Date();
    const timestamp = Date.now();
    const transferId = `DEPT-ISSUE-${timestamp}`;

    await db.runTransaction(async (tx) => {
      // ==========================================
      // 1. PREPARE RAW REQUEST
      // ==========================================

      const rawRequest = input.items.map((item) => ({
        inventoryItemId: item.inventoryItemId,
        quantity:
          item.quantity *
          (item.conversionFactor || 1),
      }));

      // ==========================================
      // 2. READ RAW INVENTORY
      // ==========================================

      const rawUpdates =
        await getManualRawInventoryData(
          tx,
          rawRequest
        );

      // ==========================================
      // 3. READ DEPARTMENT STOCK
      // ==========================================

      const departmentUpdates =
        await getDepartmentStockData(
          tx,
          input.departmentId,
          input.items
        );

      // ==========================================
      // 4. VALIDATE RAW STOCK
      // ==========================================

      validateRawStock(rawUpdates);

      // ==========================================
      // 5. WRITE DEPARTMENT STOCK
      // ==========================================

      for (const update of departmentUpdates) {
        await updateDepartmentStockTx({
          transaction: tx,
          update,
        });
      }

      // ==========================================
      // 6. WRITE DEPARTMENT LEDGER
      // ==========================================

      for (const item of input.items) {
        await departmentStockTransaction({
          transaction: tx,

          transferId,

          departmentId: input.departmentId,
          departmentName:
            input.departmentName,

          inventoryItemId:
            item.inventoryItemId,
          inventoryItemName:
            item.inventoryItemName,

          quantity: item.quantity,

          purchaseUnit:
            item.purchaseUnit,
          consumptionUnit:
            item.consumptionUnit,
          conversionFactor:
            item.conversionFactor,

          averageCost:
            item.averageCost,
          costPerUnit:
            item.costPerUnit,
          totalCost:
            item.quantity *
            item.costPerUnit,
          type: "ISSUE_TO_DEPARTMENT",
          direction: "IN",
          referenceType: "PRODUCTION_BATCH",

          createdAt: now,
        });
      }

      // ==========================================
      // 7. WRITE RAW INVENTORY
      // ==========================================

      await applyRawInventoryWrites(
        tx,
        rawUpdates,
        transferId
      );
    });

    return {
      success: true,
      message:
        "Stock issued to department successfully.",
    };
  } catch (error: any) {
    console.error(
      "❌ issueStockToDepartment:",
      error
    );

    return {
      success: false,
      message:
        error.message || "Failed",
    };
  }
}