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
import { updateFinishedStock } from "./finshed-products/updateFinishedStock";


type AdjustStockType = {
  id: string;
  productName: string;
  sellingPrice:  number;
  wholesalePrice:  number;
  type:  
  | "PURCHASE"
  | "OPENING_STOCK"
  | "ADJUSTMENT"
  | "WASTAGE"
  // | "SUPPLIER_RETURN"
  | "PURCHASE_RETURN"
  | "CUSTOMER_RETURN";
  costPrice:  number;
  avgCost:  number;
  direction: "IN" | "OUT";
  quantity: number;
  transactionUnit: InventoryUnit;
  note?: string;
  createdBy?: string;
};

export async function adjustFinishedItemStock({
  id,
  productName,
  sellingPrice,
  wholesalePrice,
  costPrice,
  avgCost,
  direction,
  type,
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
 
    if (quantity < 0) {
  return {
    success: false,
    message: "Quantity cannot be negative",
  };
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


      //=============================
      // READ STOCK LOCATION
      //=============================

      // const factoryLocation = await getStockLocation({
      //   tx,
      //   productId: id,
      //   locationType: "FACTORY",
      //   locationRef: "MAIN",
      // });

      // =========================
      // ✅ 2. VALIDATE
      // =========================
      if (direction === "IN") {
        validateRawStock(rawUpdates);
      }

      // =========================
      // ✅ 3. WRITE
      // =========================
      // 1 ✅ Update stock (finished currentStock)
      const stock = await updateFinishedStock({
  tx,
  productId: id,
  mode: "SET",
  quantity,
});

// Adjustment +
// const stock = await updateFinishedStock({
//   tx,
//   productId: id,
//   mode: "INCREASE",
//   quantity,
// });

// // Adjustment -
// const stock = await updateFinishedStock({
//   tx,
//   productId: id,
//   mode: "DECREASE",
//   quantity,
// });
      // 2 ✅ Create ledger entry (stockLedgerFinished transactions)
      // const movement = await applyFinishedTransactions(tx, {
      //   productId: id,
      //   productName,
      //   type: "PRODUCTION",
      //   direction,
      //   quantity,
      //   unitPrice: 0,
      //   transactionUnit,
      //   note,
      //   createdBy: createdBy || "system",
      //   source: "ADMIN",
      // });


      // 1 ✅ Update stock (inventroy currentStock)
      // 2 ✅ Create ledger entry (stockLedgerInventory transactions)


      // if (direction === "IN") {
      //   await applyRawInventoryWrites(
      //     tx,
      //     rawUpdates,
      //     "production-" + id
      //   );
      // }


      // =========================
      // ✅ Update Factory Location
      // =========================
      if (direction === "IN") {
        // await addStockLocationTx({
        //   tx,
        //   stockLocation: factoryLocation,

        //   productId: id,
        //   productName,
        //   sellingPrice,
        //   wholesalePrice,
        //   costPrice,
        //   avgCost,
        //   productMode: "finished_stock",

        //   locationType: "FACTORY",
        //   locationRef: "MAIN",

        //   quantity,
        // });
      }

  // await addStockMovement({ 
  //         tx,

  //         movementType: "TRANSFER",

  //         productId: id,
  //         productName,
  //         name: "FACTORY",
  //         locationCode:"NA",
  //         responsiblePerson:"ADMIN",
  //         //productMode: row.factory.productMode,

  //         quantity,

  //         fromLocationType: "FACTORY",
  //         fromLocationRef: "MAIN",

  //         toLocationType: "STOCK",
  //         toLocationRef: "NA",

  //         remarks:"NA",

  //         createdBy,
  //       });



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