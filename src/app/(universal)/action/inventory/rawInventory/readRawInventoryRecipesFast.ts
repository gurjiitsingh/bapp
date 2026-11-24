

"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function readRawInventoryRecipesFast(
  tx: FirebaseFirestore.Transaction,
  orderItems: {
    productId: string;
    quantity: number;
  }[]
) {


  const updates: any[] = [];

  for (const item of orderItems) {
    const soldQty = Number(item.quantity) || 0;

    if (soldQty <= 0) continue;

    // FETCH PRODUCT
    const productRef = adminDb
      .collection("productStock")
      .doc(item.productId);

    const productSnap = await tx.get(productRef);

    if (!productSnap.exists) {
      throw new Error(
        `Product not found: ${item.productId}`
      );
    }

    // FETCH RECIPE DOCUMENT DIRECTLY
    // DOCUMENT ID = PRODUCT ID
    const recipeRef = adminDb
      .collection("productRecipes")
      .doc(item.productId);

    const recipeSnap = await tx.get(recipeRef);

    if (!recipeSnap.exists) {
      continue;
    }

    const recipeData = recipeSnap.data();

    // GET RECIPES ARRAY
    const recipes = Array.isArray(recipeData?.recipes)
      ? recipeData.recipes
      : [];

    // LOOP THROUGH RECIPE OBJECTS
    for (const recipe of recipes) {
      const inventoryItemId =
        recipe.inventoryItemId;

      if (!inventoryItemId) continue;

      // FETCH INVENTORY ITEM
      const inventoryRef = adminDb
        .collection("inventoryItems")
        .doc(inventoryItemId);

      const invSnap = await tx.get(inventoryRef);

      if (!invSnap.exists) {
        throw new Error(
          `Inventory missing: ${inventoryItemId}`
        );
      }

      const invData = invSnap.data()!;

      const beforeStock =
        Number(invData.currentStock) || 0;

      // CALCULATE REQUIRED QUANTITY
      const required =
        (Number(recipe.quantity) || 0) * soldQty;

      const afterStock =
        beforeStock - required;

      // PREPARE INVENTORY UPDATE
      updates.push({
        ref: inventoryRef,

        // REQUIRED FIELDS
        inventoryItemId,
        inventoryItemName: invData.name || "",
        quantity: required,
        consumption: required,

        // OTHER REQUIRED FIELDS
        purchaseQuantity: 0,

        purchaseUnit:
          invData.purchaseUnit ||
          invData.consumptionUnit ||
          "gm",

        conversionFactor:
          Number(invData.conversionFactor) || 1,

        transactionUnit:
          invData.consumptionUnit || "gm",

        consumptionUnit:
          invData.consumptionUnit || "gm",

        // COST
        averageCost:
          Number(invData.averageCost) || 0,

        stockValue:
          Number(invData.stockValue) || 0,

        unitCost:
          Number(invData.averageCost) || 0,

        costPerUnit:
          Number(invData.averageCost) || 0,

        purchaseUnitCost: 0,

        // STOCK
        prev: beforeStock,
        next: afterStock,
      });
    }
  }

  return updates;
}

