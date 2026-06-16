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
// =====================================================
// GET PRODUCT MODE
// =====================================================

const productMode =
  productData?.productMode;

// =====================================================
// RECIPE CHECK
// =====================================================

const recipeSnapshot =
  await adminDb
    .collection("productRecipes")
    .where(
      "productId",
      "==",
      id
    )
    .get();

// =====================================================
// STOCK MANAGED PRODUCT
// Finished goods stock
// =====================================================

if (
  productMode ===
  "finished_stock"
) {

  await adminDb.runTransaction(
    async (t) => {

      const freshSnap =
        await t.get(productRef);

      if (!freshSnap.exists) {
        throw new Error(
          "Product not found inside transaction"
        );
      }

      const freshData =
        freshSnap.data();

      const freshStock =
        Number(
          freshData?.currentStock
        ) || 0;

      let newStock =
        freshStock;

      if (
        stockDirection === "OUT"
      ) {
        newStock =
          freshStock -
          quantity;
      } else {
        newStock =
          freshStock +
          quantity;
      }

      if (
        newStock < 0 &&
        !freshData?.allowNegativeStock
      ) {
        throw new Error(
          "Insufficient stock"
        );
      }

      // UPDATE PRODUCT STOCK
      t.update(productRef, {
        currentStock: newStock,

        stockStatus:
          newStock > 0
            ? "in_stock"
            : "out_of_stock",

        updatedAt:
          admin.firestore.FieldValue.serverTimestamp(),
      });

      // LOG
      const transactionRef =
        adminDb
          .collection(
            "finishedStockTransactions"
          )
          .doc();

      t.set(transactionRef, {
        productId: id,

        transactionType,
        stockDirection,

        quantity,
        transactionUnit,

        price,

        previousStock:
          freshStock,

        newStock,

        totalAmount:
          quantity * price,

        paymentStatus:
          paymentMethod
            ? "PAID"
            : "CREDIT",

        paymentMethod:
          paymentMethod ||
          null,

        paidAmount:
          paymentMethod
            ? quantity * price
            : 0,

        dueAmount:
          paymentMethod
            ? 0
            : quantity * price,

        customerId:
          wholeSaleCutomerId ||
          null,

        customerName:
          wholeSaleCutomerName ||
          null,

        referenceType,

        referenceId:
          referenceId || "",

        note:
          note ||
          "Stock update",

        createdBy:
          createdBy ||
          "admin",

        createdAt:
          admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  );
}

// =====================================================
// RECIPE LIVE PRODUCT
// Restaurant logic
// =====================================================

else if (
  !recipeSnapshot.empty
) {

  for (const recipeDoc of recipeSnapshot.docs) {

    const recipeData =
      recipeDoc.data();

    const inventoryItemId =
      recipeData.inventoryItemId;

    const recipeQty =
      Number(
        recipeData.quantity
      ) || 0;

    const deductQty =
      recipeQty * quantity;

    const inventoryRef =
      adminDb
        .collection(
          "inventoryItems"
        )
        .doc(
          inventoryItemId
        );

    await adminDb.runTransaction(
      async (t) => {

        const inventorySnap =
          await t.get(
            inventoryRef
          );

        if (
          !inventorySnap.exists
        ) {
          return;
        }

        const inventoryData =
          inventorySnap.data();

        const previousStock =
          Number(
            inventoryData?.currentStock
          ) || 0;

        const newStock =
          stockDirection ===
          "OUT"
            ? previousStock -
              deductQty
            : previousStock +
              deductQty;

        if (
          newStock < 0 &&
          !productData?.allowNegativeStock
        ) {
          throw new Error(
            "Insufficient inventory stock"
          );
        }

        // UPDATE INVENTORY
        t.update(
          inventoryRef,
          {
            currentStock:
              newStock,

            updatedAt:
              admin.firestore.FieldValue.serverTimestamp(),
          }
        );

        // INVENTORY LOG
        const inventoryLogRef =
          adminDb
            .collection(
              "inventoryTransactions"
            )
            .doc();

        t.set(
          inventoryLogRef,
          {
            inventoryItemId,

            inventoryItemName:
              inventoryData?.name ||
              "",

            type: "sale",

            quantity:
              deductQty,

            previousStock,

            newStock,

            note: `Wholesale sale (${productData?.name})`,

            referenceId:
              referenceId ||
              "",

            referenceType:
              "sale",

            createdBy:
              createdBy ||
              "admin",

            createdAt:
              admin.firestore.FieldValue.serverTimestamp(),
          }
        );
      }
    );
  }
}

// =====================================================
// SIMPLE PRODUCT
// =====================================================

else {

  await adminDb.runTransaction(
    async (t) => {

      const freshSnap =
        await t.get(productRef);

      if (!freshSnap.exists) {
        throw new Error(
          "Product not found"
        );
      }

      const freshData =
        freshSnap.data();

      const previousStock =
        Number(
          freshData?.currentStock
        ) || 0;

      const newStock =
        stockDirection ===
        "OUT"
          ? previousStock -
            quantity
          : previousStock +
            quantity;

      if (
        newStock < 0 &&
        !freshData?.allowNegativeStock
      ) {
        throw new Error(
          "Insufficient stock"
        );
      }

      t.update(productRef, {
        currentStock: newStock,

        stockStatus:
          newStock > 0
            ? "in_stock"
            : "out_of_stock",

        updatedAt:
          admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  );
}
 

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