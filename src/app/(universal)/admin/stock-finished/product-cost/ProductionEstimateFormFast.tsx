
"use client";

import React, { useEffect, useState } from "react";
import { Package2 } from "lucide-react";

import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { ProductStockType } from "@/lib/types/productStockType";

import { estimateProductionCost } from "@/app/(universal)/action/production/departments/estimate/estimateProductionCost";

import { displayStock_1 } from "@/utils/inventory/displayStock_1";

type Props = {
  selectedProduct: ProductStockType | null;
  quantity: number;
  transactionUnit: InventoryUnit;
};

type EstimateType = {
  items: any[];
  expenses: any[];
  rawMaterialCost: number;
  expenseCostPerUnit: number;
  additionalExpenseCost: number;
  totalEstimatedCost: number;
};

export default function ProductionEstimateFormFast({
  selectedProduct,
  quantity,
  transactionUnit,
}: Props) {


  const [isSubmitting, setIsSubmitting] = useState(false);

  const [estimate, setEstimate] =
    useState<EstimateType | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function generateEstimate() {
      if (!selectedProduct || !quantity || quantity <= 0) {
        setEstimate(null);
        setError("");
        return;
      }

      setIsSubmitting(true);
      setError("");

      try {
        const result = await estimateProductionCost({
          id: selectedProduct.id,
          quantity,
        });



        if (!mounted) return;

        if (result.success) {
          setEstimate({
            items: result.items ?? [],
            expenses: result.expenses ?? [],

            rawMaterialCost:
              Number(result.rawMaterialCost) || 0,

            expenseCostPerUnit:
              Number(result.expenseCostPerUnit) || 0,

            additionalExpenseCost:
              Number(result.additionalExpenseCost) || 0,

            totalEstimatedCost:
              Number(result.totalEstimatedCost) || 0,
          });
        } else {
          setEstimate(null);
          setError(result.message || "Failed to calculate cost");
        }
      } catch (error: any) {
        if (!mounted) return;

        setEstimate(null);
        setError(
          error.message || "Failed to calculate product cost"
        );
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
  }, [selectedProduct, quantity]);

  return (
    <div className="w-full">

      {/* NO PRODUCT SELECTED */}
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
            Select a product to calculate its estimated cost.
          </p>
        </div>
      )}

      {/* INVALID QUANTITY */}
      {/* INVALID QUANTITY */}
      {selectedProduct && (!quantity || quantity <= 0) && (
        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-8 text-center">
          <Package2
            size={40}
            className="mx-auto mb-3 text-blue-500"
          />

          <p className="font-semibold text-blue-700">
            {selectedProduct.name}
          </p>

          <p className="mt-1 text-sm text-blue-600">
            Enter a valid quantity to calculate the cost.
          </p>
        </div>
      )}

      {/* LOADING */}
      {selectedProduct && quantity > 0 && isSubmitting && (
        <div className="rounded-3xl border border-gray-200 bg-white px-3 py-10 text-center shadow-sm">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="font-semibold text-gray-700">
            Calculating product cost...
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {selectedProduct.name} — {quantity} {transactionUnit}
          </p>
        </div>
      )}

      {/* ERROR */}
      {error && !isSubmitting && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>
      )}

      {/* ESTIMATE */}
      {estimate && selectedProduct && !isSubmitting && (
        <div className="w-full overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

          {/* HEADER */}
          <div className="flex flex-col gap-2 border-b bg-gradient-to-r from-cyan-50 to-white px-6 py-4">
            <h3 className="text-lg font-bold text-gray-800">
              Product Cost Estimate
            </h3>

            <p className="text-sm text-gray-500">
              {selectedProduct.name} — {quantity} {transactionUnit}
            </p>
          </div>

          {/* SUMMARY */}
          <div className="grid grid-cols-1 gap-4 border-b bg-gray-50 p-6 md:grid-cols-5">

            <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3">
              <p className="text-sm text-gray-500">
                Cost / Unit
              </p>

              <p className="mt-2 text-xl font-bold text-green-700">
                ₹ {(estimate.totalEstimatedCost / quantity).toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="text-sm text-gray-500">
                Production Quantity
              </p>

              <p className="mt-2 text-xl font-bold text-blue-700">
                {Number(quantity).toFixed(2)} {transactionUnit}
              </p>
            </div>

            
 <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
              <p className="text-sm text-gray-600">
                Total Product Cost
              </p>

              <p className="mt-2 text-xl font-bold text-green-700">
                ₹ {estimate.totalEstimatedCost.toFixed(2)}
              </p>
            </div>
        

            <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
              <p className="text-sm text-gray-600">
                Recipe / Raw Material Cost
              </p>

              <p className="mt-2 text-xl font-bold text-cyan-700">
                ₹ {estimate.rawMaterialCost.toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
              <p className="text-sm text-gray-600">
                Additional Expense Cost
              </p>

              <p className="mt-2 text-xl font-bold text-orange-700">
                ₹ {estimate.additionalExpenseCost.toFixed(2)}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                ₹ {estimate.expenseCostPerUnit.toFixed(2)} per unit
              </p>
            </div>

           

          </div>
<div className="flex ">

    {/* RAW MATERIAL DETAILS */}
          <div className="p-6">

            <h3 className="mb-4 font-bold text-gray-800">
              Raw Material Details
            </h3>

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
                      Average Cost
                    </th>

                    <th className="px-6 py-4 text-right font-semibold">
                      Estimated Cost
                    </th>

                  </tr>
                </thead>

                <tbody>
                  {estimate.items.map((item: any) => (
                    <tr
                      key={item.inventoryItemId}
                      className="border-b border-slate-100 hover:bg-cyan-50 transition"
                    >

                      <td className="px-6 py-3 font-semibold text-gray-800">
                        {item.itemName}
                      </td>

                      <td className="px-6 py-3 text-right">
                        {displayStock_1(
                          item.requiredQty,
                          item.purchaseUnit,
                          item.consumptionUnit,
                          item.conversionFactor
                        )}
                      </td>

                      <td className="px-6 py-3 text-right">
                        ₹ {Number(item.averageCost).toFixed(2)}
                      </td>

                      <td className="px-6 py-3 text-right font-semibold text-cyan-700">
                        ₹ {Number(item.totalCost).toFixed(2)}
                      </td>

                    </tr>
                  ))}
                </tbody>

                <tfoot className="bg-cyan-50">
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-3 text-right font-bold"
                    >
                      Raw Material Total
                    </td>

                    <td className="px-6 py-3 text-right font-bold text-cyan-700">
                      ₹ {estimate.rawMaterialCost.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>

              </table>
            </div>
          </div>
          {/* ADDITIONAL EXPENSE DETAILS */}
          {estimate.expenses.length > 0 && (
            <div className=" p-6">

              <h3 className="mb-4 font-bold text-gray-800">
                Additional Expense Details
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full">

                  <thead className="bg-orange-50">
                    <tr className="text-sm text-gray-600">
                      <th className="px-4 py-3 text-left">
                        Expense
                      </th>

                      <th className="px-4 py-3 text-right">
                        Qty / Unit
                      </th>

                      <th className="px-4 py-3 text-right">
                        Cost / Unit
                      </th>

                      <th className="px-4 py-3 text-right">
                        Total Cost
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {estimate.expenses.map((expense: any, index: number) => (
                      <tr
                        key={`${expense.expenseMasterId}-${index}`}
                        className="border-b border-slate-100"
                      >
                        <td className="px-4 py-3 font-medium">
                          {expense.expenseName}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {Number(expense.estimatedQuantity).toFixed(3)}{" "}
                          {expense.unit}
                        </td>

                        <td className="px-4 py-3 text-right">
                          ₹ {Number(expense.cost).toFixed(2)}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold text-orange-700">
                          ₹ {Number(expense.estimatedTotalCost).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>
          )}

        
</div>
        </div>
      )}
    </div>
  );
}
