
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { revalidatePath, revalidateTag } from "next/cache";

export async function updateProductExpenseForCost(
  productId: string,
  expenseMasterId: string,
  quantity: number,
  unit: string
) {
  try {
    if (
      !productId ||
      !expenseMasterId ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      !unit
    ) {
      return {
        success: false,
        message: "Please enter valid expense details",
      };
    }

    const recipeRef = adminDb
      .collection("productExpenseRecipes")
      .doc(productId);

    const expenseRef = adminDb
      .collection("expenseMaster")
      .doc(expenseMasterId);

    const result = await adminDb.runTransaction(async (transaction) => {
      const recipeSnap = await transaction.get(recipeRef);
      const expenseSnap = await transaction.get(expenseRef);

      if (!recipeSnap.exists) {
        return { success: false, message: "Product expense recipe not found" };
      }

      if (!expenseSnap.exists) {
        return { success: false, message: "Expense master item not found" };
      }

      const expenseData = expenseSnap.data();

      if (expenseData?.isActive === false) {
        return { success: false, message: "This expense is inactive" };
      }

      const cost = Number(expenseData?.cost ?? 0);

      if (!Number.isFinite(cost) || cost < 0) {
        return { success: false, message: "Invalid expense cost" };
      }

      const recipeData = recipeSnap.data();

      const expenses = Array.isArray(recipeData?.expenses)
        ? recipeData.expenses
        : [];

      const exists = expenses.some(
        (item: { expenseMasterId: string }) =>
          item.expenseMasterId === expenseMasterId
      );

      if (!exists) {
        return { success: false, message: "Expense not found in this product" };
      }

      const updatedExpenses = expenses.map((item: any) => {
        if (item.expenseMasterId !== expenseMasterId) {
          return item;
        }

        return {
          ...item,
          expenseName: expenseData?.name || "",
          quantity,
          unit,
          cost,
          totalCost: quantity * cost,
        };
      });

      const totalExpenseCost = updatedExpenses.reduce(
        (total: number, item: any) =>
          total + Number(item.totalCost || 0),
        0
      );

      transaction.update(recipeRef, {
        expenses: updatedExpenses,
        totalExpenseCost,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, message: "Expense updated successfully" };
    });

    if (result.success) {
      revalidateTag("product-expense-recipes", "max");
      revalidatePath("/admin/product-recipes");
      revalidatePath("/admin/product-recipes/form");
    }

    return result;
  } catch (error) {
    console.error("Product expense update failed:", error);

    return {
      success: false,
      message: "Could not update product expense",
    };
  }
}
