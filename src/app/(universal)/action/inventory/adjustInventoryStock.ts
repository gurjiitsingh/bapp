"use server";

import admin from "firebase-admin";

import { adminDb } from "@/lib/firebaseAdmin";

import { revalidatePath, revalidateTag } from "next/cache";
import { InventoryTransactionNameType } from "@/lib/types/InventoryTransactionType";
import { updateSupplierAccount } from "../inventorySupplier/updateSupplierAccount";
import { PaymentStatus } from "@/lib/types/PaymentStatus";

type PaymentMethod = "CASH" | "UPI" | "CARD";

type AdjustInventoryStockType = {
  inventoryItemId: string;

  supplierId?: string;

  transactionType: InventoryTransactionNameType;

  stockDirection: "IN" | "OUT";

  // =====================================
  // INTERNAL STOCK VALUES (consumption)
  // =====================================
  quantity: number;
  unitCost: number;

  // =====================================
  // ORIGINAL USER INPUT VALUES
  // =====================================
  purchaseQuantity?: number;
  purchaseUnit?: string;
  purchaseUnitCost?: number;
  conversionFactor?: number;

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
  stockDirection,

  quantity,
  unitCost,

  // ✅ ADD THESE
  purchaseQuantity,
  purchaseUnit,
  purchaseUnitCost,
  conversionFactor,

  paymentStatus,
  paymentMethod,
  paidAmount: paidAmountInput,

  note,
  createdBy,
  referenceId,
  referenceType = "MANUAL",
}: AdjustInventoryStockType) {

  console.log("paymentMethod-----------", paymentMethod)
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

    const totalAmount = shouldApplyCost
      ? quantity * finalUnitCost
      : 0;

    // const totalAmount = quantity * finalUnitCost;

    // =====================================================
// PAYMENT CALCULATION
// =====================================================

const isPurchase =
  transactionType === "PURCHASE" &&
  stockDirection === "IN";
const paymentStatusSafe = paymentStatus || "PAID";
const paidAmountRaw =
  isPurchase && paymentStatusSafe === "PAID"
    ? totalAmount
    : Number(paidAmountInput || 0);

if (paidAmountRaw > totalAmount) {
  return {
    success: false,
    message: "Paid amount cannot exceed total amount",
  };
}

const paidAmount = paidAmountRaw;

const dueAmount = isPurchase
  ? Math.max(0, totalAmount - paidAmount)
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


// =====================================================
// AVERAGE COST CALCULATION
// =====================================================

const oldCostPrice =
  Number(inventoryData?.costPrice) || 0;

let updatedCostPrice =
  oldCostPrice;

// Only recalculate average cost for stock IN
if (
  stockDirection === "IN" &&
  (
    transactionType === "PURCHASE" ||
    transactionType === "OPENING" ||
    transactionType === "CUSTOMER_RETURN"
  )
) {
  const oldStockValue =
    previousStock * oldCostPrice;

  const newStockValue =
    quantity * finalUnitCost;

  const totalStock =
    previousStock + quantity;

  if (totalStock > 0) {
    updatedCostPrice =
      (
        oldStockValue +
        newStockValue
      ) / totalStock;
  }
}


await inventoryRef.update({
  currentStock: afterStock,

  costPrice: updatedCostPrice,

  updatedAt:
    admin.firestore.FieldValue.serverTimestamp(),
});

   

    // =====================================================
    // CREATE TRANSACTION
    // =====================================================

  await adminDb
  .collection("inventoryTransactions")
  .add({
    inventoryItemId,

    supplierId: supplierId || "",

    inventoryItemName:
      inventoryData?.name || "",

    transactionType,

    stockDirection,

    // =====================================
    // ORIGINAL PURCHASE VALUES
    // =====================================

    purchaseQuantity:
      purchaseQuantity || quantity,

    purchaseUnit:
      purchaseUnit ||
      inventoryData?.purchaseUnit ||
      inventoryData?.consumptionUnit,

    purchaseUnitCost:
      purchaseUnitCost || unitCost,

    conversionFactor:
      conversionFactor ||
      inventoryData?.conversionFactor ||
      1,

    // =====================================
    // INTERNAL STOCK VALUES
    // =====================================

    quantity,

    unit:
      inventoryData?.consumptionUnit || "pcs",

    unitCost: finalUnitCost,

    // =====================================
    // STOCK SNAPSHOT
    // =====================================

    beforeStock: previousStock,

    afterStock,

    // =====================================
    // AMOUNTS
    // =====================================

    totalAmount,

    paidAmount,

    dueAmount,

    paymentStatus:
      paymentStatusSafe,

    paymentMethod:
      paymentMethod || null,

    // =====================================
    // REFERENCES
    // =====================================

    referenceType,

    referenceId:
      referenceId || "",

    // =====================================
    // META
    // =====================================

    note:
      note ||
      "Manual inventory adjustment",

    createdBy:
      createdBy || "admin",

    createdAt:
      admin.firestore.FieldValue.serverTimestamp(),
  });




// ================= 🔥 SUPPLIER LEDGER =================
const isSupplierFlow =
  supplierId &&
  (transactionType === "PURCHASE" ||
   transactionType === "SUPPLIER_RETURN");

if (isSupplierFlow) {

  let ledgerType: "PURCHASE" | "RETURN" = "PURCHASE";

  if (transactionType === "SUPPLIER_RETURN") {
    ledgerType = "RETURN";
  }

  await adminDb.collection("supplierLedger").add({
    supplierId,

    type: ledgerType,

    totalAmount,
    paidAmount,   // ✅ SAME as inventory
    dueAmount,    // ✅ SAME as inventory

    paymentMethod: paymentMethod || null,

    referenceType,
    referenceId: referenceId || "",

    note: note || "Inventory transaction",

    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}


    // =====================================================
    // REVALIDATE
    // =====================================================



  if (supplierId && isPurchase) {
 await updateSupplierAccount({
  supplierId,
  transactionType,
  totalAmount,
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
