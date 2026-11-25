
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { ProductRecipeType } from "@/lib/types/ProductRecipeType";

export async function fetchProductRecipesByProductId(
  productId: string
): Promise<ProductRecipeType[]> {
  try {
    if (!productId?.trim()) {
      return [];
    }

    // Fetch only the selected product's recipe document
    const doc = await adminDb
      .collection("productRecipesF")
      .doc(productId)
      .get();

    if (!doc.exists) {
      return [];
    }

    const data = doc.data();

    // Get recipes array
    const recipes = Array.isArray(data?.recipes)
      ? data.recipes
      : [];

    // Convert createdAt
    let createdAt: string | null = null;

    if (data?.createdAt) {
      if (typeof data.createdAt.toDate === "function") {
        createdAt = data.createdAt.toDate().toISOString();
      } else if (typeof data.createdAt === "string") {
        createdAt = data.createdAt;
      }
    }

    // Convert recipe array into ProductRecipeType[]
    return recipes.map((recipe: any, index: number) => ({
      id: `${doc.id}_${index}`,

      productId: data?.productId ?? doc.id,

      productName: data?.productName ?? "",

      inventoryItemId: recipe.inventoryItemId ?? "",

      inventoryItemName: recipe.inventoryItemName ?? "",

      quantity: Number(recipe.quantity ?? 0),

      unit: recipe.unit ?? "",

      createdAt,
    }));

  } catch (error) {
    console.error(
      "Failed to fetch product recipes:",
      productId,
      error
    );

    return [];
  }
}
