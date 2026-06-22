"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";
import { updateCustomerAccount } from "./inventorySupplier/updateCustomerAccount";
import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { applyInventoryMovement } from "../inventory/applyInventoryMovement";
import { applyFinishedMovement } from "./finishedStockLedger/applyFinishedMovement";

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
  paymentStatus?: "PAID" | "CREDIT";
  paymentMethod?: PaymentMethod;
  paidAmount?: number;

  note?: string;
  createdBy?: string;

  referenceId?: string;
  referenceType?: "MANUAL" | "SALE";
};



export async function addItemSale ({
  id,
  wholeSaleCutomerId,
  wholeSaleCutomerName,
  type,
  direction,
  quantity,
  unitPrice,
  transactionUnit,
  paymentMethod,
  note,
  createdBy,
  referenceId,
  referenceType = "MANUAL",
}: AdjustSaleStock) {

  console.log("unitunitPrice main---------------", unitPrice)
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

    if (direction === "OUT") {
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
// =====================================================
// UPDATE FINISHED PRODUCT
// =====================================================

const totalAmount = quantity * unitPrice;

const paidAmount = paymentMethod ? totalAmount : 0;

const dueAmount = totalAmount - paidAmount;

const paymentStatus =
    paidAmount >= totalAmount ? "PAID" : "CREDIT";

const movement = await applyFinishedMovement({
  productId: id,

  type,
  direction,

  quantity,

 transactionUnit,

  unitPrice,

   totalAmount,
    paidAmount,
    dueAmount,
    paymentStatus,
    paymentMethod,

  

  //wholeSaleCutomerId,
  //wholeSaleCutomerName,

  referenceId,
  referenceType,

  note,

  createdBy: createdBy || "admin",

  source: "ADMIN",
});


const recipeSnapshot = await adminDb
  .collection("productRecipes")
  .where("productId", "==", id)
  .get();

if (!recipeSnapshot.empty) {
  for (const recipeDoc of recipeSnapshot.docs) {
    const recipe = recipeDoc.data();

    await applyInventoryMovement({
      inventoryItemId: recipe.inventoryItemId,

      type: "CONSUMPTION",
      direction: "OUT",

      quantity:
        (Number(recipe.quantity) || 0) * quantity,

      note: `Wholesale sale (${productData?.name})`,

      referenceId: "movement.transactionId",
      referenceType: "SALE",

      createdBy: createdBy || "admin",

      source: "ADMIN",
    });
  }
}

    if (type === "SALE" && wholeSaleCutomerId) {
   const totalAmount = quantity * unitPrice;

const paid = paymentMethod ? totalAmount : 0;
const due = totalAmount - paid;

await updateCustomerAccount({
  wholeSaleCutomerId,
  type,
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