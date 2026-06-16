
"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useForm } from "react-hook-form";

import { Search, Package2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { InventoryItemType, InventoryUnit } from "@/lib/types/InventoryItemType";

import { adjustInventoryStock } from "@/app/(universal)/action/inventory/adjustInventoryStock";
import { displayStock } from "@/utils/inventory/displayStock";

type Props = {
  inventoryItems: InventoryItemType[];
};

type FormType = {
  inventoryItemId: string;

  transactionType:
  | "PURCHASE"
  | "OPENING_STOCK"
  | "ADJUSTMENT"
  | "WASTAGE"
  | "SUPPLIER_RETURN"
  | "CUSTOMER_RETURN";

  stockDirection:
  | "IN"
  | "OUT";

  quantity: number;

  transactionUnit: InventoryUnit

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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<FormType>({
    defaultValues: {
      transactionType: "OPENING_STOCK",
      stockDirection: "IN",
      quantity: 0,
      transactionUnit: "pcs",
      note: "",
    },
  });

  const transactionType = watch(
    "transactionType"
  );

  const transactionUnit = watch("transactionUnit");



  // =====================================================
  // AUTO SET STOCK DIRECTION
  // =====================================================

  // React.useEffect(() => {
  //   if (
  //     transactionType === "PURCHASE" ||
  //     transactionType === "OPENING_STOCK" ||
  //     transactionType === "CUSTOMER_RETURN"
  //   ) {
  //     setValue("stockDirection", "IN");
  //   }

  //   if (
  //     transactionType === "WASTAGE"
  //   ) {
  //     setValue("stockDirection", "OUT");
  //   }
  // }, [transactionType, setValue]);



  React.useEffect(() => {
    switch (transactionType) {
      case "PURCHASE":
      case "OPENING_STOCK":
      case "CUSTOMER_RETURN":
        setValue("stockDirection", "IN");
        break;

      case "WASTAGE":
      case "SUPPLIER_RETURN":
        setValue("stockDirection", "OUT");
        break;

      // ADJUSTMENT = manual selection
    }
  }, [transactionType, setValue]);

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

  async function onSubmit(data: FormType) {
    if (isSubmitting) return;

    if (!selectedInventory) {
      alert("Please select inventory item");
      return;
    }

    const decimalAllowedUnits = [
      "kg",
      "gm",
      "ltr",
      "ml",
    ];

    const quantity =
      Number(data.quantity);

    // prevent decimal in pcs
    if (
      !decimalAllowedUnits.includes(
        data.transactionUnit
      ) &&
      !Number.isInteger(quantity)
    ) {
      alert(
        `Decimal quantity not allowed for ${data.transactionUnit}`
      );

      return;
    }

    // =====================================
    // ORIGINAL VALUES
    // =====================================

    const originalQuantity =
      Number(data.quantity);

    // =====================================
    // INTERNAL VALUES
    // =====================================

    let finalQuantity =
      Number(data.quantity);

    // convert purchase -> consumption
    if (
      data.transactionUnit ===
      selectedInventory.purchaseUnit &&
      selectedInventory.purchaseUnit !==
      selectedInventory.consumptionUnit
    ) {
      finalQuantity =
        finalQuantity *
        selectedInventory.conversionFactor;
    }

    setIsSubmitting(true);

    let unitCost = 0;

    // if (
    //   data.transactionType === "OPENING_STOCK" ||
    //   data.transactionType === "CUSTOMER_RETURN"
    // ) {
    //   unitCost =
    //     selectedInventory.costPrice || 0;
    // }

  //   let purchaseUnitCost =
  // selectedInventory.costPrice || 0;

// if (
//   selectedInventory.purchaseUnit !==
//   selectedInventory.consumptionUnit
// ) {
//   purchaseUnitCost =
//     purchaseUnitCost *
//     selectedInventory.conversionFactor;
// }

    try {
      const result =
        await adjustInventoryStock({
          inventoryItemId:
            data.inventoryItemId,

          transactionType:
            data.transactionType,

          stockDirection:
            data.stockDirection,

          // =====================================
          // INTERNAL
          // =====================================

          quantity: finalQuantity,

          unitCost,

          // =====================================
          // ORIGINAL
          // =====================================

          purchaseQuantity:
            originalQuantity,

          purchaseUnit:
            data.transactionUnit,

          purchaseUnitCost:0,

          conversionFactor:
            selectedInventory.conversionFactor,

          paymentStatus: "PAID",

          note: data.note,

          createdBy: "admin",
        });

      if (result.success) {
        let updatedStock =
          selectedInventory.currentStock;

        if (data.stockDirection === "IN") {
          updatedStock! += finalQuantity;
        } else {
          updatedStock! -= finalQuantity;
        }

        setSelectedInventory({
          ...selectedInventory,
          currentStock: updatedStock,
        });

        reset({
          transactionType: "OPENING_STOCK",
          stockDirection: "IN",
          quantity: 0,
          note: "",
          inventoryItemId:
            selectedInventory.id,
        });
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);

      alert("Something went wrong");
    }

    setIsSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">
      <div className="max-w-3xl">

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
                className={`input-style-4 pr-4 ${!search.trim()
                  ? "pl-12"
                  : "pl-4"
                  }`}
              />

              {/* DROPDOWN */}

              {showDropdown &&
                filteredInventory.length >
                0 && (
                  <div className="absolute z-50 mt-2 w-full max-h-80 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl">

                    {filteredInventory.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedInventory(item);

                          setValue(
                            "inventoryItemId",
                            item.id
                          );

                          // default transaction unit
                          setValue(
                            "transactionUnit",
                            item.purchaseUnit
                          );

                          setSearch(item.name);

                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="font-medium text-gray-800">
                          {item.name}
                        </div>

                        <div className="text-xs text-gray-400">
                          Current:{" "}
                          {item.currentStock}{" "}
                          {item.consumptionUnit}
                        </div>
                      </button>
                    ))}
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
                {displayStock(
                  selectedInventory.currentStock!,
                  selectedInventory.purchaseUnit,
                  selectedInventory.consumptionUnit,
                  selectedInventory.conversionFactor
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
                {...register("transactionType")}
                className="input-style-4"
              >
                {/* <option value="PURCHASE">
                  Purchase
                </option> */}

                <option value="OPENING_STOCK">
                  Opening Stock
                </option>

                <option value="CUSTOMER_RETURN">
                  Customer Return
                </option>

                <option value="SUPPLIER_RETURN">
                  Supplier Return
                </option>

                <option value="WASTAGE">
                  Wastage
                </option>

                <option value="ADJUSTMENT">
                  Adjustment
                </option>
              </select>
            </div>

            {transactionType === "ADJUSTMENT" && (
              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Stock Direction
                </label>

                <select
                  {...register("stockDirection")}
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
            )}
          </div>

          {/* ===================================================== */}
          {/* QUANTITY */}
          {/* ===================================================== */}


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Quantity
              </label>

              <input
                type="number"
                step="0.001"
                {...register("quantity")}
                className="input-style-4"
                placeholder="0"
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
                {selectedInventory && (
                  <option
                    value={
                      selectedInventory.purchaseUnit
                    }
                  >
                    {
                      selectedInventory.purchaseUnit
                    }
                  </option>
                )}

                {selectedInventory &&
                  selectedInventory.consumptionUnit !==
                  selectedInventory.purchaseUnit && (
                    <option
                      value={
                        selectedInventory.consumptionUnit
                      }
                    >
                      {
                        selectedInventory.consumptionUnit
                      }
                    </option>
                  )}
              </select>
            </div>

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
      </div >
    </div >
  );
}
