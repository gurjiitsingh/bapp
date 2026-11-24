
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";



 

export async function fetchProductExpenseFast() {
  try {
    const snapshot = await adminDb
      .collection("productExpenseRecipes")
      .get();

    const recipes = snapshot.docs.map((doc) => {
      const data = doc.data();

      const expenses = Array.isArray(data.expenses)
        ? data.expenses.map((expense: any) => ({
            expenseMasterId: expense.expenseMasterId ?? "",
            expenseName: expense.expenseName ?? "",
            quantity: Number(expense.quantity ?? 0),
            unit: expense.unit ?? "",
            cost: Number(expense.cost ?? 0),
            totalCost: Number(expense.totalCost ?? 0),
          }))
        : [];

      return {
        id: doc.id,

        productId: data.productId ?? doc.id,

        productName: data.productName ?? "",

        expenses,

        totalExpenseCost: Number(
          data.totalExpenseCost ??
          expenses.reduce(
            (total: number, expense: any) =>
              total + expense.totalCost,
            0
          )
        ),

        createdAt:
          data.createdAt?.toDate?.()?.toISOString() ?? null,

        updatedAt:
          data.updatedAt?.toDate?.()?.toISOString() ?? null,
      };
    });

    return recipes;

  } catch (error) {
    console.error(
      "Error fetching product expense recipes:",
      error
    );

    return [];
  }
}


export async function fetchProductExpense() {
  try {
    const snapshot = await adminDb
      .collection("productExpenseRecipes")
      .get();

    const recipes = snapshot.docs.map((doc) => {
      const data = doc.data();
 
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