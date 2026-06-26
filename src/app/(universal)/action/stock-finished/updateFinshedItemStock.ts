"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";
import { applyFinishedMovement } from "./finishedStockLedger/applyFinishedMovement";
import { applyInventoryMovement } from "../inventory/applyInventoryMovement";
import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { processSaleInventory } from "../inventory/processSaleInventory";
import { processRawInventory } from "../inventory/processRawInventory";
import { applyRawInventoryWrites } from "../inventory/rawInventory/applyRawInventoryWrites";
import { validateRawStock } from "../inventory/rawInventory/validateRawStock";
import { getRawInventoryData } from "../inventory/rawInventory/getRawInventoryData";


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

  // =========================
  // ✅ 1. READ
  // =========================
  let rawUpdates: any[] = [];

  if (direction === "IN") {
    rawUpdates = await getRawInventoryData(tx, [
      { productId: id, quantity }
    ]);
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
  const movement = await applyFinishedMovement(tx, {
  productId: id,
  productName,
  type: "PRODUCTION",
  direction,
  quantity,
  unitPrice: 0,
  transactionUnit,
  note,
  createdBy: createdBy || "system",
  source: "ADMIN",
});

  if (direction === "IN") {
    await applyRawInventoryWrites(
      tx,
      rawUpdates,
      "production-" + id
    );
  }
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