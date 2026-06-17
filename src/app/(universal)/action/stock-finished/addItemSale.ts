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


export async function addItemSale_({
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
    if (!id) return { success: false, message: "Product ID required" };
    if (!quantity || quantity <= 0)
      return { success: false, message: "Invalid quantity" };

    const productRef = adminDb.collection("products").doc(id);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      return { success: false, message: "Product not found" };
    }

    const productData = productSnap.data();
    const productMode = productData?.productMode;

    const recipeSnapshot = await adminDb
      .collection("productRecipes")
      .where("productId", "==", id)
      .get();

    const now = admin.firestore.FieldValue.serverTimestamp();

    await adminDb.runTransaction(async (tx) => {
      const freshSnap = await tx.get(productRef);

      if (!freshSnap.exists) {
        throw new Error("Product not found inside transaction");
      }

      const freshData = freshSnap.data();
      const currentStock = Number(freshData?.currentStock) || 0;

      let newStock =
        stockDirection === "OUT"
          ? currentStock - quantity
          : currentStock + quantity;

      if (newStock < 0 && !freshData?.allowNegativeStock) {
        throw new Error("Insufficient stock");
      }

      // =====================================================
      // 1. UPDATE PRODUCT STOCK
      // =====================================================
      tx.update(productRef, {
        currentStock: newStock,
        stockStatus: newStock > 0 ? "in_stock" : "out_of_stock",
        updatedAt: now,
      });

      const totalAmount = quantity * price;

      // =====================================================
      // 2. OLD TRANSACTION LOG (KEEP)
      // =====================================================
      const oldRef = adminDb
        .collection("finishedStockTransactions")
        .doc();

      tx.set(oldRef, {
        productId: id,
        transactionType,
        stockDirection,
        quantity,
        transactionUnit,
        price,
        previousStock: currentStock,
        newStock,
        totalAmount,
        paymentStatus: paymentMethod ? "PAID" : "CREDIT",
        paymentMethod: paymentMethod || null,
        paidAmount: paymentMethod ? totalAmount : 0,
        dueAmount: paymentMethod ? 0 : totalAmount,
        customerId: wholeSaleCutomerId || null,
        customerName: wholeSaleCutomerName || null,
        referenceType,
        referenceId: referenceId || "",
        note: note || "Stock update",
        createdBy: createdBy || "admin",
        createdAt: now,
      });

      // =====================================================
      // 3. NEW LEDGER (stockLedgerFinished)
      // =====================================================
      const ledgerRef = adminDb.collection("stockLedgerFinished").doc();

      tx.set(ledgerRef, {
        productId: id,
        productName: productData?.name || "",

        type: transactionType,
        direction: stockDirection,

        qty: quantity,
        price,
        totalAmount,

        previousStock: currentStock,
        newStock,

        paymentStatus: paymentMethod ? "PAID" : "CREDIT",
        paymentMethod: paymentMethod || null,
        paidAmount: paymentMethod ? totalAmount : 0,
        dueAmount: paymentMethod ? 0 : totalAmount,

        customerId: wholeSaleCutomerId || null,
        customerName: wholeSaleCutomerName || null,

        referenceType,
        referenceId: referenceId || "",

        note: note || "",
        createdBy: createdBy || "admin",
        createdAt: now,
        source: "WEB_ADMIN",
      });
    });

    // =====================================================
    // 4. RECIPE LOGIC (UNCHANGED)
    // =====================================================
    if (productMode === "finished_stock" && !recipeSnapshot.empty) {
      const batch = adminDb.batch();
      const inventoryLedger = adminDb.collection("inventoryTransactions");

      recipeSnapshot.docs.forEach((doc) => {
        const recipe = doc.data();

        const inventoryItemId = recipe.inventoryItemId;
        const recipeQty = Number(recipe.quantity) || 0;

        const consumedQty = recipeQty * quantity;

        const ref = inventoryLedger.doc();

        batch.set(ref, {
          inventoryItemId,
          productId: id,
          type: "sale",
          qty: consumedQty,
          note: `Production usage (${productData?.name})`,
          referenceId: referenceId || "",
          referenceType: "sale",
          createdBy: createdBy || "admin",
          createdAt: now,
          source: "WEB_ADMIN",
        });
      });

      await batch.commit();
    }

    // =====================================================
    // 5. CUSTOMER ACCOUNT
    // =====================================================
    if (transactionType === "SALE" && wholeSaleCutomerId) {
      const totalAmount = quantity * price;

      await updateCustomerAccount({
        wholeSaleCutomerId,
        transactionType,
        totalAmount,
        paidAmount: paymentMethod ? totalAmount : 0,
        dueAmount: paymentMethod ? 0 : totalAmount,
        paymentMethod,
      });
    }

    // =====================================================
    // 6. CACHE
    // =====================================================
    revalidateTag("products", "max");
    revalidatePath("/admin/stock-finished");

    return {
      success: true,
      message: "Stock updated with dual ledger successfully",
    };
  } catch (error: any) {
    console.error("❌ addItemSale failed:", error);

    return {
      success: false,
      message: error.message || "Failed to update stock",
    };
  }
}


