"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";
import { InventoryTransactionNameType } from "@/lib/types/InventoryTransactionType";
import { PaymentStatus } from "@/lib/types/PaymentStatus";

type PaymentMethod = "CASH" | "UPI" | "CARD";


type AdjustInventoryStockType = {
  inventoryItemId: string;
  supplierId?: string;
  transactionType: InventoryTransactionNameType;

  direction: "IN" | "OUT";

  quantity: number;
  unitCost: number;

  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paidAmount?: number;

  note?: string;
  createdBy?: string;

  referenceId?: string;

  referenceType?: "PURCHASE" | "MANUAL";
};

export async function adjustInventoryStock({
  inventoryItemId,
  supplierId,
  transactionType,
  direction,
  quantity,
  unitCost,
  paymentStatus,
  paymentMethod,
  paidAmount: paidAmountInput,
  note,
  createdBy,
  referenceId,
  referenceType = "MANUAL",
}: AdjustInventoryStockType) {
  try {
    // =========================
    // BASIC VALIDATION
    // =========================

    if (!inventoryItemId) {
      return { success: false, message: "Inventory item required" };
    }

    if (!quantity || quantity <= 0) {
      return { success: false, message: "Quantity must be greater than 0" };
    }

    if (transactionType === "PURCHASE" && !supplierId) {
      return {
        success: false,
        message: "Supplier required for purchase",
      };
    }

    const inventoryRef = adminDb
      .collection("inventoryItems")
      .doc(inventoryItemId);

    // =========================
    // FIRESTORE TRANSACTION
    // =========================

    await adminDb.runTransaction(async (tx) => {
      const inventorySnap = await tx.get(inventoryRef);

      if (!inventorySnap.exists) {
        throw new Error("Inventory item not found");
      }

      const inventoryData = inventorySnap.data();

      const previousStock = Number(inventoryData?.currentStock) || 0;

      // =========================
      // COST CALCULATION
      // =========================

      const finalUnitCost =
        unitCost !== undefined && unitCost > 0
          ? unitCost
          : Number(inventoryData?.costPrice) || 0;

      const shouldApplyCost =
        transactionType === "PURCHASE" ||
        transactionType === "OPENING_STOCK" ||
        transactionType === "CUSTOMER_RETURN";

      const totalAmount = shouldApplyCost
        ? quantity * finalUnitCost
        : 0;

      // =========================
      // PAYMENT CALCULATION (UI ONLY)
      // =========================

      const isPurchase =
        transactionType === "PURCHASE" &&
        direction === "IN";

      const paymentStatusSafe = paymentStatus || "PAID";

      const paidAmountRaw =
        isPurchase && paymentStatusSafe === "PAID"
          ? totalAmount
          : Number(paidAmountInput || 0);

      const paidAmount = Math.min(paidAmountRaw, totalAmount);

      const dueAmount = isPurchase
        ? Math.max(0, totalAmount - paidAmount)
        : 0;

      // =========================
      // STOCK CALCULATION
      // =========================

      let afterStock = previousStock;

      if (direction === "IN") {
        afterStock = previousStock + quantity;
      } else {
        afterStock = previousStock - quantity;

        if (afterStock < 0) {
          throw new Error("Insufficient stock");
        }
      }

      // =========================
      // UPDATE INVENTORY
      // =========================

      tx.update(inventoryRef, {
        currentStock: afterStock,
        ...(transactionType === "PURCHASE" && {
          costPrice: finalUnitCost,
        }),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // =========================
      // INVENTORY TRANSACTION
      // =========================

      const invRef = adminDb.collection("inventoryTransactions").doc();

      const finalReferenceId = referenceId || invRef.id;

      tx.set(invRef, {
        inventoryItemId,
        supplierId: supplierId || "",
        inventoryItemName: inventoryData?.name || "",

        transactionType,
        direction,
        quantity,

        beforeStock: previousStock,
        afterStock,

        unit: inventoryData?.consumptionUnit || "pcs",

        unitCost: finalUnitCost,
        totalAmount,

        paymentStatus: paymentStatusSafe,
        paymentMethod: paymentMethod || null,
        paidAmount,
        dueAmount,

        referenceType,
        referenceId: finalReferenceId,

        note: note || "Manual inventory adjustment",
        createdBy: createdBy || "admin",

        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // =========================
      // LEDGER (DOUBLE ENTRY)
      // =========================

      if (
        transactionType === "PURCHASE" &&
        supplierId &&
        totalAmount > 0
      ) {
        const ledgerRef = adminDb.collection("ledgerEntries");

        // INVENTORY (ASSET ↑)
        tx.set(ledgerRef.doc(), {
          account: "INVENTORY",
          type: "DEBIT",
          amount: totalAmount,
          supplierId,
          referenceType: "PURCHASE",
          referenceId: finalReferenceId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // SUPPLIER PAYABLE (LIABILITY ↑)
        tx.set(ledgerRef.doc(), {
          account: "SUPPLIER_PAYABLE",
          type: "CREDIT",
          amount: totalAmount,
          supplierId,
          referenceType: "PURCHASE",
          referenceId: finalReferenceId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    });

    // =========================
    // CACHE REFRESH
    // =========================

    revalidateTag("inventory-items", "max");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/inventory/dashboard");

    return {
      success: true,
      message: "Inventory updated successfully",
    };
  } catch (error) {
    console.error("❌ adjustInventoryStock failed:", error);

    return {
      success: false,
      message: error instanceof Error
        ? error.message
        : "Failed to update inventory",
    };
  }
}