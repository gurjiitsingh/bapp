"use client";

import React, { useEffect, useState } from "react";
import { Package2 } from "lucide-react";

import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { estimateProduction } from "@/app/(universal)/action/stock-finished/estimateProduction";
import { ProductStockType } from "@/lib/types/productStockType";
import { estimateProductionDpt } from "@/app/(universal)/action/production/departments/estimate/estimateProductionDpt";
import { displayStock_1 } from "@/utils/inventory/displayStock_1";

type Props = {
  selectedProduct: ProductStockType | null;
  quantity: number;
  transactionUnit: InventoryUnit;
  note?: string;
  departmentId: string;
};

type EstimateType = {
  items: any[];
  totalEstimatedCost: number;
  hasShortage: boolean;
};

export default function ProductionEstimateForm({
  selectedProduct,
  quantity,
  transactionUnit,
  note,
  departmentId,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [estimate, setEstimate] =
    useState<EstimateType | null>(null);

  /**
   * Run estimate whenever parent data changes
   */
  useEffect(() => {
    let mounted = true;

    async function generateEstimate() {
      // No product selected
      if (!selectedProduct) {
        setEstimate(null);
        return;
      }

      // No valid quantity
      if (!quantity || quantity <= 0) {
        setEstimate(null);
        return;
      }

      setIsSubmitting(true);

      try {
        const result = await estimateProductionDpt({
          id: selectedProduct.id,
          quantity: Number(quantity),
          transactionUnit,
          departmentId,
        });

        console.log("resutle of esti-------------", result)

        if (!mounted) return;

   if (result.success) {
  const itemsWithCost = result.items.map((item: any) => {
    const itemCost =
      (Number(item.requiredQty) /
        Number(item.conversionFactor)) *
      Number(item.averageCostDptItem || 0);

    return {
      ...item,
      itemCost,
    };
  });

  const totalCost = itemsWithCost.reduce(
    (sum: number, i: any) => sum + i.itemCost,
    0
  );

  setEstimate({
    items: itemsWithCost,
    totalEstimatedCost: totalCost, // 🔥 override backend if needed
    hasShortage: result.hasShortage,
  });
} else {
          setEstimate(null);
          console.error(
            "Production estimate failed:",
            result.message
          );
        }
      } catch (error) {
        if (!mounted) return;

        console.error(
          "Production estimate error:",
          error
        );

        setEstimate(null);
      } finally {
        if (mounted) {
          setIsSubmitting(false);
        }
      }
    }

    generateEstimate();

    return () => {
      mounted = false;
    };
  }, [
    selectedProduct,
    quantity,
    transactionUnit,
  ]);

  return (
    <div className="w-full">

      {/* Nothing selected yet */}
      {!selectedProduct && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
          <Package2
            size={40}
            className="mx-auto mb-3 text-amber-500"
          />

          <p className="font-semibold text-amber-700">
            Select a finished product
          </p>

          <p className="mt-1 text-sm text-amber-600">
            Select a product from the production form
            to generate an estimate.
          </p>
        </div>
      )}

      {/* Product selected but quantity not entered */}
      {selectedProduct &&
        (!quantity || quantity <= 0) && (
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-8 text-center">

            <Package2
              size={40}
              className="mx-auto mb-3 text-blue-500"
            />

            <p className="font-semibold text-blue-700">
              {selectedProduct.name}
            </p>

            <p className="mt-1 text-sm text-blue-600">
              Enter production quantity to generate
              the estimate.
            </p>

          </div>
        )}

      {/* Loading */}
      {selectedProduct &&
        quantity > 0 &&
        isSubmitting && (
          <div className="rounded-3xl border border-gray-200 bg-white px-3 py-10 text-center shadow-sm">

            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

            <p className="font-semibold text-gray-700">
              Calculating production estimate...
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {selectedProduct.name} — {quantity}{" "}
              {transactionUnit}
            </p>

          </div>
        )}

      {/* Estimate */}
      {estimate &&
        selectedProduct &&
        !isSubmitting && (
          <div className="w-full rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">

            {/* HEADER */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-6 py-2 border-b bg-gradient-to-r from-cyan-50 to-white">

              {/* <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Production Estimate
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {selectedProduct.name} —{" "}
                  {quantity} {transactionUnit}
                </p>
              </div> */}

              <div>
                {estimate.hasShortage ? (
                  <div className="px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                    Stock Shortage
                  </div>
                ) : (
                  <div className="px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                    Ready
                  </div>
                )}
              </div>

            </div>

            {/* SUMMARY */}
           <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-6 border-b bg-gray-50">

               
               <div className="rounded-2xl bg-green-50 border border-green-100 px-3 py-1">
                <p className="text-sm text-gray-500">
                  Cost / Unit
                </p>

                <p className="text-xl font-bold text-green-700 mt-2">
                  ₹{" "}
                  {(estimate.totalEstimatedCost/quantity).toFixed(
                    2
                  )}
                </p>
              </div>
               <div className="rounded-2xl bg-green-50 border border-green-100 px-3 py-1">
                <p className="text-sm text-gray-500">
                  Production Qty
                </p>

                <p className="text-xl font-bold text-green-700 mt-2">
                  ₹{" "}
                  {(quantity).toFixed(
                    2
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-green-50 border border-green-100 px-3 py-1">
                <p className="text-sm text-gray-500">
                  Estimated Cost
                </p>

                <p className="text-xl font-bold text-green-700 mt-2">
                  ₹{" "}
                  {estimate.totalEstimatedCost.toFixed(
                    2
                  )}
                </p>
              </div>
              <div className="rounded-2xl bg-cyan-50 border border-cyan-100 px-3 py-1">
                <p className="text-sm text-gray-500">
                  Inventory Items
                </p>

                <p className="text-xl font-bold text-cyan-700 mt-2">
                  {estimate.items.length}
                </p>
              </div> 

              <div
                className={`rounded-2xl border px-3 py-1 ${estimate.hasShortage
                    ? "bg-red-50 border-red-100"
                    : "bg-blue-50 border-blue-100"
                  }`}
              >
                <p className="text-sm text-gray-500">
                  Status
                </p>

                <p
                  className={`text-xl font-bold mt-2 ${estimate.hasShortage
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

            {/* TABLE */}
            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="bg-gray-100">
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

               {estimate.items.map((item) => {
  const conversionFactor =
    Number(item.conversionFactor) || 1;

  const itemCost =
    (Number(item.requiredQty) / conversionFactor) *
    Number(item.averageCostDptItem || 0);

  return (
    <tr
      key={item.inventoryItemId}
      className="border-b border-slate-100 hover:bg-cyan-50 transition"
    >
      {/* Item Name */}
      <td className="px-6">
        <div className="font-semibold text-gray-800">
          {item.itemName}
        </div>
      </td>

      {/* Required */}
      <td className="px-6 text-right font-medium">
        {displayStock_1(
          item.requiredQty,
          item.purchaseUnit,
          item.consumptionUnit,
          item.conversionFactor
        )}
      </td>

      {/* Available */}
      <td className="px-6 text-right">
        {displayStock_1(
          item.availableQty,
          item.purchaseUnit,
          item.consumptionUnit,
          item.conversionFactor
        )}
      </td>

      {/* Shortage */}
      <td className="px-6 text-right">
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

      {/* ✅ Cost Column */}
      <td className="px-6 text-right font-semibold text-cyan-700">
        ₹ {itemCost.toFixed(2)}
      </td>
    </tr>
  );
})}

                </tbody>

              </table>

            </div>

            {/* SHORTAGE */}
            {estimate.hasShortage && (
              <div className="m-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">

                <p className="font-semibold text-red-700">
                  Production cannot be completed
                  with current inventory.
                </p>

                <p className="text-sm text-red-600 mt-1">
                  Send the shortage items to DPT before
                  starting production.
                </p>

              </div>
            )}

          </div>
        )}

    </div>
  );
}