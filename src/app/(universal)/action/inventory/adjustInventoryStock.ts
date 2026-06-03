"use server";

import admin from "firebase-admin";

import { adminDb } from "@/lib/firebaseAdmin";

import { revalidatePath, revalidateTag } from "next/cache";
import { InventoryTransactionNameType } from "@/lib/types/InventoryTransactionType";
import { updateSupplierAccount } from "../inventorySupplier/updateSupplierAccount";

type PaymentMethod = "CASH" | "UPI" | "CARD";
type PaymentStatus = "PAID" | "CREDIT";
type AdjustInventoryStockType = {
  inventoryItemId: string;

  supplierId?: string;

  transactionType: InventoryTransactionNameType;


  stockDirection:
  | "IN"
  | "OUT";

  quantity: number;
  unitCost: number;
   paymentStatus: PaymentStatus; 
  paymentMethod?: PaymentMethod;
  paidAmount?: number;          
  note?: string;

  createdBy?: string;

  referenceId?: string;

  referenceType?:
  | "PURCHASE"
  | "MANUAL";
};

export async function adjustInventoryStock({
  inventoryItemId,
  supplierId,
  transactionType,
  stockDirection,
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
    // =====================================================
    // VALIDATION
    // =====================================================

    if (!inventoryItemId) {
      return { success: false, message: "Inventory item required" };
    }

    if (!quantity || quantity <= 0) {
      return { success: false, message: "Quantity must be greater than 0" };
    }

    // =====================================================
    // GET INVENTORY
    // =====================================================

    const inventoryRef = adminDb
      .collection("inventoryItems")
      .doc(inventoryItemId);

    const inventorySnap = await inventoryRef.get();

    if (!inventorySnap.exists) {
      return { success: false, message: "Inventory item not found" };
    }

    const inventoryData = inventorySnap.data();

    const previousStock = Number(inventoryData?.currentStock) || 0;

    // =====================================================
    // STOCK CALCULATION
    // =====================================================

    let afterStock = previousStock;

    if (stockDirection === "IN") {
      afterStock = previousStock + quantity;
    } else {
      afterStock = previousStock - quantity;

      // 🚨 Prevent negative stock (optional but recommended)
      if (afterStock < 0) {
        return {
          success: false,
          message: "Insufficient stock",
        };
      }
    }

    // =====================================================
    // COST CALCULATION
    // =====================================================

  const finalUnitCost =
  unitCost !== undefined
    ? unitCost
    : Number(inventoryData?.costPrice) || 0;



    const shouldApplyCost =
      transactionType === "PURCHASE" ||
      transactionType === "OPENING_STOCK" ||
      transactionType === "CUSTOMER_RETURN";

    const totalCost = shouldApplyCost
      ? quantity * finalUnitCost
      : 0;

    // const totalCost = quantity * finalUnitCost;

    // =====================================================
// PAYMENT CALCULATION
// =====================================================

const isPurchase =
  transactionType === "PURCHASE" &&
  stockDirection === "IN";
const paymentStatusSafe = paymentStatus || "PAID";
const paidAmountRaw =
  isPurchase && paymentStatusSafe === "PAID"
    ? totalCost
    : Number(paidAmountInput || 0);

const paidAmount = Math.min(paidAmountRaw, totalCost);

const dueAmount = isPurchase
  ? Math.max(0, totalCost - paidAmount)
  : 0;

    // =====================================================
    // UPDATE INVENTORY
    // =====================================================

        if (transactionType === "PURCHASE" && !supplierId) {
  return {
    success: false,
    message: "Supplier required for purchase",
  };
}

    await inventoryRef.update({
      currentStock: afterStock,

      // optional: update last cost price on purchase
      ...(transactionType === "PURCHASE" && {
        costPrice: finalUnitCost,
      }),

      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // =====================================================
    // CREATE TRANSACTION
    // =====================================================



   await adminDb
  .collection("inventoryTransactions")
  .add({
    inventoryItemId,
    supplierId: supplierId || "",
    inventoryItemName: inventoryData?.name || "",

    transactionType,
    stockDirection,
    quantity,

    beforeStock: previousStock,
    afterStock,

unit: inventoryData?.consumptionUnit || "pcs",

    unitCost: finalUnitCost,
    totalCost: totalCost,

    // ✅ NEW PAYMENT FIELDS
  paymentStatus: paymentStatusSafe,
    paymentMethod: paymentMethod || null,
    paidAmount: paidAmount,
    dueAmount: dueAmount,

    referenceType,
    referenceId: referenceId || "",

    note: note || "Manual inventory adjustment",

    createdBy: createdBy || "admin",

    createdAt:
      admin.firestore.FieldValue.serverTimestamp(),
  });

    // =====================================================
    // REVALIDATE
    // =====================================================



  if (supplierId && isPurchase) {
 await updateSupplierAccount({
  supplierId,
  transactionType,
  totalCost,
  paidAmount,
  dueAmount,
   paymentMethod, // ✅ ADD THIS
});
}




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
      message: "Failed to update inventory",
    };
  }
}
