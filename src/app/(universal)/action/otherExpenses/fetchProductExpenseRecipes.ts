
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export async function fetchProductExpense() {
  try {
    const snapshot = await adminDb
      .collection("productExpenseRecipes")
      .get();

    const recipes = snapshot.docs.map((doc) => {
      const data = doc.data();
console.log("data-------------------------1",data)
      return {
        id: doc.id,
        productId: data.productId ?? "",
        productName: data.productName ?? "",
        expenseMasterId: data.expenseMasterId ?? "",
        expenseName: data.expenseName ?? "",
        quantity: Number(data.quantity ?? 0),
        unit: data.unit ?? "",
        cost: Number(data.cost ?? 0),
        totalCost: Number(data.totalCost ?? 0),
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
      };
    });

    return recipes;
  } catch (error) {
    console.error("Error fetching product expense recipes:", error);
    return [];
  }
}