export async function addItemSale_2 ({
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
}: any) {
  try {
    if (!id) return { success: false, message: "Product ID required" };
    if (!quantity || quantity <= 0)
      return { success: false, message: "Invalid quantity" };

    const db = adminDb;
    const now = admin.firestore.FieldValue.serverTimestamp();

    const productRef = db.collection("products").doc(id);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      return { success: false, message: "Product not found" };
    }

    const productData = productSnap.data();

    // =====================================================
    // TRANSACTION: STOCK + LEDGER
    // =====================================================

    await db.runTransaction(async (tx) => {
      const fresh = await tx.get(productRef);

      const currentStock = Number(fresh.data()?.currentStock) || 0;

      const newStock =
        stockDirection === "OUT"
          ? currentStock - quantity
          : currentStock + quantity;

      if (newStock < 0 && !fresh.data()?.allowNegativeStock) {
        throw new Error("Insufficient stock");
      }

      // =====================================================
      // 1. UPDATE PRODUCT STOCK (CACHE)
      // =====================================================

      tx.update(productRef, {
        currentStock: newStock,
        stockStatus: newStock > 0 ? "in_stock" : "out_of_stock",
        updatedAt: now,
      });

      // =====================================================
      // 2. FINISHED STOCK LEDGER ENTRY
      // =====================================================

      const finishedLedgerRef = db
        .collection("stockLedgerFinished")
        .doc();

      tx.set(finishedLedgerRef, {
        productId: id,
        productName: productData?.name || "",

        transactionType,
        direction: stockDirection,

        qty: quantity,
        price,
        totalAmount: quantity * price,

        previousStock: currentStock,
        newStock,

        paymentStatus: paymentMethod ? "PAID" : "CREDIT",
        paymentMethod: paymentMethod || null,
        paidAmount: paymentMethod ? quantity * price : 0,
        dueAmount: paymentMethod ? 0 : quantity * price,

        customerId: wholeSaleCutomerId || null,
        customerName: wholeSaleCutomerName || null,

        referenceType,
        referenceId: referenceId || "",

        note: note || "",
        createdBy: createdBy || "admin",

        createdAt: now,
        source: "WEB_ADMIN",
      });
    });

    // =====================================================
    // 3. RAW MATERIAL CONSUMPTION (ONLY FOR RECIPES)
    // =====================================================

    const productMode = productData?.productMode;

    if (productMode === "finished_stock" && stockDirection === "IN") {
      const recipeSnapshot = await adminDb
        .collection("productRecipes")
        .where("productId", "==", id)
        .get();

      if (!recipeSnapshot.empty) {
        const batch = adminDb.batch();
        const inventoryLedger = adminDb.collection("stockLedgerInventory");

        recipeSnapshot.docs.forEach((doc) => {
          const recipe = doc.data();

          const consumedQty =
            Number(recipe.quantity || 0) * quantity;

          const ref = inventoryLedger.doc();

          batch.set(ref, {
            inventoryItemId: recipe.inventoryItemId,
            productId: id,

            type: "CONSUMPTION",
            direction: "OUT",
            qty: consumedQty,

            note: `Wholesale production (${productData?.name})`,

            referenceId: referenceId || "",
            referenceType: "SALE",

            createdBy: createdBy || "admin",
            createdAt: now,
            source: "WEB_ADMIN",
          });
        });

        await batch.commit();
      }
    }

    // =====================================================
    // 4. CUSTOMER ACCOUNT
    // =====================================================

    if (transactionType === "SALE" && wholeSaleCutomerId) {
      const totalAmount = quantity * price;

      await updateCustomerAccount({
        wholeSaleCutomerId,
        transactionType,
        totalAmount,
        paidAmount: paymentMethod ? totalAmount : 0,
        dueAmount: paymentMethod ? 0 : totalAmount,
        paymentMethod,
      });
    }

    // =====================================================
    // 5. CACHE
    // =====================================================

    revalidateTag("products", "max");
    revalidatePath("/admin/stock-finished");

    return {
      success: true,
      message: "Stock updated with ledger successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to record sale",
    };
  }
}
export async function updateFinishedItemStock_junk({
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
    if (!id) return { success: false, message: "Product ID required" };
    if (!quantity || quantity <= 0)
      return { success: false, message: "Invalid quantity" };

    const productRef = adminDb.collection("products").doc(id);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      return { success: false, message: "Product not found" };
    }

    const productData = productSnap.data();
    const now = admin.firestore.FieldValue.serverTimestamp();

    // =====================================================
    // 1. UPDATE PRODUCT STOCK (REAL-TIME UI CACHE)
    // =====================================================

    await adminDb.runTransaction(async (tx) => {
      const fresh = await tx.get(productRef);

      const currentStock = Number(fresh.data()?.currentStock) || 0;

      const newStock =
        stockDirection === "IN"
          ? currentStock + quantity
          : currentStock - quantity;

      if (newStock < 0 && !fresh.data()?.allowNegativeStock) {
        throw new Error("Insufficient stock");
      }

      tx.update(productRef, {
        currentStock: newStock,
        stockStatus: newStock > 0 ? "in_stock" : "out_of_stock",
        updatedAt: now,
      });

      // =====================================================
      // 2. FINISHED STOCK LEDGER
      // =====================================================

      const ledgerRef = adminDb.collection("stockLedgerFinished").doc();

      tx.set(ledgerRef, {
        productId: id,
        productName: productData?.name || "",

        type: stockDirection === "IN" ? "PRODUCTION" : "ADJUSTMENT",
        direction: stockDirection,

        qty: quantity,

        previousStock: currentStock,
        newStock,

        note: note || "",
        createdBy: createdBy || "system",

        createdAt: now,
        source: "WEB_ADMIN",
      });
    });

    // =====================================================
    // 3. RAW MATERIAL CONSUMPTION (ONLY WHEN INCREASE STOCK)
    // =====================================================

    if (stockDirection === "IN") {
      const recipesSnapshot = await adminDb
        .collection("productRecipes")
        .where("productId", "==", id)
        .get();

      if (!recipesSnapshot.empty) {
        const batch = adminDb.batch();
        const inventoryLedger = adminDb.collection("stockLedgerInventory");

        recipesSnapshot.docs.forEach((doc) => {
          const recipe = doc.data();

          const consumedQty =
            Number(recipe.quantity || 0) * quantity;

          const ref = inventoryLedger.doc();

          batch.set(ref, {
            inventoryItemId: recipe.inventoryItemId,
            productId: id,

            type: "CONSUMPTION",
            direction: "OUT",
            qty: consumedQty,

            note: `Production usage (${productData?.name})`,

            createdBy: createdBy || "system",
            createdAt: now,
            source: "WEB_ADMIN",
          });
        });

        await batch.commit();
      }
    }

    // =====================================================
    // 4. CACHE
    // =====================================================

    revalidateTag("products", "max");
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Stock updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update stock",
    };
  }
}


