"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import {
  revalidatePath,
  revalidateTag,
} from "next/cache";

 
import { InventoryUnit } from "@/lib/types/InventoryItemType";
 
import { PaymentStatus } from "@/lib/types/PaymentStatus";
 
import { updateCustomerAccount } from "../stock-finished/inventorySupplier/updateCustomerAccount";
import { applyCustomerTransaction } from "../stock-finished/customer/applyCustomerTransaction";
import { ProductStockType } from "@/lib/types/productStockType";
import { applyFinishedTransactions } from "./sale/applyFinishedTransactions";

type PaymentMethod =
  | "CASH"
  | "UPI"
  | "CARD";

type AdjustSaleStock = {
  tx: FirebaseFirestore.Transaction;
finishedProduct: ProductStockType;

  id: string;

  wholeSaleCutomerId?: string;
  wholeSaleCutomerName?: string;

  // Already read by caller
  currentBalance?: number;
  currentCreditBalance?: number;

  type:
    | "SALE"
    | "ADJUSTMENT"
    | "OPENING";

  direction: "IN" | "OUT";

  quantity: number;

  transactionUnit: InventoryUnit;

  unitPrice: number;

  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;

  paidAmount?: number;
  dueAmount?: number;

  note?: string;
  createdBy?: string;

  referenceId?: string;
  referenceType?: "MANUAL" | "SALE";
};

export async function addItemSaleTruck({
  tx,
finishedProduct,
  id,

  wholeSaleCutomerId,
  wholeSaleCutomerName,

  currentBalance = 0,
  currentCreditBalance = 0,

  type,
  direction,

  quantity,
  unitPrice,
  transactionUnit,

  paymentStatus,
  paymentMethod,

  paidAmount = 0,
  dueAmount = 0,

  note,
  createdBy,

  referenceId,
  referenceType = "MANUAL",
}: AdjustSaleStock) {
  try {
    // ==========================================
    // VALIDATION
    // ==========================================

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

    const totalAmount =
      quantity * unitPrice;

    // Safety checks

    if (paidAmount < 0) {
      paidAmount = 0;
    }

    if (paidAmount > totalAmount) {
      paidAmount = totalAmount;
    }

    dueAmount =
      Math.max(
        totalAmount - paidAmount,
        0
      );

    if (!paymentStatus) {
      if (paidAmount >= totalAmount) {
        paymentStatus = "PAID";
      } else if (paidAmount > 0) {
        paymentStatus = "PARTIAL";
      } else {
        paymentStatus = "CREDIT";
      }
    }

    // ============================
// READ CUSTOMER ACCOUNT FIRST
// ============================

let nextCurrentBalance = currentBalance;
let nextCurrentCreditBalance = currentCreditBalance;

// let currentBalance1 = 0;
// let currentCreditBalance1 = 0;

// if (type === "SALE" && wholeSaleCutomerId) {
//   const accountRef = adminDb
//     .collection("customerAccounts")
//     .doc(wholeSaleCutomerId);

//   const accountSnap = await tx.get(accountRef);

//   const data = accountSnap.data() || {};

//   currentBalance1 = Number(data.balance || 0);
//   currentCreditBalance1 = Number(
//     data.creditBalance || 0
//   );
// }
// console.log("in old-------------------", currentBalance1, currentBalance1)
// ==========================================
// FINISHED PRODUCT LEDGER
// ==========================================

await applyFinishedTransactions(tx, {
  productId: id,
finishedProduct,
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

  source: createdBy || "ADMIN",
});

// ==========================================
// CUSTOMER ACCOUNT
// ==========================================

if (type === "SALE" && wholeSaleCutomerId) {
  await updateCustomerAccount(tx, {
    wholeSaleCutomerId,
    wholeSaleCutomerName,

    type: "SALE",

    totalAmount,
    paidAmount,
    dueAmount,

    currentCreditBalance,
    currentBalance,

    paymentMethod,
  });

  await applyCustomerTransaction(tx, {
    customerId: wholeSaleCutomerId,

    customerName: wholeSaleCutomerName,

    type: "SALE",

    totalAmount,
    returnProductAmount: 0,

    paidAmount,
    dueAmount,

    currentBalance,
    creditAmount: 0,
    currentCreditBalance,

    paymentMethod,

    referenceId,
    referenceType,

    note,

    createdBy: createdBy || "admin",

    source: "ADMIN",
  });

   nextCurrentBalance =
    currentBalance + totalAmount - paidAmount;

  nextCurrentCreditBalance =
    currentCreditBalance + dueAmount;
}

    // revalidateTag("products", "max");
    // revalidatePath(
    //   "/admin/stock-finished"
    // );

   return {
  success: true,
  message: "Stock updated successfully",

  currentBalance: nextCurrentBalance,
  currentCreditBalance: nextCurrentCreditBalance,
};
  } catch (error) {
    console.error(
      "❌ addItemSale failed:",
      error
    );

    return {
      success: false,
      message:
        "Failed to update stock",
    };
  }
}