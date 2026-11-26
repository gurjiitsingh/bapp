
"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

import {
  revalidatePath,
  revalidateTag,
} from "next/cache";

import { PaymentStatus } from "@/lib/types/PaymentStatus";
import { InventoryTransactionNameType } from "@/lib/types/InventoryTransactionType";
import { PaymentMethodType } from "@/lib/types/distribution/PaymentMethodType";

import { handleAdjustmentIn } from "./handleAdjustmentIn";
import { handleAdjustmentOut } from "./handleAdjustmentOut";
import { handleOpeningStock } from "./handleOpeningStock";
import { handleWastage } from "./handleWastage";
import { handleClearStock } from "./handleClearStock";
import { inventoryAdjust } from "./inventoryAdjust";

type AdjustInventoryStockType = {
  inventoryItemId: string;

  type: InventoryTransactionNameType;
  direction: "IN" | "OUT";

  // Client reference only
  currentStock: number;
  currentAverageCost: number;

  // Raw user input
  inputQuantity: number;
  inputPrice: number;

  // Selected purchase unit
  purchaseUnit: string;
  conversionFactor: number;

  paymentMethod?: PaymentMethodType;
  paymentStatus: PaymentStatus;

  note?: string;
  createdBy?: string;

  referenceId?: string;
  referenceType?: "MANUAL";
};

export async function adjustInventoryStockNew({
  inventoryItemId,
  type,
  direction,
  currentStock,
  currentAverageCost,
  inputQuantity,
  inputPrice,
  purchaseUnit,
  conversionFactor,
  paymentMethod,
  paymentStatus,
  note,
  createdBy,
  referenceId,
  referenceType = "MANUAL",
}: AdjustInventoryStockType) {
  try {
    console.log("========== INVENTORY ADJUSTMENT DEBUG ==========");
    console.log("Inventory Item ID:", inventoryItemId);
    console.log("Type:", type);
    console.log("Direction:", direction);
    console.log("Current Stock (client reference):", currentStock);
    console.log("Current Average Cost (client reference):", currentAverageCost);
    console.log("Input Quantity:", inputQuantity);
    console.log("Input Price:", inputPrice);
    console.log("Purchase Unit:", purchaseUnit);
    console.log("Conversion Factor:", conversionFactor);
    console.log("Payment Method:", paymentMethod);
    console.log("Payment Status:", paymentStatus);
    console.log("Note:", note);
    console.log("Created By:", createdBy);
    console.log("Reference ID:", referenceId);
    console.log("Reference Type:", referenceType);
    console.log("================================================");

    // 1. VALIDATION
    if (!inventoryItemId) {
      throw new Error("Inventory item is required");
    }

    if (!Number.isFinite(inputQuantity) || inputQuantity < 0) {
      throw new Error("Invalid quantity");
    }

    if (!Number.isFinite(conversionFactor) || conversionFactor <= 0) {
      throw new Error("Invalid conversion factor");
    }

    // 2. INVENTORY REFERENCE
    const inventoryRef = adminDb
      .collection("inventoryItems")
      .doc(inventoryItemId);

    const now = admin.firestore.Timestamp.now();

    // 3. FIRESTORE TRANSACTION
    const result = await adminDb.runTransaction(async (tx) => {

      // READ INVENTORY BEFORE ANY WRITES
      const inventorySnap = await tx.get(inventoryRef);

      if (!inventorySnap.exists) {
        throw new Error("Inventory item not found");
      }

      const inventoryData = inventorySnap.data()!;

      const serverCurrentStock = Number(
        inventoryData.currentStock ?? 0
      );

      const serverCurrentAverageCost = Number(
        inventoryData.averageCost ?? 0
      );

      // 4. COMMON HANDLER INPUT
      const commonInput = {
        tx,
        inventoryRef,
        inventoryData,
        inputQuantity,
        inputPrice,
        purchaseUnit,
        conversionFactor,
        currentStock: serverCurrentStock,
        currentAverageCost: serverCurrentAverageCost,
        now,
      };

      // 5. EXECUTE STOCK HANDLER
      let stockResult;

      if (type === "OPENING_STOCK") {
        stockResult = await handleOpeningStock(commonInput);

      } else if (type === "ADJUSTMENT" && direction === "IN") {
        stockResult = await handleAdjustmentIn(commonInput);

      } else if (type === "ADJUSTMENT" && direction === "OUT") {
        stockResult = await handleAdjustmentOut(commonInput);

      } else if (type === "WASTAGE") {
        stockResult = await handleWastage(commonInput);

      } else if (type === "CLEAR") {
        stockResult = await handleClearStock(commonInput);

      } else {
        throw new Error("Unsupported inventory transaction type");
      }

      // 6. CALCULATE BEFORE / AFTER STOCK
      const beforeStock = serverCurrentStock;

      const afterStock = Number(stockResult.quantity);

      const transactionQuantity =
        type === "CLEAR"
          ? beforeStock
          : inputQuantity * conversionFactor;

      // 7. TRANSACTION UNIT COST
      // Assumes averageCost is per consumption/stock unit.
      const transactionUnitCost =
        type === "OPENING_STOCK"
          ? inputPrice / conversionFactor
          : serverCurrentAverageCost;

      // 8. TRANSACTION VALUE
      // CLEAR records the stock value being removed.
      // For other transactions this retains your existing handler result.
      const ledgerAmount =
        type === "CLEAR"
          ? Number(inventoryData.stockValue ?? 0)
          : Number(stockResult.totalAmount ?? 0);

      // 9. SAVE LEDGER RECORD
      // This function only creates a ledger document.
      // It does not read or update the inventory master.
      const ledgerResult = await inventoryAdjust(tx, {
        inventoryItemId,

        inventoryItemName: inventoryData.name || "",
        consumptionUnit: inventoryData.consumptionUnit || "gm",

        type,
        direction,

        quantity: transactionQuantity,
        stockValue: Number(inventoryData.stockValue ?? 0),
        averageCost: serverCurrentAverageCost,

        purchaseUnit,
        purchaseUnitCost: Number(
          stockResult.purchaseUnitCost ?? serverCurrentAverageCost
        ),

        conversionFactor,

        totalAmount: ledgerAmount,

        paidAmount: 0,
        dueAmount: 0,
        paymentStatus,
        paymentMethod: paymentMethod ?? null,

        beforeStock,
        afterStock,
        transactionQuantity,
        transactionUnitCost,

        referenceType,
        referenceId: referenceId || "",

        note: note || "",
        createdBy: createdBy || "system",

        source: "WEB_ADMIN",
      });

      // 10. RETURN RESULT
      return {
        ...stockResult,
        transactionId: ledgerResult.transactionId,
      };
    });

    // 11. REVALIDATE
    revalidateTag("inventory-items", "max");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/inventory/dashboard");

    return {
      success: true,
      data: result,
    };

  } catch (error) {
    console.error("INVENTORY ADJUSTMENT ERROR:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to adjust inventory",
    };
  }
}
