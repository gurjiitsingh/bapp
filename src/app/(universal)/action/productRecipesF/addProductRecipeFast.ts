"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

import {
  ProductRecipeType,
  newProductRecipeSchema,
} from "@/lib/types/ProductRecipeType";

import { revalidatePath, revalidateTag } from "next/cache";





export async function addProductRecipeFast(
  formData: FormData
) {
  try {
    // FORM VALUES
    const productId = formData.get(
      "productId"
    ) as string;

    const inventoryItemId = formData.get(
      "inventoryItemId"
    ) as string;

    const quantityRaw = formData.get(
      "quantity"
    ) as string | null;

    const unit = formData.get(
      "unit"
    ) as string;

    // SAFE NUMBER
    const quantity = quantityRaw
      ? parseFloat(quantityRaw)
      : 0;

    // VALIDATION OBJECT
    const receivedData = {
      productId,
      inventoryItemId,
      quantity,
      unit,
    };

    // ZOD VALIDATION
    const result =
      newProductRecipeSchema.safeParse(
        receivedData
      );

    if (!result.success) {
      const zodErrors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        zodErrors[String(issue.path[0])] =
          issue.message;
      });

      return {
        errors: zodErrors,
      };
    }

    // FETCH PRODUCT
    const productSnap = await adminDb
      .collection("productStock")
      .doc(productId)
      .get();

    if (!productSnap.exists) {
      return {
        errors: {
          product: "Product not found",
        },
      };
    }

    const productData = productSnap.data();

    // FETCH INVENTORY ITEM
    const inventorySnap = await adminDb
      .collection("inventoryItems")
      .doc(inventoryItemId)
      .get();

    if (!inventorySnap.exists) {
      return {
        errors: {
          inventory: "Inventory item not found",
        },
      };
    }

    const inventoryData = inventorySnap.data();

    // NEW RECIPE OBJECT
    const newRecipe = {
      inventoryItemId,
      inventoryItemName: inventoryData?.name || "",
      quantity,
      unit,
    };

    // PRODUCT RECIPE DOCUMENT
    // DOCUMENT ID = PRODUCT ID
    const recipeRef = adminDb
      .collection("productRecipesF")
      .doc(productId);

    // FIRESTORE TRANSACTION
    const transactionResult =
      await adminDb.runTransaction(
        async (transaction) => {
          const recipeSnap = await transaction.get(recipeRef);

          if (recipeSnap.exists) {
            const recipeData = recipeSnap.data();

            const recipes = Array.isArray(
              recipeData?.recipes
            )
              ? recipeData.recipes
              : [];

            // CHECK DUPLICATE
            const duplicate = recipes.some(
              (recipe: { inventoryItemId: string }) =>
                recipe.inventoryItemId === inventoryItemId
            );

            if (duplicate) {
              return {
                duplicate: true,
              };
            }

            // APPEND RECIPE
            const updatedRecipes = [
              ...recipes,
              newRecipe,
            ];

            transaction.update(recipeRef, {
              recipes: updatedRecipes,
              updatedAt:
                admin.firestore.FieldValue.serverTimestamp(),
            });
          } else {
            // CREATE FIRST DOCUMENT
            transaction.set(recipeRef, {
              productId,
              productName: productData?.name || "",
              recipes: [newRecipe],
              createdAt:
                admin.firestore.FieldValue.serverTimestamp(),
              updatedAt:
                admin.firestore.FieldValue.serverTimestamp(),
            });
          }

          return {
            duplicate: false,
          };
        }
      );

    // DUPLICATE RESPONSE
    if (transactionResult.duplicate) {
      return {
        errors: {
          duplicate: "Ingredient already added to recipe",
        },
      };
    }

    console.log("Product recipe saved:", {
      productId,
      inventoryItemId,
      quantity,
    });

    // REVALIDATE
    revalidateTag("product-recipes", "max");

    revalidatePath("/admin/product-recipes");
    revalidatePath("/admin/product-recipes/form");

    return {
      success: true,
      message: "Recipe ingredient added successfully",
      id: productId,
    };
  } catch (error) {
    console.error(
      "❌ Product recipe save failed:",
      error
    );

    return {
      errors: {
        general: "Could not save recipe ingredient",
      },
    };
  }
}