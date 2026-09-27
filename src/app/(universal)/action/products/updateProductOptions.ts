"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export type ProductOptionValueType = {
  id: string;
  name: string;
  color?: string;
  sortOrder: number;
};

export type ProductOptionType = {
  id: string;
  name: string;
  values: ProductOptionValueType[];
};

export async function updateProductOptions(
  productId: string,
  options: ProductOptionType[]
) {
    console.log("opeiont----------------",options)
  try {
    if (!productId) {
      throw new Error("Product ID is required.");
    }

    const cleanOptions = options
      .filter((option) => option.name.trim() !== "")
      .map((option) => ({
        id: option.id,
        name: option.name.trim(),
        values: option.values
          .filter((value) => value.name.trim() !== "")
          .map((value, index) => ({
            id: value.id,
            name: value.name.trim(),
            sortOrder: index + 1,
          })),
      }));

    await adminDb
      .collection("products")
      .doc(productId)
      .update({
        options: cleanOptions,
      });

    return {
      success: true,
      options: cleanOptions,
    };
  } catch (error) {
    console.error("updateProductOptions error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update product options.",
    };
  }
}