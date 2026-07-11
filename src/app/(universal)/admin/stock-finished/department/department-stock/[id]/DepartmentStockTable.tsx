"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import ReturnToDepartmentDialog from "./ReturnToDepartmentDialog";

type Props = {
  data: {
    inventoryItemId: string;
    inventoryItemName: string;
    quantity: number;
    averageCost: number;
    purchaseUnit: string;
    consumptionUnit: string;
    conversionFactor: number;
    updatedAt: number;
  }[];
};

export default function DepartmentStockTable({
  data,
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
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <h2 className="font-semibold text-gray-800">
          Department Stock
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

              <th className="px-4 py-3 font-medium">
                Unit
              </th>

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
                  {item.quantity.toLocaleString("en-IN")}
                </td>

                <td className="px-4 py-3 text-gray-600">
                  {item.purchaseUnit}
                </td>

                <td className="px-4 py-3 text-right">
                  ₹
                  {(item.averageCost*item.conversionFactor).toFixed(2)}
                </td>

                <td className="px-4 py-3 text-right font-semibold text-green-700">
                  ₹
                  {(item.quantity * item.averageCost*item.conversionFactor).toFixed(
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