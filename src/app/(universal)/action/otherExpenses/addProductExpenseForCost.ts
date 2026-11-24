
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { revalidatePath, revalidateTag } from "next/cache";
import { newOtherExpenseSchema, OtherExpenseType } from "./OtherExpenseType";
import { newProductExpenseRecipeSchema } from "@/lib/types/expense/ProductExpenseRecipeType";
 
import { Timestamp, FieldValue } from "firebase/firestore";

 


export type ProductExpenseItemType = {
  expenseMasterId: string;
  expenseName: string;
  quantity: number;
  unit: string;
  cost: number;
  totalCost: number;
};

export type ProductExpenseRecipeType = {
  id: string;
  productId: string;
  productName: string;
  expenses: ProductExpenseItemType[];
  totalExpenseCost: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};


export async function addProductExpenseForCost(
  formData: FormData
) {
  try {
    // FORM VALUES

    const productId = formData.get(
      "productId"
    ) as string;

    const expenseMasterId = formData.get(
      "expenseMasterId"
    ) as string;

    const quantityRaw = formData.get(
      "quantity"
    ) as string | null;

    const unit = formData.get(
      "unit"
    ) as string;

    // SAFE NUMBER

    const quantity = quantityRaw
      ? parseFloat(quantityRaw)
      : 0;

    // VALIDATION

    const receivedData = {
      productId,
      expenseMasterId,
      quantity,
      unit,
    };

    const result =
      newProductExpenseRecipeSchema.safeParse(
        receivedData
      );

    if (!result.success) {
      const zodErrors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        zodErrors[String(issue.path[0])] =
          issue.message;
      });

      return {
        errors: zodErrors,
      };
    }

    // FETCH PRODUCT

    const productSnap = await adminDb
      .collection("productStock")
      .doc(productId)
      .get();

    if (!productSnap.exists) {
      return {
        errors: {
          product: "Product not found",
        },
      };
    }

    const productData = productSnap.data();

    // FETCH EXPENSE MASTER

    const expenseSnap = await adminDb
      .collection("expenseMaster")
      .doc(expenseMasterId)
      .get();

    if (!expenseSnap.exists) {
      return {
        errors: {
          expense: "Expense master item not found",
        },
      };
    }

    const expenseData = expenseSnap.data();

    // CHECK ACTIVE EXPENSE

    if (expenseData?.isActive === false) {
      return {
        errors: {
          expense: "This expense is inactive",
        },
      };
    }

    // EXPENSE COST

    const cost = Number(
      expenseData?.cost ?? 0
    );

    if (!Number.isFinite(cost) || cost < 0) {
      return {
        errors: {
          cost: "Invalid expense cost",
        },
      };
    }

    const totalCost = quantity * cost;

    // NEW EXPENSE OBJECT

    const newExpense = {
      expenseMasterId,

      expenseName: expenseData?.name || "",

      quantity,

      unit,

      cost,

      totalCost,
    };

    // PRODUCT EXPENSE DOCUMENT
    // DOCUMENT ID = PRODUCT ID

    const recipeRef = adminDb
      .collection("productExpenseRecipes")
      .doc(productId);

    // FIRESTORE TRANSACTION

    const transactionResult =
      await adminDb.runTransaction(
        async (transaction) => {

          const recipeSnap =
            await transaction.get(recipeRef);

          // EXISTING DOCUMENT

          if (recipeSnap.exists) {

            const recipeData = recipeSnap.data();

            const expenses = Array.isArray(
              recipeData?.expenses
            )
              ? recipeData.expenses
              : [];

            // CHECK DUPLICATE

            const duplicate = expenses.some(
              (expense: { expenseMasterId: string }) =>
                expense.expenseMasterId === expenseMasterId
            );

            if (duplicate) {
              return {
                duplicate: true,
              };
            }

            // APPEND EXPENSE

            const updatedExpenses = [
              ...expenses,
              newExpense,
            ];

            // RECALCULATE TOTAL

            const totalExpenseCost =
              updatedExpenses.reduce(
                (
                  total: number,
                  expense: { totalCost: number }
                ) => total + Number(expense.totalCost || 0),
                0
              );

            transaction.update(recipeRef, {
              expenses: updatedExpenses,

              totalExpenseCost,

              updatedAt:
                admin.firestore.FieldValue.serverTimestamp(),
            });

          } else {

            // CREATE FIRST DOCUMENT

            transaction.set(recipeRef, {
              productId,

              productName: productData?.name || "",

              expenses: [
                newExpense,
              ],

              totalExpenseCost: totalCost,

              createdAt:
                admin.firestore.FieldValue.serverTimestamp(),

              updatedAt:
                admin.firestore.FieldValue.serverTimestamp(),
            });

          }

          return {
            duplicate: false,
          };
        }
      );

    // DUPLICATE RESPONSE

    if (transactionResult.duplicate) {
      return {
        errors: {
          duplicate: "Expense already added to product",
        },
      };
    }

    console.log(
      "Product expense recipe saved:",
      {
        productId,
        expenseMasterId,
        totalCost,
      }
    );

    // REVALIDATE

    revalidateTag(
      "product-expense-recipes",
      "max"
    );

    revalidatePath(
      "/admin/product-recipes"
    );

    revalidatePath(
      "/admin/product-recipes/form"
    );

    return {
      success: true,

      message: "Product expense added successfully",

      id: productId,
    };

  } catch (error) {
    console.error(
      "❌ Product expense recipe save failed:",
      error
    );

    return {
      errors: {
        general: "Could not save product expense",
      },
    };
  }
}
