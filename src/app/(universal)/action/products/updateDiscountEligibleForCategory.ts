"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidateTag } from "next/cache";

export async function updateDiscountEligibleForCategory(
  categoryId: string,
  discountEligible: boolean
) {
  if (!categoryId) {
    return {
      success: false,
      error: "Category is required",
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

  const batch = adminDb.batch();

  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, {
      discountEligible,
    });
  });

  await batch.commit();

 
revalidateTag("products", "max");
  return {
    success: true,
    updatedCount: snapshot.size,
  };
}