
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Pencil,
  Trash2,
  Star,
  Plus,
} from "lucide-react";

import type { ExpenseMasterType } from "./NewExpenseForm";

type Props = {
  expenses: ExpenseMasterType[];
  onEdit: (expense: ExpenseMasterType) => void;
  onAddNew: () => void;
  onDelete: (expense: ExpenseMasterType) => void;
  isDeleting?: boolean;
};

export default function ExpenseMasterList({
  expenses,
  onEdit,
  onAddNew,
  onDelete,
  isDeleting = false,
}: Props) {
  const [search, setSearch] = useState("");

  const filteredExpenses = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return expenses;

    return expenses.filter((expense) =>
      expense.name.toLowerCase().includes(value)
    );
  }, [expenses, search]);

  function handleDelete(expense: ExpenseMasterType) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${expense.name}"?`
    );

    if (confirmed) {
      onDelete(expense);
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

      {/* HEADER */}
      <div className="p-4 border-b border-gray-100 flex flex-col gap-3">

        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Expense Master
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              {expenses.length} expenses available
            </p>
          </div>

          <button
            type="button"
            onClick={onAddNew}
            className="btn-save-4 flex items-center gap-2"
          >
            <Plus size={16} />
            New Expense
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expense..."
            className="input-style-4 pl-9"
          />
        </div>

      </div>

      {/* LIST */}
      <div className="divide-y divide-gray-100">

        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No expenses found.
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition"
            >

              <div className="min-w-0 flex-1">

                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm text-gray-800">
                    {expense.name}
                  </h3>

                  {expense.isFavourite && (
                    <Star
                      size={14}
                      className="text-amber-500 fill-amber-500"
                    />
                  )}

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      expense.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {expense.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span>
                    ₹{Number(expense.cost || 0).toFixed(2)}
                  </span>
                  <span>/</span>
                  <span>{expense.unit}</span>
                </div>

                {expense.description && (
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {expense.description}
                  </p>
                )}

              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-2 shrink-0">

                <button
                  type="button"
                  onClick={() => onEdit(expense)}
                  title="Edit expense"
                  className="h-9 w-9 rounded-lg border border-blue-100 bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100"
                >
                  <Pencil size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(expense)}
                  disabled={isDeleting}
                  title="Delete expense"
                  className="h-9 w-9 rounded-lg border border-red-100 bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>

              </div>

            </div>
          ))
        )}

      </div>

    </div>
  );
}
