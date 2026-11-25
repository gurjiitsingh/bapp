
"use client";

import React, { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Receipt,
  IndianRupee,
  Plus,
} from "lucide-react";

import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { newExpenseMasterSchema, TnewExpenseMasterSchema } from "@/app/(universal)/action/otherExpenses/OtherExpenseType";
 
import Link from "next/link";
import { updateExpenseMaster } from "@/app/(universal)/action/otherExpenses/updateExpenseMaster";
import { addExpenseMaster } from "@/app/(universal)/action/otherExpenses/addExpenseMaster";




export type ExpenseMasterType = {
  id: string;
  name: string;
  cost: number;
  unit: string;
  description: string;
  isFavourite: boolean;
  isActive: boolean;
  createdAt: string | null;
  modifiedAt: string | null;
};

type Props = {
  expense?: ExpenseMasterType | null;
  onSaved?: () => void;
};

export default function NewExpenseForm({
  expense = null,
  onSaved,
}: Props) {

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TnewExpenseMasterSchema>({
    resolver: zodResolver(newExpenseMasterSchema),

    defaultValues: {
      name: "",
      cost: 0,
      unit: "minute",
      description: "",
      isFavourite: false,
      isActive: true,
    },
  });

  const isActive = watch("isActive");
  const isFavourite = watch("isFavourite");


  useEffect(() => {
    reset({
      name: expense?.name ?? "",
      cost: expense?.cost ?? 0,
      unit: expense?.unit ?? "minute",
      description: expense?.description ?? "",
      isFavourite: expense?.isFavourite ?? false,
      isActive: expense?.isActive ?? true,
    });
  }, [expense, reset]);
  // =====================================
  // SUBMIT
  // =====================================


  async function onSubmit(data: TnewExpenseMasterSchema) {
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("name", data.name.trim());
      formData.append("cost", String(data.cost));
      formData.append("unit", data.unit);
      formData.append("description", data.description || "");
      formData.append("isFavourite", String(data.isFavourite));
      formData.append("isActive", String(data.isActive));

      const result = expense
        ? await updateExpenseMaster(expense.id, formData)
        : await addExpenseMaster(formData);

      // if (result?.errors) {
      //   const message =
      //     result.errors.general?.[0] ||
      //     result.errors.name?.[0] ||
      //     result.errors.cost?.[0] ||
      //     result.errors.unit?.[0] ||
      //     result.errors.general ||
      //     "Failed to save expense";

      //   toast.error(message);
      //   return;
      // }

      toast.success(
        expense
          ? "Expense updated successfully"
          : "Expense saved successfully"
      );

      if (!expense) {
        reset({
          name: "",
          cost: 0,
          unit: "minute",
          description: "",
          isFavourite: false,
          isActive: true,
        });
      }

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");

    } finally {
      setIsSubmitting(false);
    }
  }


  // =====================================
  // UI
  // =====================================

  return (

    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex flex-col gap-5"
    >

      {/* HEADER */}

      {/* <div className="mb-2 w-full"> */}

        {/* <div className="flex items-center gap-3">

          <div className="h-12 w-12 rounded-xl bg-rose-100 flex items-center justify-center">

            <Receipt
              size={24}
              className="text-rose-600"
            />

          </div>










        </div> */}
        {/* <div className="flex items-center justify-between">
          <div>

            <h1 className="text-2xl font-bold text-gray-800">
              {expense ? "Edit Expense" : "New Expense"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Create and manage expense rates
            </p>

          </div>

          
          <div>
            <Link
              href="/admin/inventory/product-cost/new"
              className="btn-save-4"
            >
              Add Recipe
            </Link>
          </div>
        </div> */}

      {/* </div> */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* LEFT */}

        <div className="xl:col-span-2 flex flex-col gap-5">

          {/* EXPENSE DETAILS */}

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">

            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Expense Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* NAME */}

              <div>

                <label className="label-style-4">
                  Expense Name
                </label>

                <input
                  {...register("name")}
                  placeholder="e.g. Labour"
                  className="input-style-4 mt-1"
                />

                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}

              </div>

              {/* COST */}

              <div>

                <label className="label-style-4">
                  Cost / Rate (₹)
                </label>

                <div className="relative mt-1">



                  <input
                    {...register("cost", {
                      valueAsNumber: true,
                    })}
                    type="number"


                    className="input-style-4 pl-9"
                  />

                </div>

                {errors.cost && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.cost.message}
                  </p>
                )}

              </div>

              {/* UNIT */}

              <div>

                <label className="label-style-4">
                  Expense Unit
                </label>

                <select
                  {...register("unit")}
                  className="input-style-4 mt-1"
                >

                  <option value="minute">
                    Per Minute
                  </option>

                  <option value="hour">
                    Per Hour
                  </option>

                  <option value="day">
                    Per Day
                  </option>

                  <option value="unit">
                    Per Unit
                  </option>

                  <option value="kWh">
                    Per kWh (Electricity)
                  </option>

                  <option value="litre">
                    Per Litre
                  </option>

                  <option value="1000 litres">
                    Per 1,000 Litres
                  </option>

                  <option value="kg">
                    Per Kg
                  </option>

                  <option value="gram">
                    Per Gram
                  </option>

                  <option value="km">
                    Per Km
                  </option>

                  <option value="piece">
                    Per Piece
                  </option>

                  <option value="month">
                    Per Month
                  </option>

                </select>

                {errors.unit && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.unit.message}
                  </p>
                )}

              </div>

              {/* DESCRIPTION */}

              <div className="md:col-span-2">

                <label className="label-style-4">
                  Description (Optional)
                </label>

                <textarea
                  {...register("description")}
                  rows={3}
                  placeholder="Enter expense details..."
                  className="input-style-4 mt-1 resize-none"
                />

              </div>

            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="flex flex-col gap-5">

          {/* SETTINGS */}

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">

            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Settings
            </h2>

            <div className="flex flex-col gap-4">

              <label className="flex items-center gap-3 cursor-pointer">

                <input
                  {...register("isActive")}
                  type="checkbox"
                  className="h-4 w-4"
                />

                <div>

                  <p className="text-sm font-medium text-gray-800">
                    Available / Active
                  </p>

                  <p className="text-xs text-gray-500">
                    Allow this expense to be used
                  </p>

                </div>

              </label>

              <label className="flex items-center gap-3 cursor-pointer">

                <input
                  {...register("isFavourite")}
                  type="checkbox"
                  className="h-4 w-4"
                />

                <div>

                  <p className="text-sm font-medium text-gray-800">
                    Favourite
                  </p>

                  <p className="text-xs text-gray-500">
                    Mark this expense as a favourite
                  </p>

                </div>

              </label>

            </div>

          </div>

          {/* PREVIEW */}

          <div className="bg-rose-50 border border-rose-100 rounded-2xl shadow-sm p-5">

            <h3 className="text-lg font-semibold text-gray-800">
              Rate Preview
            </h3>

            <p className="text-sm text-gray-500 mt-1 mb-4">
              Expense rate information
            </p>

            <div className="text-2xl font-bold text-rose-600">
              ₹{Number(watch("cost") || 0).toFixed(2)}
            </div>

            <p className="text-sm text-gray-600 mt-1">
              Per {watch("unit")}
            </p>

            <div className="border-t border-rose-200 mt-4 pt-3 flex justify-between text-sm">

              <span className="text-gray-500">
                Status
              </span>

              <span className={
                isActive
                  ? "text-green-600 font-semibold"
                  : "text-red-500 font-semibold"
              }>
                {isActive ? "Active" : "Inactive"}
              </span>

            </div>

            <div className="flex justify-between text-sm mt-2">

              <span className="text-gray-500">
                Favourite
              </span>

              <span className="font-semibold text-gray-700">
                {isFavourite ? "Yes" : "No"}
              </span>

            </div>

          </div>

          {/* SAVE */}

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">

            <h3 className="text-lg font-semibold text-gray-800">
              Save Expense
            </h3>

            <p className="text-sm text-gray-500 mt-1 mb-5">
              Save this expense and its rate in your system
            </p>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="btn-save-4 w-full"
            >
              <Plus size={18} className="mr-2" />

              {isSubmitting
                ? expense
                  ? "Updating Expense..."
                  : "Saving Expense..."
                : expense
                  ? "Update Expense"
                  : "Save Expense"}
            </Button>

          </div>

        </div>

      </div>

    </form>

  );
}
