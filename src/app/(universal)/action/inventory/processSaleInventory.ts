// app/(universal)/action/inventory/processSaleInventory.ts
import { revalidatePath, revalidateTag } from "next/cache";

type OrderItemType = {
  productId: string;
  quantity: number;
  name?: string;
};



"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";


export async function processSaleInventory(
  orderId: string,
  orderItems: OrderItemType[]
) {
  try {
    const now = admin.firestore.FieldValue.serverTimestamp();

    for (const item of orderItems) {
   

      const productId = item.productId;
      const soldQty = Number(item.quantity) || 0;

      const productRef = adminDb.collection("products").doc(productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        console.log("❌ Product not found:", productId);
        continue;
      }

      const productData = productDoc.data();
      const productMode = productData?.productMode;

      const recipeSnapshot = await adminDb
        .collection("productRecipes")
        .where("productId", "==", productId)
        .get();

      // ==================================================
      // 1. FINISHED STOCK PRODUCT (DIRECT SALE)
      // ==================================================
      if (productMode === "finished_stock") {
        console.log("📦 Stock managed product:", productData?.name);

        await adminDb.runTransaction(async (transaction) => {
          const freshProductDoc = await transaction.get(productRef);

          if (!freshProductDoc.exists) return;

          const freshProductData = freshProductDoc.data();

          const previousStock =
            Number(freshProductData?.currentStock) || 0;

          const allowNegativeStock =
            freshProductData?.allowNegativeStock ?? false;

          const newStock = previousStock - soldQty;

          if (newStock < 0 && !allowNegativeStock) {
            console.log(
              `❌ Not enough stock for ${freshProductData?.name}`
            );
            return;
          }

          // UPDATE PRODUCT STOCK
          transaction.update(productRef, {
            currentStock: newStock,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // ==================================================
          // ✅ ADD: FINISHED STOCK LEDGER ENTRY
          // ==================================================
          const finishedLedgerRef = adminDb
            .collection("stockLedgerFinished")
            .doc();

          transaction.set(finishedLedgerRef, {
            productId,
            productName: productData?.name || "",
            type: "SALE",
            direction: "OUT",

            qty: soldQty,
            beforeStock: previousStock,
            afterStock: newStock,

            referenceId: orderId,
            referenceType: "ORDER",

            source: "SYSTEM",
            createdBy: "system",
            createdAt: now,
          });

          console.log(
            `✅ Reduced product stock: ${freshProductData?.name}`
          );
        });

        continue;
      }

      // ==================================================
      // 2. RECIPE PRODUCT (RAW MATERIAL CONSUMPTION)
      // ==================================================
      if (!recipeSnapshot.empty) {
        console.log("🍳 Recipe live product:", productData?.name);

        for (const recipeDoc of recipeSnapshot.docs) {
          const recipeData = recipeDoc.data();

          const inventoryItemId = recipeData.inventoryItemId;
          const recipeQty = Number(recipeData.quantity) || 0;

          const deductQty = recipeQty * soldQty;

          const inventoryRef = adminDb
            .collection("inventoryItems")
            .doc(inventoryItemId);

          await adminDb.runTransaction(async (transaction) => {
            const inventoryDoc = await transaction.get(inventoryRef);

            if (!inventoryDoc.exists) {
              console.log("❌ Inventory item missing:", inventoryItemId);
              return;
            }

            const inventoryData = inventoryDoc.data();

            const previousStock =
              Number(inventoryData?.currentStock) || 0;

            const allowNegativeStock =
              productData?.allowNegativeStock ?? false;

            const newStock = previousStock - deductQty;

            if (newStock < 0 && !allowNegativeStock) {
              console.log(
                `❌ Not enough stock for ${inventoryData?.name}`
              );
              return;
            }

            transaction.update(inventoryRef, {
              currentStock: newStock,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // ==================================================
            // ✅ ADD: INVENTORY LEDGER ENTRY
            // ==================================================
            const inventoryLedgerRef = adminDb
              .collection("stockLedgerInventory")
              .doc();

            transaction.set(inventoryLedgerRef, {
              inventoryItemId,
              inventoryItemName: inventoryData?.name || "",

              productId,
              productName: productData?.name || "",

              type: "CONSUMPTION",
              direction: "OUT",

              qty: deductQty,
              beforeStock: previousStock,
              afterStock: newStock,

              referenceId: orderId,
              referenceType: "ORDER",

              source: "SYSTEM",
              createdBy: "system",
              createdAt: now,
            });

            // ==================================================
            // (KEEP EXISTING) INVENTORY TRANSACTION LOG
            // ==================================================
            const transactionRef = adminDb
              .collection("inventoryTransactions")
              .doc();

            transaction.set(transactionRef, {
              inventoryItemId,
              inventoryItemName: inventoryData?.name || "",
              type: "sale",
              quantity: deductQty,
              previousStock,
              newStock,
              note: `Auto deducted from product sale (${productData?.name})`,
              referenceId: orderId,
              referenceType: "order",
              createdBy: "system",
              createdAt: now,
            });
          });
        }

        continue;
      }

      // ==================================================
      // 3. SIMPLE PRODUCT
      // ==================================================
      console.log("🧾 Simple product:", productData?.name);

      await adminDb.runTransaction(async (transaction) => {
        const freshSnap = await transaction.get(productRef);

        if (!freshSnap.exists) return;

        const freshData = freshSnap.data();

        const previousStock = Number(freshData?.currentStock) || 0;
        const newStock = previousStock - soldQty;

        transaction.update(productRef, {
          currentStock: newStock,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // ==================================================
        // ✅ ADD: FINISHED LEDGER (SIMPLE PRODUCT ALSO)
        // ==================================================
        const finishedLedgerRef = adminDb
          .collection("stockLedgerFinished")
          .doc();

        transaction.set(finishedLedgerRef, {
          productId,
          productName: productData?.name || "",

          type: "SALE",
          direction: "OUT",

          qty: soldQty,
          beforeStock: previousStock,
          afterStock: newStock,

          referenceId: orderId,
          referenceType: "ORDER",

          source: "SYSTEM",
          createdBy: "system",
          createdAt: now,
        });
      });
    }

    return { success: true };
  } catch (error) {
    console.error("❌ processSaleInventory failed:", error);

    return {
      success: false,
      error: "Inventory processing failed",
    };
  }
}

export async function processSaleInventory2(
  orderId: string,
  orderItems: OrderItemType[]
) {
  try {
    const now = admin.firestore.FieldValue.serverTimestamp();

    for (const item of orderItems) {
      console.log("processSaleInventory-------------", item);

      const productId = item.productId;
      const soldQty = Number(item.quantity) || 0;

      if (!productId || soldQty <= 0) continue;

      // ==================================================
      // GET PRODUCT (READ ONLY)
      // ==================================================
      const productRef = adminDb.collection("products").doc(productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        console.log("❌ Product not found:", productId);
        continue;
      }

      const productData = productDoc.data();
      const productMode = productData?.productMode;

      // ==================================================
      // GET RECIPES (IF ANY)
      // ==================================================
      const recipeSnapshot = await adminDb
        .collection("productRecipes")
        .where("productId", "==", productId)
        .get();

      // ==================================================
      // 1. FINISHED STOCK LEDGER (SOURCE OF TRUTH)
      // ==================================================
      const finishedLedgerRef = adminDb
        .collection("stockLedgerFinished")
        .doc();

      await finishedLedgerRef.set({
        productId,
        productName: productData?.name || "",
        type: "SALE",
        direction: "OUT",

        qty: soldQty,
        price: productData?.price || 0,
        totalAmount: soldQty * (productData?.price || 0),

        beforeStock: productData?.currentStock ?? null, // snapshot only
        afterStock: null, // will be calculated by engine later

        referenceId: orderId,
        referenceType: "ORDER",

        createdBy: "system",
        createdAt: now,
        source: "ANDROID_WEB_SALE",
      });

      // ==================================================
      // 2. RAW MATERIAL LEDGER (IF RECIPE EXISTS)
      // ==================================================
      if (!recipeSnapshot.empty) {
        console.log("🍳 Recipe product:", productData?.name);

        const batch = adminDb.batch();
        const inventoryLedger = adminDb.collection("stockLedgerInventory");

        recipeSnapshot.docs.forEach((doc) => {
          const recipe = doc.data();

          const inventoryItemId = recipe.inventoryItemId;
          const recipeQty = Number(recipe.quantity) || 0;

          const consumedQty = recipeQty * soldQty;

          const ref = inventoryLedger.doc();

          batch.set(ref, {
            inventoryItemId,
            productId,

            type: "CONSUMPTION",
            direction: "OUT",
            qty: consumedQty,

            note: `Auto deduction from sale (${productData?.name})`,

            referenceId: orderId,
            referenceType: "ORDER",

            createdBy: "system",
            createdAt: now,
            source: "SYSTEM",
          });
        });

        await batch.commit();
      }

      // ==================================================
      // 3. DEBUG TRACE ONLY
      // ==================================================
      console.log("✅ Sale recorded in ledger:", productData?.name);
    }

    return {
      success: true,
      message: "Sale recorded in ledger successfully",
    };
  } catch (error: any) {
    console.error("❌ processSaleInventory failed:", error);

    return {
      success: false,
      error: error.message || "Inventory processing failed",
    };
  }
}

export async function processSaleInventory1(
  orderId: string,
  orderItems: OrderItemType[]
) {
  try {
    for (const item of orderItems) {
      console.log("processSaleInventory-------------", item);

      const productId = item.productId;
      const soldQty = Number(item.quantity) || 0;

      // ==================================================
      // GET PRODUCT (READ ONLY)
      // ==================================================
      const productRef = adminDb.collection("products").doc(productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        console.log("❌ Product not found:", productId);
        continue;
      }

      const productData = productDoc.data();
      const productMode = productData?.productMode;

      // ==================================================
      // GET RECIPES (IF ANY)
      // ==================================================
      const recipeSnapshot = await adminDb
        .collection("productRecipes")
        .where("productId", "==", productId)
        .get();

      const now = admin.firestore.FieldValue.serverTimestamp();

      // ==================================================
      // 1. FINISHED STOCK LEDGER (ALL PRODUCTS)
      // ==================================================
      const finishedLedgerRef = adminDb
        .collection("stockLedgerFinished")
        .doc();

      await finishedLedgerRef.set({
        productId,
        productName: productData?.name || "",
        type: "SALE",
        direction: "OUT",
        qty: soldQty,
        price: productData?.price || 0,
        totalAmount: soldQty * (productData?.price || 0),

        referenceId: orderId,
        referenceType: "ORDER",

        createdBy: "system",
        createdAt: now,
        source: "ANDROID_WEB_SALE",
      });



      

      // ==================================================
      // 2. RAW MATERIAL CONSUMPTION (IF RECIPE EXISTS)
      // ==================================================
      if (!recipeSnapshot.empty) {
        console.log("🍳 Recipe product:", productData?.name);

        const batch = adminDb.batch();
        const inventoryLedger = adminDb.collection(
          "stockLedgerInventory"
        );

        recipeSnapshot.docs.forEach((doc) => {
          const recipe = doc.data();

          const inventoryItemId = recipe.inventoryItemId;
          const recipeQty = Number(recipe.quantity) || 0;

          const consumedQty = recipeQty * soldQty;

          const ref = inventoryLedger.doc();

          batch.set(ref, {
            inventoryItemId,
            productId,

            type: "CONSUMPTION",
            direction: "OUT",
            qty: consumedQty,

            note: `Auto deduction from sale (${productData?.name})`,

            referenceId: orderId,
            referenceType: "ORDER",

            createdBy: "system",
            createdAt: now,
            source: "SYSTEM",
          });
        });

        await batch.commit();
      }

      // ==================================================
      // 3. SIMPLE LOG ONLY (OPTIONAL DEBUG TRACE)
      // ==================================================
      console.log("✅ Sale event recorded:", productData?.name);
    }

    return {
      success: true,
      message: "Sale recorded in ledger successfully",
    };
  } catch (error: any) {
    console.error("❌ processSaleInventory failed:", error);

    return {
      success: false,
      error: error.message || "Inventory processing failed",
    };
  }
}

export async function processSaleInventory_old(
  orderId: string,
  orderItems: OrderItemType[]
) {
 

  try {
    for (const item of orderItems) {

       console.log(
    "processSaleInventory-------------",item
  );
      const productId = item.productId;

      const soldQty =
        Number(item.quantity) || 0;

      // ===============================
      // GET PRODUCT
      // ===============================

      const productRef =
        adminDb
          .collection("products")
          .doc(productId);

      const productDoc =
        await productRef.get();

      if (!productDoc.exists) {
        console.log(
          "❌ Product not found:",
          productId
        );

        continue;
      }

      const productData =
        productDoc.data();

      const productMode =
        productData?.productMode;

      // FIND RECIPES
      const recipeSnapshot =
        await adminDb
          .collection("productRecipes")
          .where(
            "productId",
            "==",
            productId
          )
          .get();

      // ==================================================
      // STOCK MANAGED PRODUCT
      // Sweet shop / finished goods
      // Only reduce PRODUCT currentStock
      // ==================================================

      if (
        productMode ===
        "finished_stock"
      ) {
        console.log(
          "📦 Stock managed product:",
          productData?.name
        );

        await adminDb.runTransaction(
          async (transaction) => {
            const freshProductDoc =
              await transaction.get(
                productRef
              );

            if (
              !freshProductDoc.exists
            ) {
              return;
            }

            const freshProductData =
              freshProductDoc.data();

            const previousStock =
              Number(
                freshProductData?.currentStock
              ) || 0;

            const allowNegativeStock =
              freshProductData?.allowNegativeStock ??
              false;

            const newStock =
              previousStock -
              soldQty;

            if (
              newStock < 0 &&
              !allowNegativeStock
            ) {
              console.log(
                `❌ Not enough stock for ${freshProductData?.name}`
              );

              return;
            }

            transaction.update(
              productRef,
              {
                currentStock:
                  newStock,

                updatedAt:
                  admin.firestore.FieldValue.serverTimestamp(),
              }
            );
revalidateTag("stock-products-updated", "max");
revalidatePath("/admin/stock-finshed");
            console.log(
              `✅ Reduced product stock: ${freshProductData?.name}`
            );
          }
        );

        continue;
      }

      // ==================================================
      // RECIPE LIVE PRODUCT
      // Restaurant logic
      // Also works if productMode is undefined/null
      // ==================================================

      if (!recipeSnapshot.empty) {
        console.log(
          "🍳 Recipe live product:",
          productData?.name
        );

        for (const recipeDoc of recipeSnapshot.docs) {
          const recipeData =
            recipeDoc.data();

          const inventoryItemId =
            recipeData.inventoryItemId;

          const recipeQty =
            Number(
              recipeData.quantity
            ) || 0;

          // TOTAL TO DEDUCT
          const deductQty =
            recipeQty * soldQty;

          console.log(
            "recipe deduction-------------",
            {
              product:
                productData?.name,

              inventoryItemId,

              recipeQty,

              soldQty,

              deductQty,
            }
          );

          // GET INVENTORY ITEM
          const inventoryRef =
            adminDb
              .collection(
                "inventoryItems"
              )
              .doc(
                inventoryItemId
              );

          await adminDb.runTransaction(
            async (transaction) => {
              // GET INVENTORY
              const inventoryDoc =
                await transaction.get(
                  inventoryRef
                );

              if (
                !inventoryDoc.exists
              ) {
                console.log(
                  "❌ Inventory item missing:",
                  inventoryItemId
                );

                return;
              }

              const inventoryData =
                inventoryDoc.data();

              const previousStock =
                Number(
                  inventoryData?.currentStock
                ) || 0;

              // NEGATIVE STOCK CHECK
              const allowNegativeStock =
                productData?.allowNegativeStock ??
                false;

              const newStock =
                previousStock -
                deductQty;

              if (
                newStock < 0 &&
                !allowNegativeStock
              ) {
                console.log(
                  `❌ Not enough stock for ${inventoryData?.name}`
                );

                return;
              }

              // UPDATE STOCK
              transaction.update(
                inventoryRef,
                {
                  currentStock:
                    newStock,

                  updatedAt:
                    admin.firestore.FieldValue.serverTimestamp(),
                }
              );

              // TRANSACTION LOG
              const transactionRef =
                adminDb
                  .collection(
                    "inventoryTransactions"
                  )
                  .doc();

              transaction.set(
                transactionRef,
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

                  note: `Auto deducted from product sale (${productData?.name})`,

                  referenceId:
                    orderId,

                  referenceType:
                    "order",

                  createdBy:
                    "system",

                  createdAt:
                    admin.firestore.FieldValue.serverTimestamp(),
                }
              );
            }
          );
        }

        continue;
      }

      // ==================================================
      // SIMPLE PRODUCT
      // ==================================================

      console.log(
        "🧾 Simple product:",
        productData?.name
      );

      const previousStock =
        Number(
          productData?.currentStock
        ) || 0;

      const newStock =
        previousStock - soldQty;

      await productRef.update({
        currentStock: newStock,

        updatedAt:
          admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(
        `✅ Reduced simple product stock: ${productData?.name}`
      );
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "❌ processSaleInventory failed:",
      error
    );

    return {
      success: false,

      error:
        "Inventory processing failed",
    };
  }
}