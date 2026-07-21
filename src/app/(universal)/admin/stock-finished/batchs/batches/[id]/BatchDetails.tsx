"use client";

 
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import ReturnToDepartmentDialog from "./ReturnToDepartmentDialog";
import { displayStock } from "@/utils/inventory/displayStock";
import { ProductionBatchType } from "@/lib/types/batch/ProductionBatch";
import { ProductionBatchItemType } from "@/app/(universal)/action/production/getProductionBatchItem";

type Props = {
  batch: ProductionBatchType ;
  items: ProductionBatchItemType[];
};

export default function BatchDetails({
  batch,
  items,
}: Props) {

   
 

  const [returnOpen, setReturnOpen] = useState(false);

const [selectedItem, setSelectedItem] =
  useState<ProductionBatchItemType | null>(null);

  const duration = (() => {
    if (!batch.startTime) return null;

    const end = batch.endTime || Date.now();
    const diff = end - batch.startTime;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = (diff / (1000 * 60 * 60)).toFixed(2);

    return { minutes, hours };
  })();

  return (
    <div className="space-y-6">

      <ReturnToDepartmentDialog
  open={returnOpen}
  onClose={() => {
    setReturnOpen(false);
    setSelectedItem(null);
  }}
  batchId={batch.id}
  item={selectedItem}
/>

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Batch Details
          </h1>
          <p className="text-sm text-gray-400">{batch.id}</p>
        </div>

        {batch.status !== "CLOSED" && (
          <Link href={`/admin/stock-finished/batchs/edit-batch/${batch.id}`}>
            <Button className="btn-save-4 shadow-sm">
              Edit Batch
            </Button>
          </Link>
        )}
      </div>

      {/* INFO CARD */}
      <div className="bg-gray-50 rounded-2xl p-5 grid grid-cols-4 gap-4">

        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs text-gray-400">Department</p>
          <p className="font-medium">{batch.departmentName}</p>
        </div>

                      {/* Employees */}
<div className="bg-white rounded-xl p-3 shadow-sm">
  <p className="text-xs text-gray-400">Employees</p>
  <p className="font-medium">{batch.employeeCount}</p>
</div>

        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs text-gray-400">Created At</p>
          <p className="font-medium">
            {batch.startTime
              ? new Date(batch.startTime).toLocaleString()
              : "-"}
          </p>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs text-gray-400">End At</p>
          <p className="font-medium">
            {batch.endTime
              ? new Date(batch.endTime).toLocaleString()
              : "Running..."}
          </p>
        </div>


        {/* Duration */}
        <div className="bg-blue-50 rounded-xl p-3">
          <p className="text-xs text-blue-500">Duration</p>
          <p className="font-semibold text-blue-700">
            {duration
              ? `${duration.hours} hrs (${duration.minutes} min)`
              : "-"}
          </p>
        </div>

  

{/* Total Labor Hours */}
<div className="bg-purple-50 rounded-xl p-3">
  <p className="text-xs text-purple-500">Total Work Hours</p>
  <p className="font-semibold text-purple-700">
    {batch.laborHours?.toFixed(2)} hrs
  </p>
</div>

        {/* Status */}
        <div
          className={`rounded-xl p-3 ${batch.status === "CLOSED"
              ? "bg-red-50"
              : "bg-green-50"
            }`}
        >
          <p className="text-xs text-gray-500">Status</p>
          <p
            className={`font-semibold ${batch.status === "CLOSED"
                ? "text-red-600"
                : "text-green-600"
              }`}
          >
            {batch.status === "CLOSED" ? "Closed" : "Open"}
          </p>
        </div>

        {/* Note */}
        <div className="col-span-3 bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs text-gray-400">Note</p>
          <p>{batch.note || "-"}</p>
        </div>
      </div>

      {/* PRODUCTION SUMMARY */}
      <div className="grid grid-cols-4 gap-4">

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400">Output Quantity</p>
          <p className="text-lg font-semibold">{batch.outputQty}</p>
        </div>

       <div className="bg-white rounded-xl p-4 shadow-sm">
  <p className="text-xs text-gray-400">Batch Cost</p>
  <p className="text-lg font-semibold">
    ₹ {Number(batch.batchCost).toFixed(2)}
  </p>
</div>

        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-xs text-green-500">Avg Cost / Unit</p>
          <p className="text-lg font-semibold text-green-700">
            ₹ {Number(batch.avgCostPerUnit).toFixed(2)}
          </p>
        </div>

        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-xs text-amber-500">Cost Check</p>
          <p className="text-lg font-semibold text-amber-700">
         ₹ {(
  Number(batch.batchCost) /
  Math.max(Number(batch.outputQty), 1)
).toFixed(2)}
          </p>
        </div>

      </div>

      {/* ITEMS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

        <div className="grid grid-cols-5 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-500">
          <div>Item</div>
          <div>Qty</div>
          <div>Cost</div>
          <div>Total</div>
           <div className="text-right">Action</div>
        </div>

        {items.map((item: any) => (
          <div
            key={item.id}
            className="grid grid-cols-5 px-4 py-3 hover:bg-gray-50 transition"
          >
            <div className="font-medium text-gray-800">
              {item.inventoryItemName}
            </div>

            <div>
            

                       {displayStock(
                item.quantity,
                item.purchaseUnit,
                item.consumptionUnit,
                item.conversionFactor
              )}
            </div>

            <div>
              ₹ {(item.averageCost).toFixed(2)}/{item.purchaseUnit}
            </div>

            <div className="font-semibold">
              ₹ {item.itemTotalCost}
            </div>
            <div className="text-right">
      <button
        type="button"
   onClick={() => {
  setSelectedItem(item);
  setReturnOpen(true);
}}
        className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm text-white hover:bg-amber-600"
      >
      Not Used quantity
      </button>
    </div>
          </div>
        ))}

        {!items.length && (
          <div className="text-center py-6 text-gray-400">
            No items found
          </div>
        )}
      </div>

      {/* TOTAL */}
    {/* <div className="text-right text-xl font-semibold text-gray-800">
  Batch Cost: ₹ {Number(batch.batchCost).toFixed(2)}
</div> */}

    </div>
  );
}