"use server";

import { adminDb } from "@/lib/firebaseAdmin";
 
 import { StockLocationType } from "@/lib/types/distribution/StockLocationType";
import { StorageType } from "@/lib/types/distribution/StorageType";
import admin from "firebase-admin";

type AddStockLocationProps = {
  tx: FirebaseFirestore.Transaction;

  stockLocation: FirebaseFirestore.DocumentSnapshot;

  productId: string;
  productName: string;

  categoryId?: string;
  categoryName?: string;

  productMode: "raw_stock" | "finished_stock" | "simple";

  locationType: StorageType;
  locationRef: string;

  quantity: number;
};



export async function addStockLocationTx({
  tx,
  stockLocation,

  productId,
  productName,

  productMode,

  locationType,
  locationRef,

  quantity,
}: AddStockLocationProps) {
  const id = `${productId}_${locationType}_${locationRef}`;

  const ref = stockLocation.ref;

  if (!stockLocation.exists) {
    const data: StockLocationType = {
      id,
      productId,
      productName,

    //   categoryId,
    //   categoryName,

      productMode,

      locationType,
      locationRef,

      quantity,

      updatedAt: Date.now(),
    };

    tx.set(ref, data);
    return;
  }

  tx.update(ref, {
    quantity: admin.firestore.FieldValue.increment(quantity),
    updatedAt: Date.now(),
  });
}