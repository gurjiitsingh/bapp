
"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function fetchProductExpenseByProductId(
  productId: string
) {
  try {
    if (!productId) {
      return null;
    }

    const snapshot = await adminDb
      .collection("productExpenseRecipes")
      .where("productId", "==", productId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
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
      productId: data.productId ?? productId,
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
  } catch (error) {
    console.error(
      "Error fetching product expense recipe by product ID:",
      error
    );

    return null;
  }
}
