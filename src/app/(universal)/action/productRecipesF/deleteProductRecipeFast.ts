
"use server";

import { adminDb } from "@/lib/firebaseAdmin";

type DeleteProductRecipeInput = {
  productId: string;
  inventoryItemId: string;
};

export async function deleteProductRecipeFast(
  input: DeleteProductRecipeInput
) {
  try {
    const { productId, inventoryItemId } = input;

    if (!productId || !inventoryItemId) {
      return {
        success: false,
        message: "Product or inventory item is missing.",
      };
    }

    const recipeRef = adminDb
      .collection("productRecipesF")
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

      const updatedRecipes = recipes.filter(
        (recipe: any) =>
          recipe.inventoryItemId !== inventoryItemId
      );

      if (updatedRecipes.length === recipes.length) {
        return false;
      }

      if (updatedRecipes.length === 0) {
        tx.delete(recipeRef);
      } else {
        tx.update(recipeRef, {
          recipes: updatedRecipes,
          updatedAt: new Date(),
        });
      }

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
      message: "Recipe component deleted successfully.",
    };

  } catch (error) {
    console.error("Delete product recipe error:", error);

    return {
      success: false,
      message: "Failed to delete recipe component.",
    };
  }
}
