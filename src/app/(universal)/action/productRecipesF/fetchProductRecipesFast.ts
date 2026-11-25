"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

import {
  ProductRecipeType,
  newProductRecipeSchema,
} from "@/lib/types/ProductRecipeType";

import { revalidatePath, revalidateTag } from "next/cache";



export async function fetchProductRecipesFast(): Promise<
  ProductRecipeType[]
> {
  try {
    const snapshot = await adminDb
      .collection("productRecipesF")
      .orderBy("productName")
      .get();

    if (snapshot.empty) return [];

    const allRecipes: ProductRecipeType[] = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      // CONVERT CREATED DATE
      let createdAt: string | null = null;

      if (data.createdAt) {
        if (
          typeof data.createdAt.toDate === "function"
        ) {
          createdAt = data.createdAt
            .toDate()
            .toISOString();
        } else if (
          typeof data.createdAt === "string"
        ) {
          createdAt = data.createdAt;
        }
      }

      // GET RECIPES ARRAY
      const recipes = Array.isArray(data.recipes)
        ? data.recipes
        : [];

      // CONVERT ARRAY INTO FLAT PRODUCT RECIPE LIST
      recipes.forEach((recipe: any, index: number) => {
        allRecipes.push({
          id: `${doc.id}_${index}`,

          productId: data.productId ?? doc.id,

          productName: data.productName ?? "",

          inventoryItemId:
            recipe.inventoryItemId ?? "",

          inventoryItemName:
            recipe.inventoryItemName ?? "",

          quantity: Number(recipe.quantity ?? 0),

          unit: recipe.unit ?? "",

          createdAt,
        });
      });
    });

    return allRecipes;

  } catch (error) {
    console.error(
      "❌ Failed to fetch product recipes:",
      error
    );

    return [];
  }
}