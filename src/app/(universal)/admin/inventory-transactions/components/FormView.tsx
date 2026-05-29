"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { InventoryItemType } from "@/lib/types/InventoryItemType";
import {
  ArrowLeftRight,
} from "lucide-react";
import {
  newInventoryTransactionSchema,
  TnewInventoryTransactionSchema,
} from "@/lib/types/InventoryTransactionType";
import { addInventoryTransaction } from "@/app/(universal)/action/inventoryTransactions/dbOperations.ts";

type Props = {
  inventoryItems: InventoryItemType[];
};

export default function FormView({
  inventoryItems,
}: Props) {
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TnewInventoryTransactionSchema>({
    resolver: zodResolver(
      newInventoryTransactionSchema
    ),
  });



  
    async function onSubmit(
      data: TnewInventoryTransactionSchema
    ) {
      setIsSubmitting(true);
  
      try {
        const formData = new FormData();
  
        formData.append(
          "inventoryItemId",
          data.inventoryItemId
        );
  
        formData.append(
          "type",
          data.type
        );
  
        formData.append(
          "quantity",
          String(data.quantity)
        );
  
        formData.append(
          "note",
          data.note || ""
        );
  
        const result =
          await addInventoryTransaction(
            formData
          );
  
        if (!result?.errors) {
       //   reset();
  
          alert(
            "Transaction created successfully"
          );
        }
      } catch (error) {
        console.error(error);
      }
  
      setIsSubmitting(false);
    }


    return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* HEADER */}
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-rose-100 flex items-center justify-center">
                <ArrowLeftRight
                  className="text-rose-600"
                  size={22}
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  New Inventory Transaction
                </h1>

                <p className="text-sm text-gray-500">
                  Add stock movement
                </p>
              </div>
            </div>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 flex flex-col gap-5"
          >
            {/* ITEM */}
            <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Inventory Item
              </label>

              <select
                {...register(
                  "inventoryItemId"
                )}
                className="input-style-4"
              >
                <option value="">
                  Select inventory item
                </option>

                {inventoryItems.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>

              <p className="text-sm text-rose-500">
                {
                  errors.inventoryItemId
                    ?.message
                }
              </p>
            </div>

            {/* TYPE */}
            <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Transaction Type
              </label>

              <select
                {...register("type")}
                className="input-style-4"
              >
                <option value="purchase">
                  Purchase
                </option>

                <option value="adjustment">
                  Adjustment
                </option>

                <option value="wastage">
                  Wastage
                </option>

                <option value="return">
                  Return
                </option>
              </select>
            </div>

            {/* QUANTITY */}
            <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Quantity
              </label>

              <input
                type="number"
                step="0.01"
                {...register("quantity")}
                className="input-style-4"
                placeholder="Enter quantity"
              />

              <p className="text-sm text-rose-500">
                {errors.quantity?.message}
              </p>
            </div>

            {/* NOTE */}
            <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Note
              </label>

              <textarea
                {...register("note")}
                className="textarea-style-4"
                placeholder="Optional note"
              />
            </div>

            {/* BUTTON */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="btn-save-4 h-11"
            >
              {isSubmitting
                ? "Saving..."
                : "Save Transaction"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

