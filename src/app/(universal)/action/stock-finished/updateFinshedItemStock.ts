"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";
import { processInventory_FinishedStockCreated } from "../inventory/processInventory_FinishedStockCreated";

type AdjustStockType = {
  id: string;
  stockDirection: "IN" | "OUT";
  quantity: number;
  note?: string;
  createdBy?: string;
};





export async function updateFinishedItemStock({
  id,
  stockDirection,
  quantity,
  note,
  createdBy,
}: AdjustStockType) {
  try {
    // ================= VALIDATION =================
    if (!id) {
      return { success: false, message: "Product ID required" };
    }

    if (!quantity || quantity <= 0) {
      return { success: false, message: "Invalid quantity" };
    }

    const now = admin.firestore.FieldValue.serverTimestamp();

    // ================= FETCH PRODUCT =================
    const productRef = adminDb.collection("products").doc(id);

    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      return { success: false, message: "Product not found" };
    }

    const productData = productSnap.data();

    // =========================================================
    // 1. GET CURRENT STOCK (CACHE VALUE)
    // =========================================================
    const previousStock = Number(productData?.currentStock) || 0;

    let newStock = previousStock;

    if (stockDirection === "IN") {
      newStock = previousStock + quantity;
    } else {
      newStock = previousStock - quantity;

      if (newStock < 0 && !productData?.allowNegativeStock) {
        return {
          success: false,
          message: "Insufficient stock",
        };
      }
    }

    // =========================================================
    // 2. PRODUCT LEDGER ENTRY (SOURCE OF TRUTH)
    // =========================================================
    const productLedgerRef = adminDb
      .collection("stockLedgerFinished")
      .doc();

    await productLedgerRef.set({
      productId: id,
      productName: productData?.name || "",

      type:
        stockDirection === "IN"
          ? "PRODUCTION"
          : "ADJUSTMENT",

      direction: stockDirection,

      qty: quantity,

      beforeStock: previousStock,
      afterStock: newStock,

      note: note || "",
      createdBy: createdBy || "system",
      createdAt: now,
      source: "WEB_ADMIN",
    });

    // =========================================================
    // 3. UPDATE PRODUCT CACHE STOCK (IMPORTANT FIX)
    // =========================================================
    await productRef.update({
      currentStock: newStock,
      stockStatus:
        newStock > 0 ? "in_stock" : "out_of_stock",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // =========================================================
    // 4. RAW MATERIAL CONSUMPTION (ONLY WHEN INCREASE)
    // =========================================================
    if (stockDirection === "IN") {
      const recipesSnapshot = await adminDb
        .collection("productRecipes")
        .where("productId", "==", id)
        .get();

      if (!recipesSnapshot.empty) {
        const batch = adminDb.batch();
        const inventoryLedgerRef = adminDb.collection(
          "stockLedgerInventory"
        );

        recipesSnapshot.docs.forEach((doc) => {
          const recipe = doc.data();

          const inventoryItemId = recipe.inventoryItemId;
          const recipeQty = Number(recipe.quantity) || 0;

          const consumedQty = recipeQty * quantity;

          const ledgerRef = inventoryLedgerRef.doc();

          batch.set(ledgerRef, {
            inventoryItemId,
            productId: id,

            type: "CONSUMPTION",
            direction: "OUT",

            qty: consumedQty,

            note: `Used for production of ${productData?.name}`,

            createdBy: createdBy || "system",
            createdAt: now,
            source: "WEB_ADMIN",
          });
        });

        await batch.commit();
      }
    }

    // =========================================================
    // 5. CACHE INVALIDATION
    // =========================================================
    revalidateTag("products", "max");
    revalidatePath("/admin/products");
    revalidatePath("/admin/products/dashboard");

    return {
      success: true,
      message: "Stock event recorded successfully",
    };
  } catch (error: any) {
    console.error("❌ updateFinishedItemStock:", error);

    return {
      success: false,
      message: error.message || "Failed to record stock event",
    };
  }
}


export async function updateFinishedItemStock_only_ledger({
  id,
  stockDirection,
  quantity,
  note,
  createdBy,
}: AdjustStockType) {
  try {
    // ================= VALIDATION =================
    if (!id) {
      return { success: false, message: "Product ID required" };
    }

    if (!quantity || quantity <= 0) {
      return { success: false, message: "Invalid quantity" };
    }

    // ================= FETCH PRODUCT (ONLY FOR INFO) =================
    const productRef = adminDb.collection("products").doc(id);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      return { success: false, message: "Product not found" };
    }

    const productData = productSnap.data();

    const now = admin.firestore.FieldValue.serverTimestamp();

    // =========================================================
    // 1. CREATE PRODUCT LEDGER ENTRY (FINISHED GOODS MOVEMENT)
    // =========================================================

    const productLedgerRef = adminDb
      .collection("stockLedgerFinished")
      .doc();

 await productLedgerRef.set({
  productId: id,
  productName: productData?.name || "",
  type: stockDirection === "IN" ? "PRODUCTION" : "ADJUSTMENT",
  direction: stockDirection, // IN / OUT
  qty: quantity,
  note: note || "",
  createdBy: createdBy || "system",
  createdAt: now,
  source: "WEB_ADMIN",
});

    // =========================================================
    // 2. RAW MATERIAL CONSUMPTION (ONLY WHEN INCREASE STOCK)
    // =========================================================

    if (stockDirection === "IN") {
      const recipesSnapshot = await adminDb
        .collection("productRecipes")
        .where("productId", "==", id)
        .get();

      if (!recipesSnapshot.empty) {
        const batch = adminDb.batch();

        const inventoryLedgerRef = adminDb.collection(
          "stockLedgerInventory"
        );

        recipesSnapshot.docs.forEach((doc) => {
          const recipe = doc.data();

          const inventoryItemId = recipe.inventoryItemId;
          const recipeQty = Number(recipe.quantity) || 0;

          const consumedQty = recipeQty * quantity;

          const ledgerRef = inventoryLedgerRef.doc();

          batch.set(ledgerRef, {
            inventoryItemId,
            productId: id,
            type: "CONSUMPTION",
            qty: consumedQty,
            note: `Used for production of ${productData?.name}`,
            createdBy: createdBy || "system",
            createdAt: now,
            source: "WEB_ADMIN",
          });
        });

        await batch.commit();
      }
    }

    // =========================================================
    // 3. CACHE INVALIDATION (UI ONLY)
    // =========================================================

    revalidateTag("products","max");
    revalidatePath("/admin/products");
    revalidatePath("/admin/products/dashboard");

    return {
      success: true,
      message: "Stock event recorded successfully",
    };
  } catch (error: any) {
    console.error("❌ updateFinishedItemStock_new:", error);

    return {
      success: false,
      message: error.message || "Failed to record stock event",
    };
  }
}

