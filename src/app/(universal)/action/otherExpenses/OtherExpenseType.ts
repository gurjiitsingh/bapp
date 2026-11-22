
import { z } from "zod";


 

export const newExpenseMasterSchema = z.object({
  name: z.string().min(1, "Expense name is required"),

  cost: z.coerce
    .number()
    .positive("Cost must be greater than zero"),

  unit: z.string().min(1, "Unit is required"),

  description: z.string().optional().default(""),

  isFavourite: z.boolean().default(false),

  isActive: z.boolean().default(true),
});

export type TnewExpenseMasterSchema = z.infer<
  typeof newExpenseMasterSchema
>;

export type ExpenseMasterType = {
  id: string;
  name: string;
  cost: number;
  unit: string;
  description?: string;
  isFavourite: boolean;
  isActive: boolean;
  createdAt: string | null;
  modifiedAt?: string | null;
};




export const newOtherExpenseSchema = z.object({
  expenseName: z
    .string()
    .min(1, "Expense name is required"),

  amount: z
    .number()
    .positive("Amount must be greater than zero"),

  expenseDate: z
    .string()
    .min(1, "Expense date is required"),

  description: z
    .string()
    .optional()
    .default(""),
});

export type TnewOtherExpenseSchema = z.infer<
  typeof newOtherExpenseSchema
>;

export type OtherExpenseType = {
  id: string;

  expenseName: string;

  amount: number;

  expenseDate: string;

  description?: string;

  createdAt: string | null;
};
