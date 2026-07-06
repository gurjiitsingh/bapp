"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { StockMovementType } from "@/lib/types/distribution/StockMovementType";



export async function getStockMovements() {
  try {
    const snapshot = await adminDb
      .collection("stockMovements")
      .orderBy("createdAt", "desc")
      .get();

return snapshot.docs.map((doc) => {
  const data = doc.data();

 

  return {
    id: doc.id,
    ...data,
  } as StockMovementType;
});
  } catch (error) {
    console.error(error);
    return [];
  }
}