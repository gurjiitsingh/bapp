"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Search, Package2 } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { estimateProduction } from "@/app/(universal)/action/stock-finished/estimateProduction";
import { ProductStockType } from "@/lib/types/productStockType";
type Props = {
  products: ProductStockType[];

  productId?: string;
  currentStock?: number;
  consumptionUnit?: string;
};

type FormType = {
  id: string;
  quantity: number;
  transactionUnit: InventoryUnit;
  note: string;
};

export default function ProductionEstimateForm({
  products,
  productId,
  currentStock,
  consumptionUnit,
}: Props) {

 
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [showDropdown, setShowDropdown] =
    useState(false);

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState<ProductStockType | null>(null);

  const [estimate, setEstimate] = useState<{
    items: any[];
    totalEstimatedCost: number;
    hasShortage: boolean;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<FormType>({
    defaultValues: {
      quantity: 0,
      transactionUnit: "kg",
      note: "",
    },
  });


  //const transactionUnit = watch("transactionUnit");
  const transactionUnit =
  (consumptionUnit as InventoryUnit) ?? "kg";

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return [];

    return products
      .filter((item) =>
        item.name
          ?.toLowerCase()
          .includes(search.toLowerCase())
      )
      .slice(0, 20);
  }, [search, products]);

  // async function onSubmit(data: FormType) {
  //   if (isSubmitting) return;

  //   if (!selectedProduct) {
  //     alert("Please select a product");
  //     return;
  //   }

  //   setIsSubmitting(true);

  //   try {
  //     const result = await estimateProduction({
  //       id: data.id,
  //       quantity: Number(data.quantity),
  //       transactionUnit: data.transactionUnit,
  //     });

  //     if (result.success) {
  //       setEstimate({
  //         items: result.items,
  //         totalEstimatedCost:
  //           result.totalEstimatedCost,
  //         hasShortage:
  //           result.hasShortage,
  //       });
  //     } else {
  //       alert(result.message);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     alert("Something went wrong");
  //   }

  //   setIsSubmitting(false);
  // }
async function generateEstimate() {
  if (
    !productId ||
    currentStock === undefined ||
    !consumptionUnit
  ) {
    return;
  }

  setIsSubmitting(true);

  try {
    const result = await estimateProduction({
      id: productId,
      quantity: currentStock,
      transactionUnit:
        consumptionUnit as InventoryUnit,
    });

    if (result.success) {
      setEstimate({
        items: result.items,
        totalEstimatedCost:
          result.totalEstimatedCost,
        hasShortage:
          result.hasShortage,
      });
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error(error);
  }

  setIsSubmitting(false);
}
  
useEffect(() => {
  if (!productId) return;

  const product = products.find(
    (p) => p.id === productId
  );

  if (!product) return;

  setSelectedProduct(product);

  generateEstimate();
}, [productId]);

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">
      <div className="w-full  ">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Production Estimate
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Estimate raw material requirements and production cost.
          </p>
        </div>
       <div className="flex flex-col   xl:flex-row gap-6 w-full">
      
          <div className="w-full">
      <div className="flex-1 min-w-0">
  {estimate && (
    <div className="w-full rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b bg-gradient-to-r from-cyan-50 to-white">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            Production Estimate
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Required inventory for this production batch
          </p>
        </div>
<div className="flex gap-3">
              <div
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            estimate.hasShortage
              ? "bg-amber-100 text-red-700"
              : "bg-amber-100 text-green-700"
          }`}
        >
          {estimate.hasShortage
            ? "Stock Shortage"
            : "Save"}
        </div>

        <div
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            estimate.hasShortage
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {estimate.hasShortage
            ? "Stock Shortage"
            : "Ready to Produce"}
        </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b bg-gray-50">

        <div className="rounded-2xl bg-cyan-50 border border-cyan-100 p-5">
          <p className="text-sm text-gray-500">
            Inventory Items
          </p>

          <p className="text-3xl font-bold text-cyan-700 mt-2">
            {estimate.items.length}
          </p>
        </div>
<div className="rounded-2xl bg-green-50 border border-green-100 p-5">
          <p className="text-sm text-gray-500">
            Estimated Cost/Unit
          </p>

          <p className="text-3xl font-bold text-green-700 mt-2">
            ₹ {(estimate.totalEstimatedCost/currentStock!).toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl bg-green-50 border border-green-100 p-5">
          <p className="text-sm text-gray-500">
            Estimated Cost
          </p>

          <p className="text-3xl font-bold text-green-700 mt-2">
            ₹ {estimate.totalEstimatedCost.toFixed(2)}
          </p>
        </div>

        <div
          className={`rounded-2xl border p-5 ${
            estimate.hasShortage
              ? "bg-red-50 border-red-100"
              : "bg-blue-50 border-blue-100"
          }`}
        >
          <p className="text-sm text-gray-500">
            Status
          </p>

          <p
            className={`text-xl font-bold mt-2 ${
              estimate.hasShortage
                ? "text-red-700"
                : "text-blue-700"
            }`}
          >
            {estimate.hasShortage
              ? "Insufficient Stock"
              : "Ready"}
          </p>
        </div>

      </div>

      {/* Table */}
      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-gray-100 sticky top-0">

            <tr className="text-sm text-gray-600">

              <th className="px-6 py-4 text-left font-semibold">
                Inventory Item
              </th>

              <th className="px-6 py-4 text-right font-semibold">
                Required
              </th>

              <th className="px-6 py-4 text-right font-semibold">
                Available
              </th>

              <th className="px-6 py-4 text-right font-semibold">
                Shortage
              </th>

              <th className="px-6 py-4 text-right font-semibold">
                Estimated Cost
              </th>

            </tr>

          </thead>

          <tbody>

            {estimate.items.map((item) => (

              <tr
                key={item.inventoryItemId}
                className="border-b hover:bg-cyan-50 transition"
              >

                <td className="px-6 py-5">

                  <div className="font-semibold text-gray-800">
                    {item.itemName}
                  </div>

                  <div className="text-xs text-gray-400 mt-1">
                    {item.unit}
                  </div>

                </td>

                <td className="px-6 py-5 text-right font-medium">
                  {item.requiredQty}
                </td>

                <td className="px-6 py-5 text-right">
                  {item.availableQty}
                </td>

                <td className="px-6 py-5 text-right">

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      item.shortageQty > 0
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.shortageQty} {item.unit}
                  </span>

                </td>

                <td className="px-6 py-5 text-right font-semibold text-cyan-700">
                  ₹ {item.totalCost.toFixed(2)}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {estimate.hasShortage && (
        <div className="m-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="font-semibold text-red-700">
            Production cannot be completed with current inventory.
          </p>

          <p className="text-sm text-red-600 mt-1">
            Purchase the shortage items before starting production.
          </p>
        </div>
      )}

    </div>
  )}
</div>
          </div>

        </div>
      </div>
    </div>
  );
}