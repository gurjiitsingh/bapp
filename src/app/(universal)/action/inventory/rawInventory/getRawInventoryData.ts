"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

export async function getRawInventoryData(
  tx: FirebaseFirestore.Transaction,
  orderItems: { productId: string; quantity: number }[]
) {
  const updates: any[] = [];

  for (const item of orderItems) {
    const soldQty = Number(item.quantity) || 0;
    if (soldQty <= 0) continue;

    const productRef = adminDb.collection("products").doc(item.productId);
    const productSnap = await tx.get(productRef);

    if (!productSnap.exists) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    // ⚠️ IMPORTANT: move this into tx later if needed
    const recipeSnapshot = await adminDb
      .collection("productRecipes")
      .where("productId", "==", item.productId)
      .get();

    for (const doc of recipeSnapshot.docs) {
      const recipe = doc.data();

      const inventoryRef = adminDb
        .collection("inventoryItems")
        .doc(recipe.inventoryItemId);

      const invSnap = await tx.get(inventoryRef);

      if (!invSnap.exists) {
        throw new Error(`Inventory missing: ${recipe.inventoryItemId}`);
      }

      const invData = invSnap.data();
      const prev = Number(invData?.currentStock) || 0;

      const required =
        (Number(recipe.quantity) || 0) * soldQty;

      const next = prev - required;

      // 👉 STORE ONLY (NO WRITE)
      updates.push({
        ref: inventoryRef,
        inventoryItemId: recipe.inventoryItemId,
        itemName: invData?.name || "",
        required,
        prev,
        next,
      });
    }
  }

  return updates;
}