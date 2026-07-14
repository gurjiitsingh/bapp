"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { CreateProductionBatchInputType } from "@/lib/types/production/CreateProductionBatchInputType";
import { getManualRawInventoryData } from "../getManualRawInventoryData";
import { departmentStockTransaction } from "./departmentStockTransaction";
import { updateDepartmentStockTxM } from "./updateDepartmentStockTxM";
import { applyRawInventoryWritesM } from "../../inventory/rawInventory/applyRawInventoryWritesM";
import { validateDepartmentStock } from "./validateDepartmentStock";
import { getDepartmentStockDataM } from "./getDepartmentStockDataM";
import { applyRawInventoryDptReturn } from "../../inventory/rawInventory/applyRawInventoryDptReturn";
import { returnDptToMainStore } from "../../inventory/rawInventory/returnDptToMainStore";
import { readManualRawInventoryData } from "../readManualRawInventoryData";
import { applyInventoryTransactionDptReturn } from "../../inventory/rawInventory/applyInventoryTransactionDptReturn";

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
//console.log("item---------------", input.items)
        const now = new Date();
        const timestamp = Date.now();
        const transferId = `DEPT-RETURN-${timestamp}`;

        await db.runTransaction(async (tx) => {
            // ==========================================
            // 1. PREPARE RAW REQUEST
            // ==========================================

            const rawRequest = input.items.map((item) => ({
                inventoryItemId: item.inventoryItemId,
                quantity: item.quantity * (item.conversionFactor || 1),
                averageCostDpt: item.averageCost,
                purchaseUnitDpt: item.purchaseUnit,
            }));

            // ==========================================
            // 2. READ RAW INVENTORY
            // ==========================================
console.log("pt-------------------------1")
            const rawUpdates =
                await readManualRawInventoryData(
                    tx,
                    rawRequest
                );

            // ==========================================
            // 3. READ DEPARTMENT STOCK
            // ==========================================
console.log("pt-------------------------2")
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
console.log("pt-------------------------3")
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
            // 7. Update RAW INVENTORY
            // ==========================================
console.log("pt-------------------------4")
            await returnDptToMainStore(
                tx,
                rawUpdates,
                transferId,
                "IN"
            );


            // ==========================================
            // 7. WRITE RAW INVENTORY
            // ==========================================
console.log("pt-------------------------5")
            await applyInventoryTransactionDptReturn(
                tx,
                rawUpdates,
                transferId,
                "DPT RETURN",
                "IN"
            );

            console.log("pt-------------------------6")
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