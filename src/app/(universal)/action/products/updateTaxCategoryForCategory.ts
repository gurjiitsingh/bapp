"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidateTag } from "next/cache";

export async function updateTaxCategoryForCategory(
  categoryId: string,
  taxCategory: "LIQUOR_VAT" | "FOOD_GST"
) {
  if (!categoryId) {
    return {
      success: false,
      error: "Category is required",
    };
  }

  if (
    taxCategory !== "LIQUOR_VAT" &&
    taxCategory !== "FOOD_GST"
  ) {
    return {
      success: false,
      error: "Invalid tax category",
    };
  }

  const snapshot = await adminDb
    .collection("products")
    .where("categoryId", "==", categoryId)
    .get();

  if (snapshot.empty) {
    return {
      success: true,
      updatedCount: 0,
    };
  }

  const docs = snapshot.docs;
  let updatedCount = 0;

  // Firestore maximum: 500 writes per batch.
  for (let i = 0; i < docs.length; i += 500) {
    const batch = adminDb.batch();
    const chunk = docs.slice(i, i + 500);

    chunk.forEach((doc) => {
      batch.update(doc.ref, {
        taxCategory,
      });
    });

    await batch.commit();
    updatedCount += chunk.length;
  }

  revalidateTag("products", "max");

  return {
    success: true,
    updatedCount,
  };
}