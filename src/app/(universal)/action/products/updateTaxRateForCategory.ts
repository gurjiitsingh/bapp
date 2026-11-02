"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidateTag } from "next/cache";

export async function updateTaxRateForCategory(
  categoryId: string,
  taxRate: number,
  taxRate1: number
) {
  if (!categoryId) {
    return { success: false, error: "Category is required" };
  }

  if (
    !Number.isFinite(taxRate) ||
    taxRate < 0 ||
    taxRate > 100
  ) {
    return { success: false, error: "Tax Rate must be between 0 and 100" };
  }

  if (
    !Number.isFinite(taxRate1) ||
    taxRate1 < 0 ||
    taxRate1 > 100
  ) {
    return { success: false, error: "Tax Rate 1 must be between 0 and 100" };
  }

  const snapshot = await adminDb
    .collection("products")
    .where("categoryId", "==", categoryId)
    .get();

  if (snapshot.empty) {
    return { success: true, updatedCount: 0 };
  }

  const docs = snapshot.docs;
  let updatedCount = 0;

  // Firestore supports a maximum of 500 writes per batch.
  for (let i = 0; i < docs.length; i += 500) {
    const batch = adminDb.batch();
    const chunk = docs.slice(i, i + 500);

    chunk.forEach((doc) => {
      batch.update(doc.ref, {
        taxRate,
        taxRate1,
      });
    });

    await batch.commit();
    updatedCount += chunk.length;
  }

  revalidateTag("products", "max");

  return { success: true, updatedCount };
}