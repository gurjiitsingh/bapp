
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { StockLocationType } from "@/lib/types/distribution/StockLocationType";
import { StorageType } from "@/lib/types/distribution/StorageType";

type GetStockLocationProps = {
  tx: FirebaseFirestore.Transaction;
  productId: string;
  locationType: StorageType;
  locationRef: string;
};

export async function getStockLocation({
  tx,
  productId,
  locationType,
  locationRef,
}: GetStockLocationProps): Promise<StockLocationType | null> {

  const id = `${productId}_${locationType}_${locationRef}`;

  console.log("========== GET STOCK LOCATION ==========");
  console.log("Expected ID:", id);
  console.log("Product ID:", productId);
  console.log("Location Type:", locationType);
  console.log("Location Ref:", locationRef);

  const ref = adminDb.collection("stockLocation").doc(id);

  const snap = await tx.get(ref);

  if (!snap.exists) {

    console.log("EXACT STOCK DOCUMENT NOT FOUND");

    // Diagnostic: find all stock documents for this product
    const query = adminDb
      .collection("stockLocation")
      .where("productId", "==", productId);

    const productStocks = await tx.get(query);

    console.log("OTHER STOCK DOCUMENTS:");

    productStocks.docs.forEach((doc) => {
      console.log({
        documentId: doc.id,
        ...doc.data(),
      });
    });

    console.log("========================================");

    return null;
  }

  console.log("STOCK FOUND:", snap.data());

  return {
    id: snap.id,
    ...snap.data(),
  } as StockLocationType;
}
