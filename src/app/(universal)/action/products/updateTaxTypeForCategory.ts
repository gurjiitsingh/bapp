"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidateTag } from "next/cache";

export async function updateTaxTypeForCategory(
  categoryId: string,
  taxType: "inclusive" | "exclusive",
  taxType1: "inclusive" | "exclusive"
) {
  if (!categoryId) {
    return {
      success: false,
      error: "Category is required",
    };
  }

  if (
    taxType !== "inclusive" &&
    taxType !== "exclusive"
  ) {
    return {
      success: false,
      error: "Invalid tax type for taxType",
    };
  }

  if (
    taxType1 !== "inclusive" &&
    taxType1 !== "exclusive"
  ) {
    return {
      success: false,
      error: "Invalid tax type for taxType1",
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

  // Firestore allows a maximum of 500 writes per batch.
  for (let i = 0; i < docs.length; i += 500) {
    const batch = adminDb.batch();
    const chunk = docs.slice(i, i + 500);

    chunk.forEach((doc) => {
      batch.update(doc.ref, {
        taxType,
        taxType1,
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