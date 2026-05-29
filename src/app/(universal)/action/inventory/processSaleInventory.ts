// app/(universal)/action/inventory/processSaleInventory.ts

"use server";

import { adminDb } from "@/lib/firebaseAdmin";

type OrderItemType = {
  productId: string;
  quantity: number;
  name?: string;
};

export async function processSaleInventory(
  orderItems: OrderItemType[]
) {
  console.log(
    "processSaleInventory-------------"
  );

  try {
    for (const item of orderItems) {
      const productId = item.productId;

      const soldQty = Number(item.quantity);

      // GET PRODUCT
      const productDoc = await adminDb
        .collection("products")
        .doc(productId)
        .get();

      if (!productDoc.exists) {
        console.log(
          "❌ Product not found:",
          productId
        );

        continue;
      }

      const productData =
        productDoc.data();

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

      // ===============================
      // RESTAURANT / RECIPE PRODUCT
      // ===============================
      if (!recipeSnapshot.empty) {
        console.log(
          "Recipe product detected:",
          productData?.name
        );

        for (const recipeDoc of recipeSnapshot.docs) {
          const recipeData =
            recipeDoc.data();

          const inventoryItemId =
            recipeData.inventoryItemId;

          const recipeQty =
            Number(recipeData.quantity) || 0;

          // TOTAL TO DEDUCT
          const deductQty =
            recipeQty * soldQty;

          // GET INVENTORY ITEM
          const inventoryRef =
            adminDb
              .collection(
                "inventoryItems"
              )
              .doc(inventoryItemId);

          const inventoryDoc =
            await inventoryRef.get();

          if (!inventoryDoc.exists) {
            console.log(
              "❌ Inventory item missing:",
              inventoryItemId
            );

            continue;
          }

          const inventoryData =
            inventoryDoc.data();

          const previousStock =
            Number(
              inventoryData?.currentStock
            ) || 0;

          const newStock =
            previousStock - deductQty;

          // UPDATE INVENTORY
          await inventoryRef.update({
            currentStock: newStock,
            updatedAt: new Date(),
          });

          // CREATE TRANSACTION
          await adminDb
            .collection(
              "inventoryTransactions"
            )
            .add({
              inventoryItemId,

              inventoryItemName:
                inventoryData?.name || "",

              type: "sale",

              quantity: deductQty,

              previousStock,

              newStock,

              note: `Auto deducted from product sale (${productData?.name})`,

              createdBy: "system",

              createdAt: Date.now(),
            });

          console.log(
            `✅ Deducted ${deductQty} from ${inventoryData?.name}`
          );
        }
      }

      // ===============================
      // NORMAL PRODUCT
      // ===============================
      else {
        console.log(
          "Simple stock product:",
          productData?.name
        );

        const previousStock =
          Number(
            productData?.stockQty
          ) || 0;

        const newStock =
          previousStock - soldQty;

        await adminDb
          .collection("products")
          .doc(productId)
          .update({
            stockQty: newStock,
          });

        console.log(
          `✅ Reduced product stock: ${productData?.name}`
        );
      }
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