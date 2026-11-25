"use server";

import { adminDb  } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
type OldRecipeType = {
  productId?: string;
  productName?: string;
  inventoryItemId?: string;
  inventoryItemName?: string;
  quantity?: number;
  unit?: string;
};

type RecipeType = {
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number;
  unit: string;
};

export async function migrateProductRecipesToFast() {
  try {
    console.log("Starting product recipe migration...");

    // 1. FETCH ALL OLD RECIPE DOCUMENTS
    const oldRecipesSnap = await adminDb
      .collection("productRecipes")
      .get();

    if (oldRecipesSnap.empty) {
      return {
        success: true,
        message: "No old recipes found",
        migratedProducts: 0,
        migratedRecipes: 0,
      };
    }

    // 2. GROUP RECIPES BY PRODUCT ID
    const groupedRecipes = new Map<
      string,
      {
        productName: string;
        recipes: RecipeType[];
      }
    >();

    oldRecipesSnap.docs.forEach((doc) => {
      const data = doc.data() as OldRecipeType;

      const productId = data.productId;
      const inventoryItemId = data.inventoryItemId;

      if (!productId || !inventoryItemId) {
        console.warn("Skipping invalid recipe document:", doc.id);
        return;
      }

      if (!groupedRecipes.has(productId)) {
        groupedRecipes.set(productId, {
          productName: data.productName || "",
          recipes: [],
        });
      }

      const productRecipes = groupedRecipes.get(productId)!;

      // 3. PREVENT DUPLICATES IN SOURCE DATA
      const alreadyExists = productRecipes.recipes.some(
        (recipe) =>
          recipe.inventoryItemId === inventoryItemId
      );

      if (alreadyExists) {
        console.warn(
          "Duplicate source ingredient skipped:",
          productId,
          inventoryItemId
        );

        return;
      }

      // 4. CONVERT OLD RECIPE TO NEW ARRAY OBJECT
      productRecipes.recipes.push({
        inventoryItemId,
        inventoryItemName: data.inventoryItemName || "",
        quantity: Number(data.quantity) || 0,
        unit: data.unit || "",
      });
    });

    let migratedProducts = 0;
    let migratedRecipes = 0;
    let skippedDuplicates = 0;

    // 5. MIGRATE EACH PRODUCT
    for (const [productId, productData] of groupedRecipes.entries()) {
      const recipeRef = adminDb
        .collection("productRecipesF")
        .doc(productId);

      const result = await adminDb.runTransaction(
        async (transaction) => {
          const recipeSnap = await transaction.get(recipeRef);

          const existingData = recipeSnap.exists
            ? recipeSnap.data()
            : undefined;

          const existingRecipes: RecipeType[] = Array.isArray(
            existingData?.recipes
          )
            ? existingData.recipes
            : [];

          const updatedRecipes = [...existingRecipes];

          let addedCount = 0;
          let duplicateCount = 0;

          // 6. MERGE OLD RECIPES WITH EXISTING NEW RECIPES
          for (const oldRecipe of productData.recipes) {
            const duplicate = updatedRecipes.some(
              (recipe) =>
                recipe.inventoryItemId ===
                oldRecipe.inventoryItemId
            );

            if (duplicate) {
              duplicateCount++;
              continue;
            }

            updatedRecipes.push(oldRecipe);
            addedCount++;
          }

          // 7. SAVE DESTINATION DOCUMENT
          if (recipeSnap.exists) {
            transaction.update(recipeRef, {
              recipes: updatedRecipes,
              updatedAt:
                admin.firestore.FieldValue.serverTimestamp(),
            });
          } else {
            transaction.set(recipeRef, {
              productId,
              productName:
                existingData?.productName ||
                productData.productName ||
                "",
              recipes: updatedRecipes,
              createdAt:
                admin.firestore.FieldValue.serverTimestamp(),
              updatedAt:
                admin.firestore.FieldValue.serverTimestamp(),
            });
          }

          return {
            addedCount,
            duplicateCount,
          };
        }
      );

      migratedProducts++;
      migratedRecipes += result.addedCount;
      skippedDuplicates += result.duplicateCount;

      console.log("Migrated product:", {
        productId,
        addedRecipes: result.addedCount,
        skippedDuplicates: result.duplicateCount,
      });
    }

    console.log("Product recipe migration completed:", {
      migratedProducts,
      migratedRecipes,
      skippedDuplicates,
    });

    return {
      success: true,
      message: "Product recipes migrated successfully",
      migratedProducts,
      migratedRecipes,
      skippedDuplicates,
    };
  } catch (error) {
    console.error("Product recipe migration failed:", error);

    return {
      success: false,
      message: "Product recipe migration failed",
    };
  }
}