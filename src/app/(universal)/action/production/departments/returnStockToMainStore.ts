"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { CreateProductionBatchInputType } from "@/lib/types/production/CreateProductionBatchInputType";
 
import { departmentStockTransaction } from "./departmentStockTransaction";
 
 
import { validateDepartmentStock } from "./validateDepartmentStock";
 
import { readRawInventoryData } from "../readRawInventoryData";
import { writeInventoryData_StoreAndDpt } from "../../inventory/rawInventory/writeInventoryData_StoreAndDpt";
import { applyTransactionInventory_StoreAndDpt } from "../../inventory/rawInventory/applyTransactionInventory_StoreAndDpt";
import { getDepartmentStockData } from "./getDepartmentStockData";
import { updateDepartmentStockTx } from "./UpdateDepartmentStockTx";

export async function returnStockToMainStore(
    input: CreateProductionBatchInputType
) {
    const db = adminDb;

 //   console.log("input----------------",input)

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

            const itemsInConsumptionUnit = input.items.map((item) => ({
  ...item,
  quantity: item.quantity * (item.conversionFactor || 1),
}));

   const rawRequest = itemsInConsumptionUnit.map((item) => ({
  inventoryItemId: item.inventoryItemId,
  quantity: item.quantity,
  averageCostDpt: item.averageCost,
  purchaseUnitDpt: item.purchaseUnit,
  conversionFactorUsed: item.conversionFactor || 1,
}));

            // const rawRequest = input.items.map((item) => ({
            //     inventoryItemId: item.inventoryItemId,
            //     quantity: item.quantity *   (item.conversionFactor || 1),
            //     averageCostDpt: item.averageCost,
            //     purchaseUnitDpt: item.purchaseUnit,
            //     conversionFactorUsed: item.conversionFactor || 1,
            // })); 

            // ==========================================
            // 2. READ RAW INVENTORY
            // ==========================================
             
            const rawUpdates =
                await readRawInventoryData(
                    tx,
                    "IN",
                    rawRequest,

                );

            // ==========================================
            // 3. READ DEPARTMENT STOCK
            // ==========================================
           
            const departmentRecord =
                await getDepartmentStockData(
                    tx,
                    input.departmentId,
                    "OUT",
                      itemsInConsumptionUnit
                );
console.log("Dpt stock returned -----------------------",departmentRecord)
            // ==========================================
            // 4. VALIDATE RAW STOCK
            // ==========================================

            validateDepartmentStock(departmentRecord);

            // ==========================================
            // 5. WRITE DEPARTMENT STOCK
            // ==========================================
            
            for (const update of departmentRecord) {
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


                    type: "RETURN_TO_MAIN_STORE",
                    direction: "OUT",
                    referenceType: "RETURN_TO_MAIN_STORE",

                    createdAt: now,
                });
            }

          // ==========================================
      // 7. WRITE INVENTORY STOCK
      // ==========================================


      await writeInventoryData_StoreAndDpt(
        tx,
        rawUpdates,
        transferId,
        "IN"
      );


          // ==========================================
      // 7. WRITE INVENTORY LEDGER 
      // ==========================================
      //UPDATE: stockLedgerInventory
      await applyTransactionInventory_StoreAndDpt(
        tx,
        rawUpdates,
        transferId,
        "DPT RETURN",
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