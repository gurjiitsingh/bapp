
"use server";

import { adminDb } from "@/lib/firebaseAdmin";

type UpdateProductRecipeInput = {
  productId: string;
  inventoryItemId: string;
  quantity: number;
  unit: string;
};

export async function updateProductRecipe(
  input: UpdateProductRecipeInput
) {
  try {
    const {
      productId,
      inventoryItemId,
      quantity,
      unit,
    } = input;

    if (!productId || !inventoryItemId) {
      return {
        success: false,
        message: "Product or inventory item is missing.",
      };
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return {
        success: false,
        message: "Please enter a valid quantity.",
      };
    }

    const recipeRef = adminDb
      .collection("productRecipes")
      .doc(productId);

    const result = await adminDb.runTransaction(async (tx) => {
      const snapshot = await tx.get(recipeRef);

      if (!snapshot.exists) {
        return false;
      }

      const data = snapshot.data();

      const recipes = Array.isArray(data?.recipes)
        ? data.recipes
        : [];

      const recipeExists = recipes.some(
        (recipe: any) =>
          recipe.inventoryItemId === inventoryItemId
      );

      if (!recipeExists) {
        return false;
      }

      const updatedRecipes = recipes.map((recipe: any) => {
        if (recipe.inventoryItemId !== inventoryItemId) {
          return recipe;
        }

        return {
          ...recipe,
          quantity,
          unit,
        };
      });

      tx.update(recipeRef, {
        recipes: updatedRecipes,
        updatedAt: new Date(),
      });

      return true;
    });

    if (!result) {
      return {
        success: false,
        message: "Recipe component not found.",
      };
    }

    return {
      success: true,
      message: "Recipe quantity updated successfully.",
    };

  } catch (error) {
    console.error("Update product recipe error:", error);

    return {
      success: false,
      message: "Failed to update recipe.",
    };
  }
}
