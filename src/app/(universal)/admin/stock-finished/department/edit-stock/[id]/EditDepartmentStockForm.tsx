"use client";

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";



import { DepartmentStockType } from "@/lib/types/department/DepartmentStockType";
import { updateDepartmentStockFromClient } from "@/app/(universal)/action/production/departments/updateDepartmentStockFromClient";


type Props = {
  stock: DepartmentStockType;
};

export default function EditDepartmentStockForm({
  stock,
}: Props) {

  const router = useRouter();
  const [isPending, startTransition] =
    useTransition();

  const [quantity, setQuantity] =
    useState(stock.quantity);

  const [averageCost, setAverageCost] =
    useState(stock.averageCost);

  const [stockValue, setStockValue] =
    useState(stock.stockValue);

 const save = () => {
  startTransition(async () => {
    try {
      await updateDepartmentStockFromClient({
        id: stock.id,
        quantity,
        averageCost,
        stockValue,
      });

      toast.success("Department stock updated");

      router.back();
    } catch (e: any) {
      toast.error(e.message || "Failed to update");
    }
  });
};

 return (
  <div className="p-6 max-w-4xl   space-y-6 bg-gray-50 min-h-screen">

    {/* Header */}
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Edit Department Stock
        </h1>

        <p className="text-sm text-gray-500">
          Update department inventory values.
        </p>
      </div>

      <div className="flex gap-3">

        <button
          onClick={() => router.back()}
          className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600"
        >
          ← Back
        </button>

        <Link
          href="/admin/stock-finished/department"
          className="rounded-xl bg-[#00897b] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#00796b]"
        >
          All Departments
        </Link>

      </div>
    </div>

    {/* Card */}

    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div className="md:col-span-2">
          <label className="text-sm text-gray-600">
            Inventory Item
          </label>

          <input
            readOnly
            value={stock.inventoryItemName}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">
            Purchase Unit
          </label>

          <input
            readOnly
            value={stock.purchaseUnit}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">
            Consumption Unit
          </label>

          <input
            readOnly
            value={stock.consumptionUnit}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">
            Quantity
          </label>

          <input
            type="number"
            value={quantity}
            onChange={(e) =>
              setQuantity(Number(e.target.value))
            }
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">
            Average Cost
          </label>

          <input
            type="number"
            step="0.000001"
            value={averageCost}
            onChange={(e) =>
              setAverageCost(Number(e.target.value))
            }
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm text-gray-600">
            Stock Value
          </label>

          <input
            type="number"
            step="0.01"
            value={stockValue}
            onChange={(e) =>
              setStockValue(Number(e.target.value))
            }
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

      </div>

      <button
        onClick={save}
        disabled={isPending}
        className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending
          ? "Updating..."
          : "Update Department Stock"}
      </button>

    </div>

  </div>
);
}