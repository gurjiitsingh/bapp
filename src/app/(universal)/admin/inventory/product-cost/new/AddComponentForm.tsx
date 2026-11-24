"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  TnewProductRecipeSchema,
} from "@/lib/types/ProductRecipeType";

import { InventoryItemType } from "@/lib/types/InventoryItemType";
import { ProductStockType } from "@/lib/types/productStockType";

type Props = {
  selectedProduct: ProductStockType | null;
  inventoryItems: InventoryItemType[];
  isSubmitting?: boolean;
  onSubmit: (data: TnewProductRecipeSchema) => Promise<void>;
};

export default function AddComponentForm({
  selectedProduct,
  inventoryItems,
  isSubmitting = false,
  onSubmit,
}: Props) {
  const [search, setSearch] = useState("");

  const [quantities, setQuantities] = useState<
    Record<string, string>
  >({});

  const [savingItemId, setSavingItemId] = useState<string | null>(null);

  // FILTER INVENTORY
  const filteredInventory = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return inventoryItems;

    return inventoryItems
      .filter((item) =>
        (item.name || "").toLowerCase().startsWith(query)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [search, inventoryItems]);

  // UPDATE QUANTITY
  function handleQuantityChange(
    itemId: string,
    value: string
  ) {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  }

  // ADD INVENTORY ITEM
  async function handleAdd(item: InventoryItemType) {
    if (!selectedProduct) return;

    const quantity = Number(quantities[item.id] || 0);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    setSavingItemId(item.id);

    try {
      await onSubmit({
        productId: selectedProduct.id,
        inventoryItemId: item.id,
        quantity,
        unit: item.consumptionUnit,
      });

      // Clear only this row's quantity after successful save
      setQuantities((prev) => ({
        ...prev,
        [item.id]: "",
      }));
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setSavingItemId(null);
    }
  }

  return (
    <div className="bg-white flex-1 border border-gray-100 shadow-sm overflow-hidden h-[85dvh]">

      {/* HEADER */}
      <div className="border-b border-gray-100 px-1 py-1">
        <h2 className="text-xl font-bold text-gray-800">
          Add Component
        </h2>

        <p className="text-sm text-gray-500">
          {selectedProduct
            ? selectedProduct.name
            : "Select product first"}
        </p>
      </div>

      {/* SEARCH */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />

          <input
            type="text"
            value={search}
            disabled={!selectedProduct}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory item..."
            className="input-style-4 pl-10 w-full"
          />
        </div>
      </div>

      {/* INVENTORY LIST */}
      <div className="max-h-[600px] overflow-y-auto">

        {/* COLUMN HEADINGS */}
        <div className="hidden md:grid grid-cols-[minmax(0,1fr)_120px_110px_100px] gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500">
          <div>Inventory Item</div>
          <div>Quantity</div>
          <div>Unit</div>
          <div>Action</div>
        </div>

        {filteredInventory.length > 0 ? (
          filteredInventory.map((item) => {
            const isSaving = savingItemId === item.id;

            return (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_120px_110px_100px] gap-2 md:gap-3 items-center px-5 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >

                {/* ITEM NAME */}
                <div className="font-medium text-gray-800">
                  {item.name}
                </div>

                {/* QUANTITY */}
                <div>
                  <label className="md:hidden text-xs text-gray-500">
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    disabled={!selectedProduct || isSaving}
                    value={quantities[item.id] ?? ""}
                    onChange={(e) =>
                      handleQuantityChange(item.id, e.target.value)
                    }
                    placeholder="0.000"
                    className="input-style-4 w-full"
                  />
                </div>

                {/* UNIT */}
                <div>
                  <label className="md:hidden text-xs text-gray-500">
                    Unit
                  </label>

                  <input
                    type="text"
                    readOnly
                    value={item.consumptionUnit}
                    className="input-style-4 w-full bg-gray-50"
                  />
                </div>

                {/* ADD BUTTON */}
                <div>
                  <Button
                    type="button"
                    disabled={
                      !selectedProduct ||
                      isSubmitting ||
                      isSaving
                    }
                    onClick={() => handleAdd(item)}
                    className="btn-save-4 h-10 w-full flex items-center justify-center gap-1"
                  >
                    

                    {isSaving ? "Saving..." : <Plus size={16} />}
                  </Button>
                </div>

              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-sm text-gray-400">
            No inventory items found
          </div>
        )}

      </div>

      {/* FOOTER */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-sm text-gray-500">
        Showing {filteredInventory.length} of {inventoryItems.length} inventory items
      </div>

    </div>
  );
}
 