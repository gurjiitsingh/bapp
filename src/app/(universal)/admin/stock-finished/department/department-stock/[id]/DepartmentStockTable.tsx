"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import ReturnToDepartmentDialog from "./ReturnToDepartmentDialog";
import Link from "next/link";
import { formatQuantity } from "@/utils/inventory/formatQty";
import { displayStock } from "@/utils/inventory/displayStock";
import { DepartmentStockType } from "@/lib/types/department/DepartmentStockType";

type Props = {
   departmentName: string; 
  data: DepartmentStockType[];
};

export default function DepartmentStockTable({
  data,
  departmentName,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = data.filter((item) =>
    item.inventoryItemName
      .toLowerCase()
      .includes(search.toLowerCase())
  );
   

    const [returnOpen, setReturnOpen] = useState(false);

const [selectedItem, setSelectedItem] = useState<any>(null);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

            {/* <ReturnToDepartmentDialog
        open={returnOpen}
        onClose={() => {
          setReturnOpen(false);
          setSelectedItem(null);
        }}
         departmentName={departmentName}
  item={selectedItem}
      /> */}
      {/* Header */}

 <div className="m-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4 items-center">
        <h2 className="font-semibold text-gray-800">
  Department Stock -{" "}
  <span className="text-amber-600">
    {departmentName}
  </span>
</h2>

        <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
          <Search size={16} className="text-gray-400" />

          <input
            placeholder="Search item..."
            className="text-sm outline-none"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>
        </div>
        <div className="flex gap-4">
          <Link
            href="/admin/stock-finished/department/issue-stock/add"
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#00796b]"
          >
            Issue Stock
          </Link>

           <Link
            href="/admin/stock-finished/department/return-stock/add"
            className="inline-flex items-center justify-center rounded-xl bg-slate-400 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#00796b]"
          >
            Return Stock to main store
          </Link>
          <Link
            href="/admin/stock-finished/department"
            className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#00796b]"
          >
            All Departments
          </Link>
          <Link
            href="/admin/stock-finished/department/add"
            className="inline-flex items-center justify-center rounded-xl bg-[#00897b] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#00796b]"
          >
            + Add Department
          </Link>
        </div>
      </div>


      <div className="flex items-center justify-between border-b border-gray-100 p-4">
     
      </div>



      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3 font-medium">
                Item
              </th>

              <th className="px-4 py-3 font-medium text-right">
                Quantity
              </th>

              {/* <th className="px-4 py-3 font-medium">
                Unit
              </th> */}

              <th className="px-4 py-3 font-medium text-right">
                Avg Cost
              </th>

              <th className="px-4 py-3 font-medium text-right">
                Stock Value
              </th>
              {/* <th>
                Action
              </th> */}
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-gray-500"
                >
                  No items found
                </td>
              </tr>
            )}

            {filtered.map((item) => (
              <tr
                key={item.inventoryItemId}
                className="border-t border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-medium text-gray-800">
                  {item.inventoryItemName}
                </td>

                <td className="px-4 py-3 text-right font-medium">
                {/* //  {item.quantity.toLocaleString("en-IN")} */}

   <span className="font-medium">
 

     {displayStock(
                item.quantity!,
                item.purchaseUnit,
                item.consumptionUnit,
                item.conversionFactor
              )}
                     
                      </span>

      
                  
                </td>

                {/* <td className="px-4 py-3 text-gray-600"> 
                  {item.purchaseUnit}
                </td> */}

                <td className="px-4 py-3 text-right">
                  ₹
                  {(item.averageCost).toFixed(2)}
                </td>

                <td className="px-4 py-3 text-right font-semibold text-green-700">
                  ₹
                  {(item.stockValue!).toFixed(
                    2
                  )}
                </td>
                 {/* <td className="px-4 py-3 text-right font-semibold text-green-700">
                      <button
        type="button"
   onClick={() => {
  setSelectedItem(item);
  setReturnOpen(true);
}}
        className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm text-white hover:bg-amber-600"
      >
        Return qty
      </button> 
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}