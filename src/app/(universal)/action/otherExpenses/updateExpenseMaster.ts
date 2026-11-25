"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { newExpenseMasterSchema } from "@/app/(universal)/action/otherExpenses/OtherExpenseType";
import { revalidatePath, revalidateTag } from "next/cache";
// =====================================
// UPDATE EXPENSE MASTER
// =====================================


// export async function updateExpenseMaster(
//   id: string,
//   formData: FormData
// ): Promise<ExpenseMasterResult> {


export async function updateExpenseMaster(
  id: string,
  formData: FormData
) {
  try {
    if (!id?.trim()) {
      return {
        errors: {
          general: "Expense ID is required",
        },
      };
    }

    const rawData = {
      name: String(formData.get("name") ?? "").trim(),
      cost: Number(formData.get("cost")),
      unit: String(formData.get("unit") ?? ""),
      description: String(formData.get("description") ?? ""),
      isFavourite: formData.get("isFavourite") === "true",
      isActive: formData.get("isActive") === "true",
    };

    const validation = newExpenseMasterSchema.safeParse(rawData);

    if (!validation.success) {
      return {
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const expenseRef = adminDb.collection("expenseMaster").doc(id);
    const expenseDoc = await expenseRef.get();

    if (!expenseDoc.exists) {
      return {
        errors: {
          general: "Expense not found",
        },
      };
    }

    await expenseRef.update({
      ...validation.data,
      modifiedAt: new Date(),
    });
revalidateTag("expense-master", "max");
revalidatePath("/admin/expense-master");
    return {
      success: true,
      message: "Expense updated successfully",
    };
  } catch (error) {
    console.error("Error updating expense master:", error);

    return {
      errors: {
        general: "Failed to update expense",
      },
    };
  }
}

// =====================================
// DELETE EXPENSE MASTER
// =====================================

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

    // Check whether this expense is already used in product recipes
    const usedRecipes = await adminDb
      .collection("productExpenseRecipes")
      .where("expenseMasterId", "==", id)
      .limit(1)
      .get();

    if (!usedRecipes.empty) {
      return {
        success: false,
        message:
          "This expense is already used in product recipes. You cannot delete it.",
      };
    }

    await expenseRef.delete();

    return {
      success: true,
      message: "Expense deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting expense master:", error);

    return {
      success: false,
      message: "Failed to delete expense",
    };
  }
}