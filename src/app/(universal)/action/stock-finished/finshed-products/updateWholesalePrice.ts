"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";

type UpdateWholesalePriceInput = {
  id: string;
  wholesalePrice: number | null;
};

export async function updateWholesalePrice({
  id,
  wholesalePrice,
}: UpdateWholesalePriceInput) {
  try {
    if (!id) {
      return {
        success: false,
        message: "Product ID is required",
      };
    }

    const docRef = adminDb
      .collection("productStock")
      .doc(id);

    const snap = await docRef.get();

    if (!snap.exists) {
      return {
        success: false,
        message: "Product not found",
      };
    }

    await docRef.update({
      wholesalePrice:
        wholesalePrice === null
          ? null
          : Number(wholesalePrice),
      updatedAt: Date.now(),
    });

    // revalidateTag("products", "max");
    // revalidatePath("/admin/products");
    //revalidatePath("/admin/stock-finished");

    return {
      success: true,
      message: "Wholesale price updated",
    };
  } catch (error) {
    console.error(
      "❌ Error updating wholesale price:",
      error
    );

    return {
      success: false,
      message: "Failed to update wholesale price",
    };
  }
}