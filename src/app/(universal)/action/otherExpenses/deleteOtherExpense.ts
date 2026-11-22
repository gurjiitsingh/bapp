
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";

// =====================================================
// DELETE OTHER EXPENSE
// =====================================================

export async function deleteOtherExpense(id: string) {
  try {
    if (!id?.trim()) {
      return {
        errors: {
          general: "Invalid expense ID",
        },
      };
    }

    // CHECK EXPENSE
    const expenseRef = adminDb
      .collection("otherExpenses")
      .doc(id);

    const expenseSnap = await expenseRef.get();

    if (!expenseSnap.exists) {
      return {
        errors: {
          general: "Expense not found",
        },
      };
    }

    // DELETE
    await expenseRef.delete();

    // REVALIDATE
    revalidateTag("other-expenses", "max");

    revalidatePath("/admin/other-expenses");

    return {
      success: true,
      message: "Expense deleted successfully",
    };

  } catch (error) {
    console.error(
      "❌ Other expense delete failed:",
      error
    );

    return {
      errors: {
        general: "Could not delete expense",
      },
    };
  }
}
