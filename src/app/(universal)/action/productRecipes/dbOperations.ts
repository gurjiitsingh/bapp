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
      .collection("productRecipes")
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



export async function fetchProductRecipesFast(): Promise<
  ProductRecipeType[]
> {
  try {
    const snapshot = await adminDb
      .collection("productRecipes")
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



export async function addProductRecipe(
  formData: FormData
) {
   
console.log("data--------------",formData)
  try {
    // FORM VALUES
    const productId = formData.get(
      "productId"
    ) as string;

    const inventoryItemId =
      formData.get(
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
      const zodErrors: Record<
        string,
        string
      > = {};

      result.error.issues.forEach(
        (issue) => {
          zodErrors[
            issue.path[0]
          ] = issue.message;
        }
      );

      return {
        errors: zodErrors,
      };
    }

    // FETCH PRODUCT
    const productSnap =
      await adminDb
        .collection("productStock")
        .doc(productId)
        .get();

    if (!productSnap.exists) {
      return {
        errors: {
          product:
            "Product not found",
        },
      };
    }

    const productData =
      productSnap.data();

    // FETCH INVENTORY ITEM
    const inventorySnap =
      await adminDb
        .collection("inventoryItems")
        .doc(inventoryItemId)
        .get();

    if (!inventorySnap.exists) {
      return {
        errors: {
          inventory:
            "Inventory item not found",
        },
      };
    }

    const inventoryData =
      inventorySnap.data();

    // PREVENT DUPLICATE RECIPE
    const existingRecipe =
      await adminDb
        .collection("productRecipes")
        .where(
          "productId",
          "==",
          productId
        )
        .where(
          "inventoryItemId",
          "==",
          inventoryItemId
        )
        .limit(1)
        .get();

    if (!existingRecipe.empty) {
      return {
        errors: {
          duplicate:
            "Ingredient already added to recipe",
        },
      };
    }

    // FIRESTORE DATA
    const data: Omit<
      ProductRecipeType,
      "id"
    > = {
      productId,

      productName:
        productData?.name || "",

      inventoryItemId,

      inventoryItemName:
        inventoryData?.name || "",

      quantity,

      unit,

      createdAt:  admin.firestore.FieldValue.serverTimestamp(),
    };

    console.log(
      "recipe data-------------",
      data
    );

    // SAVE
    const docRef = await adminDb
      .collection("productRecipes")
      .add(data);

    // REVALIDATE
    revalidateTag(
      "product-recipes",
      "max"
    );

    revalidatePath(
      "/admin/product-recipes"
    );

    revalidatePath(
      "/admin/product-recipes/form"
    );

    return {
      success: true,

      message:
        "Recipe ingredient added successfully",

      id: docRef.id,
    };
  } catch (error) {
    console.error(
      "❌ Product recipe save failed:",
      error
    );

    return {
      errors: {
        general:
          "Could not save recipe ingredient",
      },
    };
  }
}




export async function fetchProductRecipes(): Promise<
  ProductRecipeType[]
> {
  try {
    const snapshot = await adminDb
      .collection("productRecipes")
      .orderBy("productName")
      .get();

    if (snapshot.empty) return [];

    return snapshot.docs.map((doc) => {
      const data = doc.data() as Partial<ProductRecipeType> & {
        createdAt?: any;
      };

      let createdAt: string | null = null;

      if (data.createdAt) {
        if (
          typeof data.createdAt.toDate ===
          "function"
        ) {
          createdAt =
            data.createdAt
              .toDate()
              .toISOString();
        } else if (
          typeof data.createdAt ===
          "string"
        ) {
          createdAt = data.createdAt;
        }
      }

      return {
        id: doc.id,

        productId:
          data.productId ?? "",

        productName:
          data.productName ?? "",

        inventoryItemId:
          data.inventoryItemId ?? "",

        inventoryItemName:
          data.inventoryItemName ??
          "",

        quantity:
          data.quantity ?? 0,

        unit: data.unit ?? "",

        createdAt,
      };
    });
  } catch (error) {
    console.error(
      "❌ Failed to fetch product recipes:",
      error
    );

    return [];
  }
}