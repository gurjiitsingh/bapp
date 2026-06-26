"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";
import { applyFinishedMovement } from "./finishedStockLedger/applyFinishedMovement";
import { applyInventoryMovement } from "../inventory/applyInventoryMovement";
import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { processSaleInventory } from "../inventory/processSaleInventory";
import { processRawInventory } from "../inventory/processRawInventory";


type AdjustStockType = {
  id: string;
  productName: string;
  direction: "IN" | "OUT";
  quantity: number;
  transactionUnit: InventoryUnit;
  note?: string;
  createdBy?: string;
};

export async function updateFinishedItemStock({
  id,
  productName,
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
      // =====================================================
      // 1. CREATE FINISHED PRODUCT MOVEMENT (WITH TX)
      // =====================================================
      // const movement = await applyFinishedMovement({
      //   tx, // ✅ IMPORTANT
      //   productId: id,
      //   productName,
      //   type: direction === "IN" ? "PRODUCTION" : "ADJUSTMENT",
      //   direction,
      //   quantity,
      //   unitPrice: 0,
      //   transactionUnit,
      //   note,
      //   createdBy: createdBy || "system",
      //   source: "ADMIN",
      // });

      // =====================================================
      // 2. HANDLE RAW MATERIAL CONSUMPTION
      // =====================================================

await db.runTransaction(async (tx) => {

  // 🟢 FIRST: Add finished stock movement (optional)
  // await applyFinishedMovement({ tx, ... })

  // 🟢 SECOND: consume raw materials ONLY when producing
  if (direction === "IN") {
    await processRawInventory(tx, "production-" + id, [
      {
        productId: id,
        quantity,
      },
    ]);
  }

});

      // if (direction === "IN") {
      //   const productRef = db.collection("products").doc(id);
      //   const productSnap = await tx.get(productRef);

      //   if (!productSnap.exists) {
      //     throw new Error("Product not found");
      //   }

      //   const productData = productSnap.data();

      //   // ✅ QUERY INSIDE TRANSACTION
      //   const recipesQuery = db
      //     .collection("productRecipes")
      //     .where("productId", "==", id);

      //   const recipesSnapshot = await tx.get(recipesQuery);

      //   for (const doc of recipesSnapshot.docs) {
      //     const recipe = doc.data();

      //     const requiredQty =
      //       (Number(recipe.quantity) || 0) * quantity;

      //     const inventoryRef = db
      //       .collection("inventory")
      //       .doc(recipe.inventoryItemId);

      //     const inventorySnap = await tx.get(inventoryRef);

      //     if (!inventorySnap.exists) {
      //       throw new Error(
      //         `Raw material not found: ${recipe.inventoryItemId}`
      //       );
      //     }

      //     const inventoryData = inventorySnap.data();
      //     const currentStock =
      //       Number(inventoryData?.currentStock) || 0;

      //     // =================================================
      //     // 3. PREVENT NEGATIVE STOCK
      //     // =================================================
      //     if (currentStock < requiredQty) {
      //       throw new Error(
      //         `Not enough stock for ${inventoryData?.name}`
      //       );
      //     }

      //     // =================================================
      //     // 4. APPLY INVENTORY MOVEMENT (WITH TX)
      //     // =================================================
      //     // await applyInventoryMovement({
      //     //   tx, // ✅ IMPORTANT
      //     //   inventoryItemId: recipe.inventoryItemId,
      //     //   type: "CONSUMPTION",
      //     //   direction: "OUT",
      //     //   quantity: requiredQty,
      //     //   note: `Used for production of ${productData?.name}`,
      //     //   referenceId: movement?.transactionId || null,
      //     //   referenceType: "PRODUCTION",
      //     //   createdBy: createdBy || "system",
      //     //   source: "ADMIN",
      //     // });
      //   }
      // }
    });

    // =====================================================
    // CACHE
    // =====================================================
    revalidateTag("products", "max");
    revalidatePath("/admin/products");
    revalidatePath("/admin/products/dashboard");

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