export async function addItemSale_only_ledger({
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
}: any) {
  try {
    // =====================================================
    // VALIDATION
    // =====================================================

    if (!id) return { success: false, message: "Product ID required" };
    if (!quantity || quantity <= 0)
      return { success: false, message: "Invalid quantity" };

    const now = admin.firestore.FieldValue.serverTimestamp();

    // =====================================================
    // GET PRODUCT (READ ONLY)
    // =====================================================

    const productRef = adminDb.collection("products").doc(id);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      return { success: false, message: "Product not found" };
    }

    const productData = productSnap.data();
    const productMode = productData?.productMode;

    // =====================================================
    // 1. FINISHED STOCK LEDGER ENTRY
    // =====================================================

    const finishedLedgerRef = adminDb
      .collection("stockLedgerFinished")
      .doc();

    await finishedLedgerRef.set({
      productId: id,
      productName: productData?.name || "",
      transactionType,
      direction: stockDirection, // IN / OUT
      qty: quantity,
      price,
      totalAmount: quantity * price,

      paymentStatus: paymentMethod ? "PAID" : "CREDIT",
      paymentMethod: paymentMethod || null,
      paidAmount: paymentMethod ? quantity * price : 0,
      dueAmount: paymentMethod ? 0 : quantity * price,

      customerId: wholeSaleCutomerId || null,
      customerName: wholeSaleCutomerName || null,

      referenceType,
      referenceId: referenceId || "",

      note: note || "",
      createdBy: createdBy || "admin",
      createdAt: now,
      source: "WEB_ADMIN",
    });

    // =====================================================
    // 2. RAW MATERIAL CONSUMPTION (ONLY FOR RECIPES)
    // =====================================================

    if (productMode === "finished_stock" && stockDirection === "IN") {
      const recipeSnapshot = await adminDb
        .collection("productRecipes")
        .where("productId", "==", id)
        .get();

      if (!recipeSnapshot.empty) {
        const batch = adminDb.batch();

        const inventoryLedger = adminDb.collection("stockLedgerInventory");

        recipeSnapshot.docs.forEach((doc) => {
          const recipe = doc.data();

          const inventoryItemId = recipe.inventoryItemId;
          const recipeQty = Number(recipe.quantity) || 0;

          const consumedQty = recipeQty * quantity;

          const ref = inventoryLedger.doc();

          batch.set(ref, {
            inventoryItemId,
            productId: id,
            type: "CONSUMPTION",
            qty: consumedQty,
            note: `Wholesale sale production (${productData?.name})`,
            referenceId: referenceId || "",
            referenceType: "SALE",
            createdBy: createdBy || "admin",
            createdAt: now,
            source: "WEB_ADMIN",
          });
        });

        await batch.commit();
      }
    }

    // =====================================================
    // 3. CUSTOMER ACCOUNT (UNCHANGED BUSINESS LOGIC)
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
    // 4. CACHE REFRESH
    // =====================================================

    revalidateTag("products","max");
    revalidatePath("/admin/stock-finished");

    return {
      success: true,
      message: "Stock event recorded successfully",
    };
  } catch (error: any) {
    console.error("❌ addItemSale failed:", error);

    return {
      success: false,
      message: error.message || "Failed to record stock event",
    };
  }
}



export async function addItemSale ({
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