import { z } from "zod";

export type ProductExpenseRecipeType = {
  id: string;

  productId: string;
  productName: string;

  expenseMasterId: string;
  expenseName: string;

  quantity: number;
  unit: string;

  cost: number;
  totalCost: number;

  createdAt: any;
};

export const newProductExpenseRecipeSchema = z.object({
  productId: z.string().min(1, "Product is required"),

  expenseMasterId: z.string().min(1, "Expense is required"),

  quantity: z.coerce
    .number()
    .positive("Quantity must be greater than zero"),

  unit: z.string().min(1, "Unit is required"),
});

export type TnewProductExpenseRecipeSchema = z.infer<
  typeof newProductExpenseRecipeSchema
>;



export type ProductExpenseItemType = {
  expenseMasterId: string;
  expenseName: string;
  quantity: number;
  unit: string;
  cost: number;
  totalCost: number;
};

export type ProductExpenseRecipeGroupType = {
  id: string;
  productId: string;
  productName: string;
  expenses: ProductExpenseItemType[];
  totalExpenseCost: number;
  createdAt?: string | null;
  updatedAt?: string | null;
};