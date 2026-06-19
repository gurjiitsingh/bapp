"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";
import { updateCustomerAccount } from "./inventorySupplier/updateCustomerAccount";
import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { applyInventoryMovement } from "../inventory/applyInventoryMovement";
import { applyFinishedMovement } from "./finishedStockLedger/applyFinishedMovement";

type PaymentMethod = "CASH" | "UPI" | "CARD";

type CustomerReturnStock = {
  id: string;

  wholeSaleCutomerId?: string;
  wholeSaleCutomerName?: string;

  type: "RETURN";
  direction: "IN" | "OUT";

  quantity: number;
  transactionUnit: InventoryUnit;

  unitPrice: number;

  paymentMethod?: PaymentMethod;

  note?: string;
  createdBy?: string;

  referenceId?: string;
  referenceType?: "MANUAL" | "SALE";
};

export async function customerReturn({
  id,
  wholeSaleCutomerId,
  wholeSaleCutomerName,
  type = "RETURN",
  direction = "IN",
  quantity,
  unitPrice,
  transactionUnit,
  paymentMethod,
  note,
  createdBy,
  referenceId,
  referenceType = "MANUAL",
}: CustomerReturnStock) {

  console.log("unitPrice---------------", unitPrice)
  try {
    if (!id) {
      return { success: false, message: "Product ID required" };
    }

    if (!quantity || quantity <= 0) {
      return { success: false, message: "Invalid quantity" };
    }

    // =========================
    // GET PRODUCT
    // =========================
    const productRef = adminDb.collection("products").doc(id);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      return { success: false, message: "Product not found" };
    }

    const productData = productSnap.data();
    const currentStock = productData?.currentStock || 0;

    // =========================
    // STOCK UPDATE (RETURN = INCREASE)
    // =========================
    const newStock = currentStock + quantity;

    // =========================
    // FINISHED STOCK MOVEMENT
    // =========================
    const totalAmount = quantity * unitPrice;
    

    const movement = await applyFinishedMovement({
      productId: id,
      type: "RETURN",
      direction: "IN",

      quantity,
      transactionUnit,

      unitPrice,
      totalAmount,

      paidAmount: paymentMethod ? totalAmount : 0,
      dueAmount: paymentMethod ? 0 : totalAmount,
      paymentStatus: paymentMethod ? "PAID" : "CREDIT",
      paymentMethod,

      referenceId,
      referenceType,

      note,
      createdBy: createdBy || "admin",
      source: "ADMIN",
    });

    // =========================
    // REVERSE RAW MATERIAL CONSUMPTION
    // =========================
    const recipeSnapshot = await adminDb
      .collection("productRecipes")
      .where("productId", "==", id)
      .get();

    if (!recipeSnapshot.empty) {
      for (const recipeDoc of recipeSnapshot.docs) {
        const recipe = recipeDoc.data();

        await applyInventoryMovement({
          inventoryItemId: recipe.inventoryItemId,

          type: "RETURN",
          direction: "IN",

          quantity: (Number(recipe.quantity) || 0) * quantity,

          note: `Customer return reversal (${productData?.name})`,

          referenceId: "movement.transactionId" ,
          referenceType: "RETURN",

          createdBy: createdBy || "admin",
          source: "ADMIN",
        });
      }
    }

    // =========================
    // CUSTOMER ACCOUNT REVERSAL
    // =========================
    if (wholeSaleCutomerId) {
      const totalAmount = quantity * unitPrice;

      await updateCustomerAccount({
        wholeSaleCutomerId,
        type: "RETURN",
        totalAmount,
        paidAmount: paymentMethod ? totalAmount : 0,
        dueAmount: paymentMethod ? 0 : totalAmount,
        paymentMethod,
      });
    }

    // =========================
    // CACHE REFRESH
    // =========================
    revalidateTag("products","max");
    revalidatePath("/admin/stock-finished");

    return {
      success: true,
      message: "Customer return processed successfully",
    };
  } catch (error) {
    console.error("❌ customerReturn failed:", error);

    return {
      success: false,
      message: "Failed to process customer return",
    };
  }
}