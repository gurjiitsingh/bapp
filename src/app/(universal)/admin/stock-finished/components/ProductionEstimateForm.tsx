"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Search, Package2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { estimateProduction } from "@/app/(universal)/action/stock-finished/estimateProduction";
import { ProductStockType } from "@/lib/types/productStockType";
type Props = {
  products: ProductStockType[];
};

type FormType = {
  id: string;
  quantity: number;
  transactionUnit: InventoryUnit;
  note: string;
};

export default function ProductionEstimateForm({
  products,
}: Props) {

  console.log("products-------------", products)
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


  const transactionUnit = watch("transactionUnit");

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

  async function onSubmit(data: FormType) {
    if (isSubmitting) return;

    if (!selectedProduct) {
      alert("Please select a product");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await estimateProduction({
        id: data.id,
        quantity: Number(data.quantity),
        transactionUnit: data.transactionUnit,
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
      alert("Something went wrong");
    }

    setIsSubmitting(false);
  }

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
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full xl:basis-1/3 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5"
            >
            {/* PRODUCT */}
            <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Finished Product
              </label>

              <div className="relative">
                {!search.trim() && (
                  <Search
                    size={18}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                )}

                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowDropdown(true);
                  }}
                  placeholder="Search product..."
                  className={`input-style-4 pr-4 ${!search.trim()
                    ? "pl-12"
                    : "pl-4"
                    }`}
                />

                {showDropdown &&
                  filteredProducts.length > 0 && (
                    <div className="absolute z-50 mt-2 w-full max-h-80 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl">
                      {filteredProducts.map(
                        (item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setSelectedProduct(
                                item
                              );

                              setValue(
                                "id",
                                item.id
                              );

                              setSearch(
                                item.name
                              );

                              setShowDropdown(
                                false
                              );
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-0"
                          >
                            <div className="font-medium">
                              {item.name}
                            </div>

                            <div className="text-xs text-gray-500">
                              Current Stock:{" "}
                              {
                                item.currentStock
                              }
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  )}
              </div>

              <input
                type="hidden"
                {...register("id")}
              />
            </div>

            {/* STOCK */}
            {selectedProduct && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Package2
                      className="text-blue-600"
                      size={22}
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      {selectedProduct.name}
                    </h3>

                    <p className="text-sm text-gray-500">
                      Current Stock
                    </p>
                  </div>
                </div>

                <div className="text-2xl font-bold text-blue-700">
                  {selectedProduct.currentStock} {transactionUnit}
                </div>
              </div>
            )}

            {/* QUANTITY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Quantity */}

              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Production Quantity
                </label>

                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  {...register("quantity", {
                    valueAsNumber: true,
                  })}
                  onFocus={(e) => {
                    if (e.target.value === "0") {
                      e.target.value = "";
                    }
                  }}
                  className="input-style-4"
                />
              </div>

              {/* Unit */}

              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Unit
                </label>

                <select
                  {...register("transactionUnit")}
                  className="input-style-4"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="pcs">Piece (pcs)</option>
                  <option value="box">Box</option>
                  <option value="pack">Pack</option>
                  <option value="bottle">Bottle</option>
                  <option value="can">Can</option>
                  <option value="jar">Jar</option>
                  <option value="bag">Bag</option>
                  <option value="carton">Carton</option>
                  <option value="tray">Tray</option>
                  <option value="roll">Roll</option>
                  <option value="pair">Pair</option>
                  <option value="dozen">Dozen</option>


                  <option value="gm">Gram (g)</option>
                  <option value="ltr">Liter (L)</option>
                  <option value="ml">Milliliter (ml)</option>
                </select>
              </div>

            </div>

            {/* NOTE */}
            <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Note
              </label>

              <textarea
                rows={4}
                {...register("note")}
                className="input-style-4 resize-none"
                placeholder="Optional note..."
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="btn-save-4 h-11"
            >
              {isSubmitting
                ? "Estimating..."
                : "Generate Estimate"}
            </Button>
          </form>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b bg-gray-50">

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