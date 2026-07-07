"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

type UpdateFinishedStockParams = {
  tx: FirebaseFirestore.Transaction;

  productId: string;

  mode: "SET" | "INCREASE" | "DECREASE";

  quantity: number;

  allowNegativeStock?: boolean;
};

export async function updateFinishedStock({
  tx,
  productId,
  mode,
  quantity,
  allowNegativeStock = false,
}: UpdateFinishedStockParams) {
  const now = admin.firestore.FieldValue.serverTimestamp();

  const productRef = adminDb
    .collection("productStock")
    .doc(productId);

  const snap = await tx.get(productRef);

  if (!snap.exists) {
    throw new Error("Product not found");
  }

  const product = snap.data()!;

  const beforeStock = Number(product.currentStock ?? 0);

  let afterStock = beforeStock;

  switch (mode) {
    case "SET":
      afterStock = quantity;
      break;

    case "INCREASE":
      afterStock = beforeStock + quantity;
      break;

    case "DECREASE":
      afterStock = beforeStock - quantity;
      break;
  }

  if (!allowNegativeStock && afterStock < 0) {
    throw new Error("Insufficient stock");
  }

  tx.update(productRef, {
    currentStock: afterStock,
    stockStatus: afterStock > 0 ? "in_stock" : "out_of_stock",
    updatedAt: now,
  });

  return {
    beforeStock,
    afterStock,
  };
}