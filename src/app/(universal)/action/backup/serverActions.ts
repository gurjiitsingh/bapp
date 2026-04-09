// app/backup/serverActions.ts
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { ProductType } from "@/lib/types/productType";
import { writeFile } from "fs/promises";
import path from "path";

// EXPORT FUNCTION
export async function downloadProductsJSON() {
  const snapshot = await adminDb.collection("products").get();

  const products: ProductType[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ProductType[];

  // convert undefined -> null
  const cleaned = products.map((p) =>
    JSON.parse(JSON.stringify(p))
  );

  const filePath = path.join(process.cwd(), "public", "products-backup.json");

  await writeFile(filePath, JSON.stringify(cleaned, null, 2));

  return;
}

// IMPORT FUNCTION
export async function uploadProductsJSON(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file) throw new Error("No file uploaded");

  const text = await file.text();
  const products: ProductType[] = JSON.parse(text);

  const batch = adminDb.batch();

  products.forEach((product) => {
    const ref = adminDb.collection("products").doc(product.id);

    const { id, ...data } = product;

    batch.set(ref, data);
  });

  await batch.commit();

  return;
}
