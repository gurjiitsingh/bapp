"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";
import { processInventory_FinishedStockCreated } from "../inventory/processInventory_FinishedStockCreated";
import { applyFinishedMovement } from "./finishedStockLedger/applyFinishedMovement";
import { applyInventoryMovement } from "../inventory/applyInventoryMovement";
import { InventoryUnit } from "@/lib/types/InventoryItemType";

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
  try {
    if (!id) {
      return {
        success: false,
        message: "Product ID required",
      };
    }

    if (!quantity || quantity <= 0) {
      return {
        success: false,
        message: "Invalid quantity",
      };
    }

    // =========================================================
    // UPDATE FINISHED PRODUCT + LEDGER
    // =========================================================

    const movement =
      await applyFinishedMovement({
        productId: id,

        productName,

        type:
          direction === "IN"
            ? "PRODUCTION"
            : "ADJUSTMENT",

        direction,

        quantity,
        transactionUnit,

        note,

        createdBy:
          createdBy || "system",

        source: "ADMIN",
      });

    // =========================================================
    // RAW MATERIAL CONSUMPTION
    // (ONLY WHEN PRODUCING FINISHED GOODS)
    // =========================================================

    if (direction === "IN") {
      const productSnap =
        await adminDb
          .collection("products")
          .doc(id)
          .get();

      if (!productSnap.exists) {
        throw new Error(
          "Product not found"
        );
      }

      const productData =
        productSnap.data();

      const recipesSnapshot =
        await adminDb
          .collection("productRecipes")
          .where(
            "productId",
            "==",
            id
          )
          .get();

      for (const doc of recipesSnapshot.docs) {
        const recipe = doc.data();

        await applyInventoryMovement({
          inventoryItemId:
            recipe.inventoryItemId,

          type: "CONSUMPTION",

          direction: "OUT",

          quantity:
            (Number(
              recipe.quantity
            ) || 0) * quantity,

          note: `Used for production of ${productData?.name}`,

          referenceId:
            "movement.transactionId",

          referenceType:
            "PRODUCTION",

          createdBy:
            createdBy || "system",

          source: "ADMIN",
        });
      }
    }

    // =========================================================
    // CACHE
    // =========================================================

    revalidateTag(
      "products",
      "max"
    );

    revalidatePath(
      "/admin/products"
    );

    revalidatePath(
      "/admin/products/dashboard"
    );

    return {
      success: true,
      message:
        "Stock updated successfully",
    };
  } catch (error: any) {
    console.error(
      "❌ updateFinishedItemStock:",
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "Failed to update stock",
    };
  }
}