
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { ProductStockType } from "@/lib/types/productStockType";

export async function readFinishedProductData({
  tx,
  productId,
}: {
  tx: FirebaseFirestore.Transaction;
  productId: string;
}) {
  console.log("========== readFinishedProductData ==========");
  console.log("Product ID:", productId);

  const productRef = adminDb
    .collection("productStock")
    .doc(productId);

  const snap = await tx.get(productRef);

  console.log("Document exists:", snap.exists);

  if (!snap.exists) {
    throw new Error(
      `Product not found in productStock. Document ID: ${productId}`
    );
  }

  const product = snap.data() as ProductStockType;

  console.log("Product data:", product);
  console.log("currentStock:", product.currentStock);
  console.log("Product name:", product.name);

  return {
    ref: productRef,
    ...product,
    beforeStock: Number(product.currentStock) || 0,
    productPrice: Number(product.sellingPrice) || 0,
    productName: product.name || "",
  };
}
