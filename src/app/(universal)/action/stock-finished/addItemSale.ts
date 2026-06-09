"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";
import { updateCustomerAccount } from "./inventorySupplier/updateCustomerAccount";
import { InventoryUnit } from "@/lib/types/InventoryItemType";

type PaymentMethod = "CASH" | "UPI" | "CARD";

type AdjustSaleStock = {
  id: string;

  wholeSaleCutomerId?: string;
  wholeSaleCutomerName?: string;

  transactionType: "SALE" | "ADJUSTMENT" | "OPENING";
  stockDirection: "IN" | "OUT";

  quantity: number;
  transactionUnit: InventoryUnit;

  price: number;

  // ✅ ADD THESE
  paymentStatus?: "PAID" | "CREDIT";
  paymentMethod?: PaymentMethod;
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
  transactionType,
  stockDirection,
  quantity,
  price,
  transactionUnit,
  paymentMethod,
  note,
  createdBy,
  referenceId,
  referenceType = "MANUAL",
}: AdjustSaleStock) {
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
    // GET PRODUCT
    // =====================================================

    const productRef = adminDb.collection("products").doc(id);

    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      return { success: false, message: "Product not found" };
    }

    const productData = productSnap.data();

    const currentStock = productData?.currentStock || 0;

    // =====================================================
    // CALCULATE NEW STOCK
    // =====================================================

    let newStock = currentStock;

    if (stockDirection === "OUT") {
      newStock = currentStock - quantity;
    } else {
      newStock = currentStock + quantity;
    }

    // OPTIONAL: prevent negative stock
    if (newStock < 0 && !productData?.allowNegativeStock) {
      return {
        success: false,
        message: "Insufficient stock",
      };
    }

    // =====================================================
    // FIRESTORE TRANSACTION (IMPORTANT)
    // =====================================================

   await adminDb.runTransaction(async (t) => {
  // ✅ ALWAYS re-read inside transaction (VERY IMPORTANT)
  const freshSnap = await t.get(productRef);

  if (!freshSnap.exists) {
    throw new Error("Product not found inside transaction");
  }

  const freshData = freshSnap.data();
  const freshStock = freshData?.currentStock || 0;

  let newStock = freshStock;

  if (stockDirection === "OUT") {
    newStock = freshStock - quantity;
  } else {
    newStock = freshStock + quantity;
  }

  // prevent negative stock
  if (newStock < 0 && !freshData?.allowNegativeStock) {
    throw new Error("Insufficient stock");
  }

  // ✅ UPDATE PRODUCT STOCK (FINAL)
  t.update(productRef, {
    currentStock: newStock,
    stockStatus: newStock > 0 ? "in_stock" : "out_of_stock",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // ✅ CREATE TRANSACTION LOG
  const transactionRef = adminDb
    .collection("finishedStockTransactions")
    .doc();

  t.set(transactionRef, {
  productId: id,

  transactionType,
  stockDirection,

  quantity,
  transactionUnit, // ✅ ADD THIS

  price,

  previousStock: freshStock,
  newStock,

  totalAmount: quantity * price,

  // ✅ PAYMENT
  paymentStatus: paymentMethod ? "PAID" : "CREDIT",
  paymentMethod: paymentMethod || null,
  paidAmount: paymentMethod ? quantity * price : 0,
  dueAmount: paymentMethod ? 0 : quantity * price,

  // ✅ CUSTOMER
  customerId: wholeSaleCutomerId || null,
  customerName: wholeSaleCutomerName || null,

  referenceType,
  referenceId: referenceId || "",

  note: note || "Stock update",
  createdBy: createdBy || "admin",

  createdAt: admin.firestore.FieldValue.serverTimestamp(),
});
});

    // =====================================================
    // CUSTOMER ACCOUNT (ONLY FOR SALE)
    // =====================================================

    if (transactionType === "SALE" && wholeSaleCutomerId) {
   const totalAmount = quantity * price;

const paid = paymentMethod ? totalAmount : 0;
const due = totalAmount - paid;

await updateCustomerAccount({
  wholeSaleCutomerId,
  transactionType,
  totalAmount,
  paidAmount: paid,
  dueAmount: due,
  paymentMethod,
});
    }

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