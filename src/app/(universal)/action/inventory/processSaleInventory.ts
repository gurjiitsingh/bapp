// app/(universal)/action/inventory/processSaleInventory.ts

"use server";

import { adminDb } from "@/lib/firebaseAdmin";

import admin from "firebase-admin";
import { revalidatePath, revalidateTag } from "next/cache";

type OrderItemType = {
  productId: string;
  quantity: number;
  name?: string;
};

export async function processSaleInventory(
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