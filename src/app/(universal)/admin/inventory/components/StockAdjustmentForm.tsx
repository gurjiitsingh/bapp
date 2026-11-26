
"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Search, Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  InventoryItemType,
  InventoryUnit,
} from "@/lib/types/InventoryItemType";

import { adjustInventoryStock } from "@/app/(universal)/action/inventory/adjustInventoryStock";
import { getPrimaryPurchaseMapping } from "@/utils/getPrimaryPurchaseMapping";

import toast from "react-hot-toast";
import { InventoryTransactionNameType } from "@/lib/types/InventoryTransactionType";
import { adjustInventoryStockNew } from "@/app/(universal)/action/inventory/adjustInventoryStockNew";

type Props = {
  inventoryItems: InventoryItemType[];
};

type FormType = {
  inventoryItemId: string;
  type: InventoryTransactionNameType;
  direction: "IN" | "OUT";
  quantity: number;
  transactionUnit: InventoryUnit;
  averageCost: number;
  note: string;
};

export default function StockAdjustmentForm({
  inventoryItems,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedInventory, setSelectedInventory] =
    useState<InventoryItemType | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<FormType>({
    defaultValues: {
      inventoryItemId: "",
      type: "OPENING_STOCK",
      direction: "IN",
      quantity: 0,
      averageCost: 0,
      transactionUnit: "gm",
      note: "",
    },
  });

  const type = watch("type");
  const direction = watch("direction");
  const transactionUnit = watch("transactionUnit");
const showPriceInput = type === "OPENING_STOCK";
  // =====================================================
  // SELECTED PURCHASE MAPPING
  // =====================================================

  const selectedMapping =
    selectedInventory?.purchaseMappings?.find(
      (mapping) => mapping.purchaseUnit === transactionUnit
    ) ?? (selectedInventory
      ? {
          purchaseUnit: selectedInventory.consumptionUnit,
          consumptionUnit: selectedInventory.consumptionUnit,
          factor: 1,
        }
      : null);

  // =====================================================
  // FILTER INVENTORY
  // =====================================================

  const filteredInventory = useMemo(() => {
    if (!search.trim()) return [];

    return inventoryItems
      .filter((item) =>
        item.name?.toLowerCase().includes(search.trim().toLowerCase())
      )
      .slice(0, 20);
  }, [search, inventoryItems]);

  // =====================================================
  // SELECT INVENTORY
  // =====================================================

function handleSelectInventory(item: InventoryItemType) {
  const mapping = getPrimaryPurchaseMapping(item);

  setSelectedInventory(item);

  setValue("inventoryItemId", item.id);
  setValue("transactionUnit", mapping.purchaseUnit);

  // Start new inputs empty.
  setValue("quantity", undefined as unknown as number);
  setValue("averageCost", undefined as unknown as number);

  setSearch(item.name);
  setShowDropdown(false);
}

  // =====================================================
  // TRANSACTION TYPE
  // =====================================================

function handleTypeChange(value: InventoryTransactionNameType) {
  setValue("type", value);

  if (value === "OPENING_STOCK") {
    setValue("direction", "IN");
  }

  if (value === "ADJUSTMENT" || value === "WASTAGE" || value === "CLEAR") {
    setValue("direction", "OUT");
  }

  // Clear new input fields when transaction type changes.
  setValue("quantity", undefined as unknown as number);
  setValue("averageCost", undefined as unknown as number);
}

  // =====================================================
  // SUBMIT
  // =====================================================

  async function onSubmit(data: FormType) {
    if (isSubmitting) return;

    if (!selectedInventory) {
      toast.error("Please select inventory item.");
      return;
    }

    const mapping =
      selectedInventory.purchaseMappings?.find(
        (item) => item.purchaseUnit === data.transactionUnit
      ) ?? {
        purchaseUnit: selectedInventory.consumptionUnit,
        factor: 1,
      };

    const inputQuantity = Number(data.quantity || 0);
 
    const currentAverageCost = Number(
  selectedInventory.averageCost ?? 0
);

const inputPrice =
  data.type === "OPENING_STOCK"
    ? Number(data.averageCost || 0)
    : currentAverageCost;

    if (
      data.type !== "CLEAR" &&
      (!Number.isFinite(inputQuantity) || inputQuantity <= 0)
    ) {
      toast.error("Please enter a valid quantity.");
      return;
    }

    if (
      data.type !== "WASTAGE" &&
      data.type !== "CLEAR" &&
      data.direction === "IN" &&
      (!Number.isFinite(inputPrice) || inputPrice <= 0)
    ) {
      toast.error("Please enter a valid purchase price.");
      return;
    }

    const decimalAllowedUnits = ["kg", "gm", "ltr", "ml"];

    if (
      data.type !== "CLEAR" &&
      !decimalAllowedUnits.includes(data.transactionUnit) &&
      !Number.isInteger(inputQuantity)
    ) {
      toast.error(
        `Decimal quantity not allowed for ${data.transactionUnit}`
      );
      return;
    }

    setIsSubmitting(true);

    const showPriceInput =
  type === "OPENING_STOCK" ||
  (type === "ADJUSTMENT" && direction === "IN");

    try {
      console.log("Inventory Item ID:", selectedInventory.id);
      console.log("Type:", data.type);
      console.log("Direction:", data.direction);

      console.log(
        "Current Quantity:",
        selectedInventory.currentStock ?? 0
      );

      console.log(
        "Current Average Price:",
        selectedInventory.averageCost ?? 0
      );

      console.log("New Input Quantity:", inputQuantity);
      console.log("New Input Price:", inputPrice);
      console.log("Purchase Unit:", data.transactionUnit);
      console.log("Conversion Factor:", mapping.factor);

      const result = await adjustInventoryStockNew({
        inventoryItemId: selectedInventory.id,

        type: data.type,
        direction: data.direction,

        // Current values: reference only.
        // Server must fetch the authoritative values from Firestore.
        currentStock: selectedInventory.currentStock ?? 0,
        currentAverageCost: selectedInventory.averageCost ?? 0,

        // Raw values entered by the user.
        inputQuantity,
        inputPrice,

        purchaseUnit: data.transactionUnit,
        conversionFactor: mapping.factor,

        paymentStatus: "PAID",
        note: data.note,
        createdBy: "admin",
      });

     if (!result.success) {
  toast.error(result.message);
  return;
}

toast.success("Stock adjustment saved successfully.");

      // Reset only the new inputs.
      reset({
        inventoryItemId: selectedInventory.id,
        type: "OPENING_STOCK",
        direction: "IN",
        quantity: 0,
        averageCost: 0,
        transactionUnit: getPrimaryPurchaseMapping(selectedInventory)
          .purchaseUnit,
        note: "",
      });

      // Do not calculate updated stock on the client.
      // Refresh inventory data from the server when needed.
    } catch (error) {
      console.error("Stock adjustment error:", error);
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">
      <div className="max-w-3xl">

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Stock Adjustment
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Adjust inventory quantity and valuation manually.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5"
        >

          {/* INVENTORY SEARCH */}

          <div className="flex flex-col gap-2">
            <label className="label-style-4">
              Inventory Item
            </label>

            <div className="relative">
              {!search.trim() && (
                <Search
                  size={18}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                />
              )}

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowDropdown(true);
                }}
                placeholder="Search inventory item..."
                className={`input-style-4 pr-4 ${
                  !search.trim() ? "pl-12" : "pl-4"
                }`}
              />

              {showDropdown && filteredInventory.length > 0 && (
                <div className="absolute z-50 mt-2 w-full max-h-80 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl">

                  {filteredInventory.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectInventory(item)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-0"
                    >
                      <div className="font-medium text-gray-800">
                        {item.name}
                      </div>

                      <div className="text-xs text-gray-400">
                        Current: {item.currentStock ?? 0}{" "}
                        {item.consumptionUnit}
                      </div>
                    </button>
                  ))}

                </div>
              )}
            </div>

            <input
              type="hidden"
              {...register("inventoryItemId")}
            />
          </div>

          {/* CURRENT VALUES */}

        
{selectedInventory && (() => {
  const mapping = getPrimaryPurchaseMapping(selectedInventory);

  const purchaseQuantity =
    (selectedInventory.currentStock ?? 0) / mapping.factor;

  const purchaseUnitPrice =
    (selectedInventory.averageCost ?? 0) ;

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">

      <div className="flex items-center gap-2 mb-3">
        <Package2 className="text-blue-600" size={22} />

        <h3 className="font-semibold text-gray-800">
          Current Inventory Values
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">

        <div>
          <p className="text-xs text-gray-500">
            Current Quantity
          </p>

          <p className="text-lg font-bold text-blue-700">
            {purchaseQuantity.toFixed(3)} {mapping.purchaseUnit}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">
            Current Average Price
          </p>

          <p className="text-lg font-bold text-blue-700">
            ₹{purchaseUnitPrice.toFixed(2)}
            <span className="text-xs font-normal text-gray-500">
              {" "}/ {mapping.purchaseUnit}
            </span>
          </p>
        </div>

      </div>
    </div>
  );
})()}


          {/* TRANSACTION TYPE */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Transaction Type
              </label>

              <select
                value={type}
                onChange={(e) =>
                  handleTypeChange(
                    e.target.value as InventoryTransactionNameType
                  )
                }
                className="input-style-4"
              >
                <option value="OPENING_STOCK">Opening Stock</option>
                <option value="WASTAGE">Wastage</option>
                <option value="ADJUSTMENT">Adjustment</option>
                <option value="CLEAR">CLEAR</option>
              </select>
            </div>

            {type === "ADJUSTMENT" && (
              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Stock Direction
                </label>

            <select
  value={direction}
  onChange={(e) => {
    const value = e.target.value as "IN" | "OUT";

    setValue("direction", value);

    if (value === "OUT") {
      setValue("averageCost", 0);
    }
  }}
  className="input-style-4"
>
  <option value="IN">Add Stock</option>
  <option value="OUT">Remove Stock</option>
</select>
              </div>
            )}

          </div>

          {/* NEW QUANTITY AND UNIT */}

          {type !== "CLEAR" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  New Quantity
                </label>

                <input
                  type="number"
                  step="0.001"
                  {...register("quantity", {
                    valueAsNumber: true,
                  })}
                  className="input-style-4"
                  placeholder="Enter new quantity"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Unit
                </label>

                <select
                  {...register("transactionUnit")}
                  className="input-style-4"
                >
                  {selectedInventory?.purchaseMappings?.map((mapping) => (
                    <option
                      key={mapping.purchaseUnit}
                      value={mapping.purchaseUnit}
                    >
                      {mapping.purchaseUnit}
                    </option>
                  ))}

                  {selectedInventory &&
                    (!selectedInventory.purchaseMappings ||
                      selectedInventory.purchaseMappings.length === 0) && (
                      <option value={selectedInventory.consumptionUnit}>
                        {selectedInventory.consumptionUnit}
                      </option>
                    )}
                </select>
              </div>

            </div>
          )}

          {/* NEW PRICE */}

{/* NEW PRICE */}

{showPriceInput && (
  <div className="flex flex-col gap-2">
    <label className="label-style-4">
      New Purchase Price
    </label>

    <input
      type="number"
      step="0.01"
      {...register("averageCost", {
        valueAsNumber: true,
      })}
      className="input-style-4"
      placeholder="Enter price per selected unit"
    />
  </div>
)}

          {/* NOTE */}

          <div className="flex flex-col gap-2">
            <label className="label-style-4">
              Note
            </label>

            <textarea
              {...register("note")}
              rows={4}
              placeholder="Optional note..."
              className="input-style-4 resize-none"
            />
          </div>

          {/* SAVE */}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="btn-save-4 h-11"
          >
            {isSubmitting ? "Saving..." : "Save Stock Adjustment"}
          </Button>

        </form>
      </div>
    </div>
  );
}