export async function updateFinishedItemStock_old({
  id,
  stockDirection,
  quantity,
  note,
  createdBy,
}: AdjustStockType) {
  try {
    // ================= VALIDATION =================
    if (!id) {
      return { success: false, message: "Product ID required" };
    }

    if (!quantity || quantity <= 0) {
      return { success: false, message: "Invalid quantity" };
    }

    const productRef = adminDb.collection("products").doc(id);

    // ================= TRANSACTION (IMPORTANT) =================
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(productRef);

      if (!snap.exists) {
        throw new Error("Product not found");
      }

      const data = snap.data();
      const previousStock = Number(data?.currentStock) || 0;

      let newStock = previousStock;

      if (stockDirection === "IN") {
        newStock = previousStock + quantity;
      } else {
        newStock = previousStock - quantity;

        if (newStock < 0 && !data?.allowNegativeStock) {
          throw new Error("Insufficient stock");
        }
      }

      // ✅ UPDATE STOCK
      tx.update(productRef, {
        currentStock: newStock,
         // IMPORTANT:
        // If finished stock is maintained,
       // this product becomes stock managed
       //productMode: "finished_stock",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // ================= OPTIONAL: STOCK HISTORY =================
      const logRef = adminDb.collection("productStockLogs").doc();

      tx.set(logRef, {
        productId: id,
        stockDirection,
        quantity,
        previousStock,
        newStock,
        note: note || "",
        createdBy: createdBy || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    // ================= REVALIDATE =================
  // ==================================================
// RAW MATERIAL CONSUMPTION
// ONLY WHEN NEW FINISHED STOCK IS CREATED
// ==================================================

if (stockDirection === "IN") {
  await processInventory_FinishedStockCreated(
    `production-${Date.now()}`,
    [
      {
        id: id,
        quantity,
      },
    ]
  );
}







// ================= REVALIDATE =================

revalidateTag("products", "max");

revalidatePath("/admin/products");

revalidatePath(
  "/admin/products/dashboard"
);

return {
  success: true,
  message: "Stock updated successfully",
};




  } catch (error: any) {
    console.error("❌ updateFinishedItemStock:", error);

    return {
      success: false,
      message: error.message || "Failed to update stock",
    };
  }
}