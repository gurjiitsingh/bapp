"use server";
// update raw inventory and raw invenotrory transacitons
import admin from "firebase-admin";

import { adminDb } from "@/lib/firebaseAdmin";

import {
  revalidatePath,
  revalidateTag,
} from "next/cache";





import { PaymentStatus } from "@/lib/types/PaymentStatus";
import { InventoryTransactionNameType } from "@/lib/types/InventoryTransactionType";
import { applyInventoryMovement } from "./applyInventoryMovement";
import { applySupplierTransaction } from "../inventorySupplier/applySupplierTransaction";
import { updateSupplierAccount } from "../inventorySupplier/updateSupplierAccount";

type PaymentMethod =
  | "CASH"
  | "UPI"
  | "CARD";

type AdjustInventoryStockType = {
  inventoryItemId: string;

  supplierId?: string;
  supplierName?: string;
  type: InventoryTransactionNameType;

  direction:
  | "IN"
  | "OUT";

  // =====================================
  // INTERNAL STOCK VALUES (consumption)
  // =====================================

  quantity: number;
stockValue?: number;
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
  dueAmount?: number;
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
  supplierName,
  type,
  direction,
  quantity,
  unitCost,

  purchaseQuantity,
  purchaseUnit,
  purchaseUnitCost,
  conversionFactor,
  stockValue,
  paymentStatus,
  paymentMethod,
  paidAmount: paidAmountInput,
  //dueAmount,
  note,
  createdBy,
  referenceId,
  referenceType = "MANUAL",
}: AdjustInventoryStockType) {
 


  try {
    if (!inventoryItemId) {
      return { success: false, message: "Inventory item required" };
    }

   if (type !== "CLEAR" && quantity <= 0) {
  return {
    success: false,
    message: "Quantity must be greater than 0",
  };
}




    await adminDb.runTransaction(async (tx) => {

      

      // ================= GET INVENTORY =================
      const inventoryRef = adminDb
        .collection("inventoryItems")
        .doc(inventoryItemId);

      const inventorySnap = await tx.get(inventoryRef);


      // ================= CLEAR STOCK =================
      if (!inventorySnap.exists) {
  throw new Error("Inventory item not found");
}
// ================= CLEAR STOCK =================
if (type === "CLEAR") {
  tx.update(inventoryRef, {
    currentStock: 0,
    stockValue: 0,
    averageCost: 0,
    costPrice: 0,
  //  stockStatus: "out_of_stock",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return;
}

      if (!inventorySnap.exists) {
        throw new Error("Inventory item not found");
      }

      const inventoryData = inventorySnap.data();

      const previousStock =
        Number(inventoryData?.currentStock) || 0;

      const needsSupplier =
        type === "PURCHASE" ||
        type === "SUPPLIER_RETURN";

      const needsPayment =
        type === "PURCHASE";

      const needsCost =
        type === "PURCHASE" ||
        type === "SUPPLIER_RETURN";

      const needsSupplierLedger =
        type === "PURCHASE" ||
        type === "SUPPLIER_RETURN";

      // ================= SUPPLIER =================

      let currentBalance = 0;
      let currentCreditBalance = 0;
      if (needsSupplier && supplierId) {
        const supplierRef = adminDb
          .collection("supplierAccounts")
          .doc(supplierId);

        const supplierSnap = await tx.get(supplierRef);

        supplierName =
          supplierSnap.data()?.supplierName || supplierName || "";

        currentBalance =
          Number(supplierSnap.data()?.balance || 0);

        currentBalance =
          Number(
            supplierSnap.data()?.balance || 0
          );

        // Save for later
      }

      // ================= COST =================
      const averageCost =
        unitCost ?? Number(inventoryData?.costPrice) ?? 0;

      const shouldApplyCost = needsCost;


      const totalAmount =
        type === "OPENING_STOCK"
          ? Number(stockValue || 0)
          : shouldApplyCost
            ? quantity * averageCost
            : 0;
      // ================= PAYMENT =================
      const isPurchase =
        needsPayment &&
        direction === "IN";

      const paymentStatusSafe =
        paymentStatus || "PAID";

      const paidAmount =
        isPurchase && paymentStatusSafe === "PAID"
          ? totalAmount
          : Number(paidAmountInput || 0);

      const dueAmount = isPurchase
        ? Math.max(0, totalAmount - paidAmount)
        : 0;



      // ================= UPDATE INVENTORY =================


      await applyInventoryMovement(tx, {
        inventoryItemId,

        type,
        direction,

        quantity,
          totalAmount: needsCost
          ? totalAmount
          : 0,

        unitCost: averageCost,
        stockValue,
        purchaseQuantity,
        purchaseUnit,
        purchaseUnitCost,
        conversionFactor,

        supplierId: needsSupplier
          ? supplierId
          : undefined,

        supplierName: needsSupplier
          ? supplierName
          : undefined,

      

        paidAmount: needsPayment
          ? paidAmount
          : 0,

        dueAmount: needsPayment
          ? dueAmount
          : 0,

        paymentStatus: needsPayment
          ? paymentStatusSafe
          : "PAID",

        paymentMethod: needsPayment
          ? paymentMethod
          : undefined,

        referenceType,
        referenceId,

        note: note || "Manual inventory adjustment",
        createdBy: createdBy || "admin",

        source: "WEB_ADMIN",
      });
      if (needsSupplierLedger && supplierId) {
        await updateSupplierAccount(tx, {
          supplierId,
          supplierName,

          type:
            type === "PURCHASE"
              ? "PURCHASE"
              : type === "SUPPLIER_RETURN"
                ? "SUPPLIER_RETURN"
                : "PAYMENT",

          totalAmount,
          paidAmount,
          dueAmount,

          creditAmount:
            type === "SUPPLIER_RETURN"
              ? totalAmount
              : 0,

          currentBalance,
          currentCreditBalance,

          paymentMethod,
        });
      }
      if (needsSupplierLedger && supplierId) {
        await applySupplierTransaction(tx, {
          supplierId,
          supplierName,

          type:
            type === "PURCHASE"
              ? "PURCHASE"
              : type === "SUPPLIER_RETURN"
                ? "SUPPLIER_RETURN"
                : "PAYMENT",

          totalAmount,
          paidAmount,
          dueAmount,

          currentBalance,

          paymentMethod,

          referenceType,
          referenceId,

          note,
          createdBy,

          source: "WEB_ADMIN",
        });
      }
    });

    // ================= CACHE =================
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





//  console.log("ad inve---------------------", inventoryItemId,
//     supplierId,
//     supplierName,
//     type,
//     direction,
//     quantity,
//     unitCost,

//     purchaseQuantity,
//     purchaseUnit,
//     purchaseUnitCost,
//     conversionFactor,

//     paymentStatus,
//     paymentMethod,
//     paidAmountInput,

//     note,
//     createdBy,
//     referenceId,)