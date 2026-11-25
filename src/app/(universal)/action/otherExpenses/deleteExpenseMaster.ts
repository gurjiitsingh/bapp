
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";

export async function deleteExpenseMaster(id: string) {
  try {
    if (!id?.trim()) {
      return {
        success: false,
        message: "Expense ID is required",
      };
    }

    const expenseRef = adminDb.collection("expenseMaster").doc(id);
    const expenseDoc = await expenseRef.get();

    if (!expenseDoc.exists) {
      return {
        success: false,
        message: "Expense not found",
      };
    }

    // Check product expense recipes
    const recipesSnapshot = await adminDb
      .collection("productExpenseRecipes")
      .get();

    const isUsed = recipesSnapshot.docs.some((doc) => {
      const expenses = doc.data().expenses;

      if (!Array.isArray(expenses)) return false;

      return expenses.some((item: Record<string, unknown>) => {
        return (
          item.expenseMasterId === id ||
          item.expenseId === id ||
          item.id === id
        );
      });
    });

    if (isUsed) {
      return {
        success: false,
        message:
          "This expense is already used in product recipes. You cannot delete it.",
      };
    }

    await expenseRef.delete();

    revalidateTag("expense-master", "max");
    revalidatePath("/admin/expense-master");

    return {
      success: true,
      message: "Expense deleted successfully",
    };

  } catch (error) {
    console.error("DELETE EXPENSE MASTER ERROR:", error);

    return {
      success: false,
      message: "Failed to delete expense",
    };
  }
}
