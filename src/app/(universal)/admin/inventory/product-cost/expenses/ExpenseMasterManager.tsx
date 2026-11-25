
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import ExpenseMasterList from "./ExpenseMasterList";
import NewExpenseForm, { ExpenseMasterType } from "./NewExpenseForm";
import { deleteExpenseMaster } from "@/app/(universal)/action/otherExpenses/deleteExpenseMaster";
import Link from "next/link";
import { Receipt } from "lucide-react";
 

type Props = {
  initialExpenses: ExpenseMasterType[];
};

export default function ExpenseMasterManager({
  initialExpenses,
}: Props) {
  const router = useRouter();

  const [selectedExpense, setSelectedExpense] =
    useState<ExpenseMasterType | null>(null);

  const [isDeleting, startDeleteTransition] = useTransition();

  function handleDeleteExpense(expense: ExpenseMasterType) {
    startDeleteTransition(async () => {
      const result = await deleteExpenseMaster(expense.id);

      if (!result.success) {
        toast.error(result.message || "Failed to delete expense");
        return;
      }

      if (selectedExpense?.id === expense.id) {
        setSelectedExpense(null);
      }

      toast.success(result.message || "Expense deleted successfully");
      router.refresh();
    });
  }

  function handleSaved() {
    router.refresh();
  }

  return (
<div className="flex flex-col">




      {/* HEADER */}

      <div className="mb-2 w-full">

        <div className="flex items-center gap-3">

          <div className="h-12 w-12 rounded-xl bg-rose-100 flex items-center justify-center">

            <Receipt
              size={24}
              className="text-rose-600"
            />

          </div>










        </div>
        <div className="flex items-center justify-between">
          <div>

            <h1 className="text-2xl font-bold text-gray-800">
            Exampanse Master
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Create and manage expense rates
            </p>

          </div>

          {/* <Link
            href="/admin/inventory/product-cost/new"
            className="btn-save-4"
          > */}
          <div>
            <Link
              href="/admin/inventory/product-cost/new"
              className="btn-save-4"
            >
              Add Recipe
            </Link>
          </div>
        </div>

      </div>









    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

      {/* LEFT: EXPENSE LIST */}
      <div className="xl:col-span-1">
        <ExpenseMasterList
          expenses={initialExpenses}
          onEdit={(expense) => setSelectedExpense(expense)}
          onAddNew={() => setSelectedExpense(null)}
          onDelete={handleDeleteExpense}
          isDeleting={isDeleting}
        />
      </div>

      {/* RIGHT: EXPENSE FORM */}
      <div className="xl:col-span-2">
        <NewExpenseForm
          key={selectedExpense?.id ?? "new-expense"}
          expense={selectedExpense}
          onSaved={handleSaved}
        />
      </div>

    </div>
</div>
  );
}
