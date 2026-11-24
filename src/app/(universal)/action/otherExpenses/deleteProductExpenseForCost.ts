
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { revalidatePath, revalidateTag } from "next/cache";

export async function deleteProductExpenseForCost(
  productId: string,
  expenseMasterId: string
) {
  try {
    if (!productId || !expenseMasterId) {
      return {
        success: false,
        message: "Invalid product or expense",
      };
    }

    const recipeRef = adminDb
      .collection("productExpenseRecipes")
      .doc(productId);

    const result = await adminDb.runTransaction(async (transaction) => {
      const recipeSnap = await transaction.get(recipeRef);

      if (!recipeSnap.exists) {
        return {
          success: false,
          message: "Product expense recipe not found",
        };
      }

      const recipeData = recipeSnap.data();

      const expenses = Array.isArray(recipeData?.expenses)
        ? recipeData.expenses
        : [];

      const updatedExpenses = expenses.filter(
        (item: { expenseMasterId: string }) =>
          item.expenseMasterId !== expenseMasterId
      );

      if (updatedExpenses.length === expenses.length) {
        return {
          success: false,
          message: "Expense not found",
        };
      }

      const totalExpenseCost = updatedExpenses.reduce(
        (total: number, item: any) =>
          total + Number(item.totalCost || 0),
        0
      );

      // Keep the product document even when no expenses remain.
      transaction.update(recipeRef, {
        expenses: updatedExpenses,
        totalExpenseCost,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        message: "Expense deleted successfully",
      };
    });

    if (result.success) {
      revalidateTag("product-expense-recipes", "max");
      revalidatePath("/admin/product-recipes");
      revalidatePath("/admin/product-recipes/form");
    }

    return result;
  } catch (error) {
    console.error("Product expense delete failed:", error);

    return {
      success: false,
      message: "Could not delete product expense",
    };
  }
}
