
"use client";

import React, {
  useMemo,
  useState,
} from "react";

import { useForm } from "react-hook-form";

import { Search, Package2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { InventoryItemType } from "@/lib/types/InventoryItemType";

import { adjustInventoryStock } from "@/app/(universal)/action/inventory/adjustInventoryStock";
import { InventoryTransactionNameType } from "@/lib/types/InventoryTransactionType";
import { getPrimaryPurchaseMapping } from "@/utils/getPrimaryPurchaseMapping";
import { displayStock } from "@/utils/inventory/displayStock";

type Props = {
  inventoryItems: InventoryItemType[];
};

type FormType = {
  inventoryItemId: string;

  type:InventoryTransactionNameType;

  direction:
    | "IN"
    | "OUT"; 

  quantity: number;

  note: string;
};

export default function StockAdjustmentForm({
  inventoryItems,
}: Props) {
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [showDropdown, setShowDropdown] =
    useState(false);

  const [
    selectedInventory,
    setSelectedInventory,
  ] =
    useState<InventoryItemType | null>(
      null
    );

const selectedMapping =
  selectedInventory
    ? getPrimaryPurchaseMapping(selectedInventory)
    : null;


  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<FormType>({
    defaultValues: {
      type: "PURCHASE",
      direction: "IN",
      quantity: 0,
      note: "",
    },
  });

  const type = watch(
    "type"
  );

  // =====================================================
  // AUTO SET STOCK DIRECTION
  // =====================================================

  React.useEffect(() => {
    if (
      type === "PURCHASE" ||
      type === "OPENING" ||
      type === "RETURN"
    ) {
      setValue("direction", "IN");
    }

    if (
      type === "WASTAGE"
    ) {
      setValue("direction", "OUT");
    }
  }, [type, setValue]);

  // =====================================================
  // FILTER INVENTORY
  // =====================================================

  const filteredInventory =
    useMemo(() => {
      if (!search.trim()) return [];

      return inventoryItems
        .filter((item) =>
          item.name
            ?.toLowerCase()
            .includes(
              search
                .trim()
                .toLowerCase()
            )
        )
        .slice(0, 20);
    }, [search, inventoryItems]);

  // =====================================================
  // SUBMIT
  // =====================================================

  async function onSubmit(
    data: FormType
  ) {
    if (!selectedInventory) {
      alert(
        "Please select inventory item"
      );

      return;
    }

    setIsSubmitting(true);

    try {

      
      const result = await adjustInventoryStock({
  inventoryItemId: data.inventoryItemId,

  type: data.type,

  direction: data.direction,

  quantity: Number(data.quantity),

  unitCost: 0,

  paymentStatus: "PAID", // or whatever values your PaymentStatus type allows

 // paymentMethod: "CASH",

  note: data.note,

  createdBy: "admin",

  referenceType: "MANUAL",
});

      if (result.success) {
        alert(
          "Inventory updated successfully"
        );

        reset({
          type:
            "PURCHASE",

          direction: "IN",

          quantity: 0,

          note: "",

          inventoryItemId: "",
        });

        setSelectedInventory(null);

        setSearch("");
      } else {
        alert(
          result.message
        );
      }
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong"
      );
    }

    setIsSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">
      <div className="max-w-3xl mx-auto">

        {/* ===================================================== */}
        {/* HEADER */}
        {/* ===================================================== */}

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Stock Adjustment
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Add or remove inventory
            stock manually
          </p>
        </div>

        {/* ===================================================== */}
        {/* FORM */}
        {/* ===================================================== */}

        <form
          onSubmit={handleSubmit(
            onSubmit
          )}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5"
        >

          {/* ===================================================== */}
          {/* INVENTORY SEARCH */}
          {/* ===================================================== */}

          <div className="flex flex-col gap-2">
            <label className="label-style-4">
              Inventory Item
            </label>

            <div className="relative">

              {!search.trim() && (
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
              )}

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(
                    e.target.value
                  );

                  setShowDropdown(
                    true
                  );
                }}
                placeholder="Search inventory item..."
                className={`input-style-4 pr-4 ${
                  !search.trim()
                    ? "pl-12"
                    : "pl-4"
                }`}
              />

              {/* DROPDOWN */}

              {showDropdown &&
                filteredInventory.length >
                  0 && (
                  <div className="absolute z-50 mt-2 w-full max-h-80 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl">

                    {filteredInventory.map(
                      (item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedInventory(
                              item
                            );

                            setValue(
                              "inventoryItemId",
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
                          <div className="font-medium text-gray-800">
                            {
                              item.name
                            }
                          </div>

                         {(() => {
  const mapping =
    getPrimaryPurchaseMapping(item);

  return displayStock(
    item.currentStock ?? 0,
    mapping.purchaseUnit,
    item.consumptionUnit,
    mapping.factor
  );
})()}
                        </button>
                      )
                    )}
                  </div>
                )}
            </div>

            <input
              type="hidden"
              {...register(
                "inventoryItemId"
              )}
            />
          </div>

          {/* ===================================================== */}
          {/* CURRENT STOCK */}
          {/* ===================================================== */}

          {selectedInventory && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 flex items-center justify-between">

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Package2
                    className="text-blue-600"
                    size={22}
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">
                    {
                      selectedInventory.name
                    }
                  </h3>

                  <p className="text-sm text-gray-500">
                    Current Stock
                  </p>
                </div>
              </div>

              <div className="text-2xl font-bold text-blue-700">
             {selectedMapping &&
  displayStock(
    selectedInventory.currentStock ?? 0,
    selectedMapping.purchaseUnit,
    selectedInventory.consumptionUnit,
    selectedMapping.factor
  )}
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TYPE */}
          {/* ===================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Transaction Type
              </label>

              <select
                {...register(
                  "type"
                )}
                className="input-style-4"
              >
                <option value="PURCHASE">
                  Purchase
                </option>

                <option value="OPENING">
                  Opening Stock
                </option>

                <option value="ADJUSTMENT">
                  Adjustment
                </option>

                <option value="WASTAGE">
                  Wastage
                </option>

                <option value="RETURN">
                  Return
                </option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Stock Direction
              </label>

              <select
                {...register(
                  "direction"
                )}
                className="input-style-4"
              >
                <option value="IN">
                  Add Stock
                </option>

                <option value="OUT">
                  Remove Stock
                </option>
              </select>
            </div>
          </div>

          {/* ===================================================== */}
          {/* QUANTITY */}
          {/* ===================================================== */}

          <div className="flex flex-col gap-2">
            <label className="label-style-4">
              Quantity
            </label>

            <input
              type="number"
              step="0.001"
              {...register(
                "quantity"
              )}
              className="input-style-4"
              placeholder="0"
            />
          </div>

          {/* ===================================================== */}
          {/* NOTE */}
          {/* ===================================================== */}

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

          {/* ===================================================== */}
          {/* SAVE */}
          {/* ===================================================== */}

          <Button
            type="submit"
            disabled={
              isSubmitting
            }
            className="btn-save-4 h-11"
          >
            {isSubmitting
              ? "Saving..."
              : "Save Stock Adjustment"}
          </Button>
        </form>
      </div>
    </div>
  );
}
