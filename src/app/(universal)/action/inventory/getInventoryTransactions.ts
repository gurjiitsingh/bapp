"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function getInventoryTransactions() {
  try {
    const snapshot = await adminDb
      .collection("inventoryTransactions")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

const transactions = snapshot.docs.map((doc) => {
  const data = doc.data();

  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?._seconds
      ? data.createdAt._seconds * 1000
      : null,
  };
});

  
  

    return {
      success: true,
      data: transactions,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      data: [],
    };
  }
}