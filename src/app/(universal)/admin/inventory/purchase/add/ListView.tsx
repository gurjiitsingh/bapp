"use client";

import React, { useEffect, useMemo, useState } from "react";
import { InventoryItemType } from "@/lib/types/InventoryItemType";
import { InventoryCategory } from "@/lib/types/InventoryCategory";

type Props = {
  inventoryItems: InventoryItemType[];

};

export default function ListView({
  inventoryItems,
 
}: Props) {
  // State to keep track of the currently selected/clicked item ID
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const [filtered, setFiltered] = useState<InventoryItemType[]>([]);
  const [search, setSearch] = useState("");

  // FILTER (keeping simple search functionality if you still want it, or you can remove it)
  useEffect(() => {
    let list = [...inventoryItems];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((item) =>
        item.name?.toLowerCase().includes(q)
      );
    }

    setFiltered(list);
  }, [search, inventoryItems]);

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto p-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Inventory Items
      </h2>

      {/* Optional: Simple Search Bar */}
      <input
        type="text"
        placeholder="Filter item name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Simple List of Item Names */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
        {filtered.length > 0 ? (
          filtered.map((item) => {
            const isSelected = selectedItemId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className={`px-4 py-3 cursor-pointer transition-colors duration-150 flex items-center justify-between ${
                  isSelected
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span>{item.name}</span>
                {isSelected && (
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                    Selected
                  </span>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-400">
            No items found
          </div>
        )}
      </div>

      {/* Debug/Display current selected ID */}
      <div className="text-xs text-gray-500 mt-2">
        Current Selected ID: <span className="font-mono">{selectedItemId || "None"}</span>
      </div>
    </div>
  );
}