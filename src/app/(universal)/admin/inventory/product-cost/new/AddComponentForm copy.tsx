"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  TnewProductRecipeSchema,
  newProductRecipeSchema,
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
  const [inventorySearch, setInventorySearch] = useState("");
  const [showInventory, setShowInventory] = useState(false);

  const inventoryRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
  } = useForm<TnewProductRecipeSchema>({
    resolver: zodResolver(newProductRecipeSchema),
    defaultValues: {
      productId: "",
      inventoryItemId: "",
      quantity: 0,
      unit: "",
    },
  });

  const selectedInventoryId = watch("inventoryItemId");

  // UPDATE PRODUCT ID WHEN PRODUCT CHANGES
  useEffect(() => {
    setValue("productId", selectedProduct?.id ?? "");
    setValue("inventoryItemId", "");
    setValue("quantity", 0);
    setValue("unit", "");

    setInventorySearch("");
    setShowInventory(false);
  }, [selectedProduct, setValue]);

  // FILTER INVENTORY
  const filteredInventory = useMemo(() => {
    const query = inventorySearch.trim().toLowerCase();

    if (!query) return inventoryItems;

    return inventoryItems
      .filter((item) =>
        (item.name || "").toLowerCase().startsWith(query)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [inventorySearch, inventoryItems]);

  // AUTO SET UNIT
  useEffect(() => {
    if (!selectedInventoryId) return;

    const inventory = inventoryItems.find(
      (item) => item.id === selectedInventoryId
    );

    if (inventory) {
      setValue("unit", inventory.consumptionUnit);
    }
  }, [selectedInventoryId, inventoryItems, setValue]);

  // CLOSE DROPDOWN
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        inventoryRef.current &&
        !inventoryRef.current.contains(event.target as Node)
      ) {
        setShowInventory(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowInventory(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // SELECT INVENTORY ITEM
  function handleSelectInventory(item: InventoryItemType) {
    setValue("inventoryItemId", item.id);
    setValue("unit", item.consumptionUnit);

    setInventorySearch(item.name);
    setShowInventory(false);
  }

  // SUBMIT FORM
  async function handleFormSubmit(data: TnewProductRecipeSchema) {
    await onSubmit(data);

    // Reset only after successful callback completion
    reset({
      productId: selectedProduct?.id ?? "",
      inventoryItemId: "",
      quantity: 0,
      unit: "",
    });

    setInventorySearch("");
    setShowInventory(false);
  }

  return (
    <div className="bg-white border w-[500px] border-gray-100 shadow-sm overflow-hidden h-fit">

      <div className="border-b border-gray-100 px-6 py-5">
        <h2 className="text-xl font-bold text-gray-800">
          Add Component
        </h2>

        <p className="text-sm text-gray-500">
          {selectedProduct
            ? selectedProduct.name
            : "Select product first"}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="p-6 flex flex-col gap-5"
      >
        <input type="hidden" {...register("productId")} />

        {/* INVENTORY SEARCH */}
        <div className="flex flex-col gap-2">
          <label className="label-style-4">
            Inventory Item
          </label>

          <div className="relative" ref={inventoryRef}>
            {!inventorySearch.trim() && (
              <Search
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={18}
              />
            )}

            <input
              type="text"
              disabled={!selectedProduct}
              value={inventorySearch}
              onChange={(e) => {
                setInventorySearch(e.target.value);
                setValue("inventoryItemId", "");
                setValue("unit", "");
                setShowInventory(true);
              }}
              onFocus={() => setShowInventory(true)}
              placeholder="Search inventory item..."
              className={`input-style-4 pr-4 ${
                !inventorySearch.trim() ? "pl-12" : "pl-4"
              } ${
                !selectedProduct
                  ? "opacity-60 cursor-not-allowed"
                  : ""
              }`}
            />

            <input
              type="hidden"
              {...register("inventoryItemId")}
            />

            {showInventory && selectedProduct && (
              <div className="absolute z-50 mt-2 w-full max-h-80 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl">
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => handleSelectInventory(item)}
                      className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition border-b border-gray-100 last:border-0 ${
                        selectedInventoryId === item.id
                          ? "bg-blue-50"
                          : ""
                      }`}
                    >
                      <div className="font-medium text-gray-800">
                        {item.name}
                      </div>

                      <div className="text-xs text-gray-400">
                        {item.consumptionUnit}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-sm text-gray-400">
                    No inventory items found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* QUANTITY */}
        <div className="flex flex-col gap-2">
          <label className="label-style-4">
            Quantity
          </label>

          <input
            type="number"
            step="0.001"
            disabled={!selectedProduct}
            {...register("quantity")}
            onFocus={(e) => {
              if (e.target.value === "0") {
                e.target.value = "";
              }
            }}
            onBlur={(e) => {
              if (e.target.value === "") {
                e.target.value = "0";
              }
            }}
            className="input-style-4"
            placeholder="0.25"
          />
        </div>

        {/* UNIT */}
        <div className="flex flex-col gap-2">
          <label className="label-style-4">
            Unit
          </label>

          <input
            {...register("unit")}
            readOnly
            className="input-style-4 bg-gray-50"
          />
        </div>

        {/* BUTTON */}
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            !selectedProduct
          }
          className="btn-save-4 h-11 flex items-center gap-2"
        >
          <Plus size={18} />

          {isSubmitting ? "Saving..." : "Add Component"}
        </Button>
      </form>
    </div>
  );
}
 