import { adminDb } from "@/lib/firebaseAdmin";
import { ProductType } from "@/lib/types/productType";

export async function GET() {
  const snapshot = await adminDb.collection("products").get();

  const products: ProductType[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ProductType[];

  // clean undefined → null
  const cleaned = products.map((p) =>
    JSON.parse(JSON.stringify(p))
  );

  return new Response(JSON.stringify(cleaned, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=products-backup.json",
    },
  });
}