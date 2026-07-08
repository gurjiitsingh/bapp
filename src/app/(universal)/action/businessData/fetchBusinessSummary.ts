"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function fetchBusinessSummary() {
  try {
    let rawMaterialValue = 0;

    const snapshot = await adminDb
      .collection("inventoryItems")
      .where("isActive", "==", true)
      .get();

    snapshot.forEach((doc) => {
      const data = doc.data();

      rawMaterialValue += Number(data.stockValue || 0);
    });

    return {
      success: true,
      data: {
        rawMaterialValue,
        finishedProductValue: 0,
        customerDue: 0,
        supplierDue: 0,
        cashInHand: 0,
      },
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to load dashboard summary.",
    };
  }
}