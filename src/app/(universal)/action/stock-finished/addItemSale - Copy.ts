"use server";


import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";
import { updateCustomerAccount } from "./inventorySupplier/updateCustomerAccount";
import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { applyFinishedTransactions } from "./finishedStockLedger/applyFinishedTransactions";
import { applyCustomerTransaction } from "./customer/applyCustomerTransaction";
import { PaymentStatus } from "@/lib/types/PaymentStatus";

type PaymentMethod = "CASH" | "UPI" | "CARD";

type AdjustSaleStock = {
  id: string;

  wholeSaleCutomerId?: string;
  wholeSaleCutomerName?: string;

  type: "SALE" | "ADJUSTMENT" | "OPENING";
  direction: "IN" | "OUT";

  quantity: number;
  transactionUnit: InventoryUnit;

  unitPrice: number;

  // ✅ ADD THESE
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  dueAmount?: number;
  paidAmount?: number;

  note?: string;
  createdBy?: string;

  referenceId?: string;
  referenceType?: "MANUAL" | "SALE";
};



export async function addItemSale({
  id,
  wholeSaleCutomerId,
  wholeSaleCutomerName,
  type,
  direction,
  quantity,
  unitPrice,
  transactionUnit,
  paymentMethod,
   paidAmount,
   dueAmount,
  note,
  createdBy,
  referenceId,
  referenceType = "MANUAL",
}: AdjustSaleStock) {

console.log("pay method------------", paymentMethod, )
  try {
    // =====================================================
    // VALIDATION
    // =====================================================

    if (!id) {
      return { success: false, message: "Product ID required" };
    }

    if (!quantity || quantity <= 0) {
      return { success: false, message: "Invalid quantity" };
    }

    
    // =====================================================
    // FIRESTORE TRANSACTION (IMPORTANT)
    // UPDATE FINISHED PRODUCT
    // =====================================================

    const totalAmount = quantity * unitPrice;

    const paidAmount = paymentMethod ? totalAmount : 0;

    const dueAmount = totalAmount - paidAmount;

    const paymentStatus =
      paidAmount >= totalAmount ? "PAID" : "CREDIT";

await adminDb.runTransaction(async (tx) => {
  
  await applyFinishedTransactions(tx, {
    productId: id,
    type: "SALE",
    direction: "OUT",

    quantity,
    transactionUnit,

    unitPrice,
    totalAmount,

    paidAmount,
    dueAmount,
    paymentStatus,
    paymentMethod,

    referenceId,
    referenceType,

    note,
    createdBy: createdBy || "admin",
    source: "ADMIN",
  });

 // ==========================================
  // CUSTOMER ACCOUNT + CUSTOMER LEDGER
  // ==========================================

  if (type === "SALE" && wholeSaleCutomerId) {
    await updateCustomerAccount(tx, {
      wholeSaleCutomerId,
      type: "SALE",
      totalAmount,
      paidAmount,
      dueAmount,
      paymentMethod,
    });

    await applyCustomerTransaction(tx, {
      customerId: wholeSaleCutomerId,
      customerName: wholeSaleCutomerName,

      type: "SALE",

      totalAmount,
      paidAmount,
      dueAmount,

      paymentMethod,

      referenceType,
      referenceId,

      note,
      createdBy: createdBy || "admin",
      source: "ADMIN",
    });
  }
});



    // =====================================================
    // CACHE
    // =====================================================
    revalidateTag("products", "max");

    // revalidateTag("inventory-items", "max");
    // revalidatePath("/admin/inventory");
    // revalidatePath("/admin/inventory/dashboard");

    revalidatePath("/admin/stock-finished");

    return {
      success: true,
      message: "Stock updated successfully",
    };

  } catch (error) {
    console.error("❌ addItemSale failed:", error);

    return {
      success: false,
      message: "Failed to update stock",
    };
  }
}