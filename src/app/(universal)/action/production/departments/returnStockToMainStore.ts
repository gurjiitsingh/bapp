"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { CreateProductionBatchInputType } from "@/lib/types/production/CreateProductionBatchInputType";
import { getManualRawInventoryData } from "../getManualRawInventoryData";
import { departmentStockTransaction } from "./departmentStockTransaction";
import { updateDepartmentStockTxM } from "./updateDepartmentStockTxM";
import { applyRawInventoryWritesM } from "../../inventory/rawInventory/applyRawInventoryWritesM";
import { validateDepartmentStock } from "./validateDepartmentStock";
import { getDepartmentStockDataM } from "./getDepartmentStockDataM";

export async function returnStockToMainStore(
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
        const transferId = `DEPT-RETURN-${timestamp}`;

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
                await getDepartmentStockDataM(
                    tx,
                    input.departmentId,
                    input.items
                );

            // ==========================================
            // 4. VALIDATE RAW STOCK
            // ==========================================

            validateDepartmentStock(departmentUpdates);

            // ==========================================
            // 5. WRITE DEPARTMENT STOCK
            // ==========================================

          for (const update of departmentUpdates) {
  await updateDepartmentStockTxM({
  transaction: tx,
  update,
  qtyChange: -update.transferQuantity,
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


                    type: "RETURN_TO_MAIN_STORE",
                    direction: "OUT",
                    referenceType: "RETURN_TO_MAIN_STORE",

                    createdAt: now,
                });
            }

            // ==========================================
            // 7. WRITE RAW INVENTORY
            // ==========================================

            await applyRawInventoryWritesM(
                tx,
                rawUpdates,
                transferId,
                "IN"
            );
        });

        return {
            success: true,
            message: "Stock returned to main store successfully."
        };
    } catch (error: any) {
      console.error("❌ returnStockToMainStore:", error);
        return {
            success: false,
            message:
                error.message || "Failed",
        };
    }
}