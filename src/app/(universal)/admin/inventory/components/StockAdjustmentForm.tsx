
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
import { getPrimaryPurchaseMapping } from "@/utils/getPrimaryPurchaseMapping";
import toast from "react-hot-toast";
import { InventoryTransactionNameType } from "@/lib/types/InventoryTransactionType";

type Props = {
  inventoryItems: InventoryItemType[];
};

type FormType = {
  inventoryItemId: string;

  type: InventoryTransactionNameType,

  direction: "IN" | "OUT";

  quantity: number;

  transactionUnit: InventoryUnit;

  averageCost: number;

  stockValue: number;

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

  const [lastEdited, setLastEdited] = useState<
    "averageCost" | "stockValue"
  >("averageCost");

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
      type: "OPENING_STOCK",
      direction: "IN",
      quantity: 0,
      transactionUnit: "gm",
      note: "",
    },
  });

  const type = watch("type");
  const quantity = watch("quantity");
  const averageCost = watch("averageCost");
  const stockValue = watch("stockValue");

  const transactionUnit = watch("transactionUnit");


  useEffect(() => {
    if (!selectedInventory) return;

    const mapping =
      selectedInventory.purchaseMappings?.find(
        (m) => m.purchaseUnit === transactionUnit
      ) ?? {
        purchaseUnit: selectedInventory.consumptionUnit,
        factor: 1,
      };

    if (type === "WASTAGE") return;

    setValue(
      "quantity",
      Number(
        (
          (selectedInventory.currentStock ?? 0) /
          mapping.factor
        ).toFixed(3)
      )
    );

    setValue(
      "averageCost",
      Number(
        (
          (selectedInventory.averageCost ?? 0) *
          mapping.factor
        ).toFixed(2)
      )
    );

    setValue(
      "stockValue",
      Number(
        (selectedInventory.stockValue ?? 0).toFixed(2)
      )
    );
  }, [
    transactionUnit,
    selectedInventory,
    type,
    setValue,
  ]);
  // =====================================================
  // AUTO SET STOCK DIRECTION
  // =====================================================

  useEffect(() => {
    if (!selectedInventory) return;

    const mapping =
      getPrimaryPurchaseMapping(selectedInventory);

    setValue(
      "transactionUnit",
      mapping.purchaseUnit
    );
  }, [selectedInventory, setValue]);

  useEffect(() => {
    switch (type) {
      case "OPENING_STOCK":


        break;

      case "WASTAGE":

        break;

      // ADJUSTMENT = manual selection
    }
  }, [type, setValue]);

  useEffect(() => {
    switch (type) {
      case "OPENING_STOCK":
        setValue("direction", "IN");
        break;

      case "WASTAGE":
        setValue("direction", "OUT");
        break;
    }
  }, [type, setValue]);

  useEffect(() => {
    if (type === "WASTAGE") {
      setValue("averageCost", 0);
      setValue("stockValue", 0);
    }
  }, [type, setValue]);

  useEffect(() => {
    const qty = Number(quantity || 0);

    if (qty <= 0) return;

    if (lastEdited === "averageCost") {
      setValue(
        "stockValue",
        Number((qty * Number(averageCost || 0)).toFixed(2))
      );
    }

    if (lastEdited === "stockValue") {
      setValue(
        "averageCost",
        Number((Number(stockValue || 0) / qty).toFixed(4))
      );
    }
  }, [
    quantity,
    averageCost,
    stockValue,
    lastEdited,
    setValue,
  ]);
  const selectedMapping =
    selectedInventory?.purchaseMappings?.find(
      (m) => m.purchaseUnit === transactionUnit
    ) ??
    (selectedInventory && {
      purchaseUnit: selectedInventory.consumptionUnit,
      consumptionUnit: selectedInventory.consumptionUnit,
      factor: 1,
    });

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
    toast.error("Please select inventory item.");
    return;
  }

  const decimalAllowedUnits = [
    "kg",
    "gm",
    "ltr",
    "ml",
  ];

  let quantity = Number(data.quantity);

    quantity =
  data.type === "CLEAR"
    ? 0
    : Number(data.quantity);

  // prevent decimal in pcs
  if (
    !decimalAllowedUnits.includes(data.transactionUnit) &&
    !Number.isInteger(quantity)
  ) {
    toast.error(
      `Decimal quantity not allowed for ${data.transactionUnit}`
    );
    return;
  }

  // =====================================
  // ORIGINAL VALUES
  // =====================================

  const originalQuantity = Number(data.quantity);

  // =====================================
  // INTERNAL VALUES
  // =====================================

  let finalQuantity = Number(data.quantity);

  const mapping =
    selectedInventory.purchaseMappings?.find(
      (m) => m.purchaseUnit === data.transactionUnit
    ) ?? {
      purchaseUnit: selectedInventory.consumptionUnit,
      factor: 1,
    };

  if (mapping) {
    finalQuantity = finalQuantity * mapping.factor;
  }

  setIsSubmitting(true);

  let averageCost = Number(data.averageCost);

  if (mapping) {
    averageCost = averageCost / mapping.factor;
  }

  try {
    const result = await adjustInventoryStock({
      inventoryItemId: data.inventoryItemId,
      type: data.type,
      direction: data.direction,

      // INTERNAL
      quantity: finalQuantity,

      unitCost: averageCost,
      stockValue: Number(data.stockValue),

      // ORIGINAL
      purchaseQuantity: originalQuantity,
      purchaseUnit: data.transactionUnit,
      purchaseUnitCost: 0,
      conversionFactor: mapping?.factor ?? 1,

      paymentStatus: "PAID",
      note: data.note,
      createdBy: "admin",
    });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);

    let updatedStock: number;

    if (data.type === "OPENING_STOCK") {
      updatedStock = finalQuantity;
    } else if (data.direction === "IN") {
      updatedStock =
        (selectedInventory.currentStock ?? 0) +
        finalQuantity;
    } else {
      updatedStock =
        (selectedInventory.currentStock ?? 0) -
        finalQuantity;
    }

    setSelectedInventory({
      ...selectedInventory,
      currentStock: updatedStock,
    });

    reset({
      type: "OPENING_STOCK",
      direction: "IN",
      quantity: 0,
      note: "",
      inventoryItemId: selectedInventory.id,
      transactionUnit:
        getPrimaryPurchaseMapping(selectedInventory)
          .purchaseUnit,
    });
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong.");
  } finally {
    setIsSubmitting(false);
  }
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
            Adjust inventory quantity and valuation manually.
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
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

                          setValue("inventoryItemId", item.id);

                          const mapping =
                            getPrimaryPurchaseMapping(item);

                          setValue(
                            "transactionUnit",
                            mapping.purchaseUnit
                          );


                          const displayQuantity =
                            (item.currentStock ?? 0) /
                            mapping.factor;

                          const displayaverageCost =
                            (item.averageCost ?? 0) *
                            mapping.factor;


                          if (type === "WASTAGE") {
                            setValue("averageCost", 0);
                            setValue("stockValue", 0);
                            setValue("quantity", 0);
                          } else {
                            setValue("averageCost", Number(displayaverageCost.toFixed(2)));
                            setValue("stockValue", Number((item.stockValue ?? 0).toFixed(2)));
                            setValue("quantity", Number(displayQuantity.toFixed(3)));
                          }

                          setSearch(item.name);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="font-medium text-gray-800">
                          {item.name}
                        </div>



                     <div className="text-xs text-gray-400">
  Current{" "}
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
                {
                  displayStock(
                    selectedInventory.currentStock!,
                    selectedMapping!.purchaseUnit,
                    selectedInventory.consumptionUnit,
                    selectedMapping!.factor
                  )
                }
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
                {...register("type")}
                className="input-style-4"
              >
                {/* <option value="PURCHASE">
                  Purchase
                </option> */}

                <option value="OPENING_STOCK">
                  Opening Stock
                </option>


                <option value="WASTAGE">
                  Wastage
                </option>

                <option value="ADJUSTMENT">
                  Adjustment
                </option>
                 <option value="CLEAR">
                  CLEAR
                </option>
              </select>
            </div>

            {type === "ADJUSTMENT" && (
              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Stock Direction
                </label>

                <select
                  {...register("direction")}
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
                placeholder="Enter quantity"
                onFocus={(e) => {
                  if (e.target.value === "0") {
                    e.target.value = "";
                  }
                }}
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
                {selectedInventory &&
                  selectedInventory.purchaseMappings?.map(
                    (mapping) => (
                      <option
                        key={mapping.purchaseUnit}
                        value={mapping.purchaseUnit}
                      >
                        {mapping.purchaseUnit}
                      </option>
                    )
                  )}

                {selectedInventory &&
                  (!selectedInventory.purchaseMappings ||
                    selectedInventory.purchaseMappings.length ===
                    0) && (
                    <option
                      value={
                        selectedInventory.consumptionUnit
                      }
                    >
                      {selectedInventory.consumptionUnit}
                    </option>
                  )}
              </select>
            </div>

          </div>


          {/* ===================================================== */}
          {/* VALUATION */}
          {/* ===================================================== */}

          {type !== "WASTAGE" && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Unit Cost
              </label>

              <input
                type="number"
                step="0.01"
                value={averageCost || ""}
                onChange={(e) => {
                  setLastEdited("averageCost");
                  setValue("averageCost", Number(e.target.value || 0));
                }}
                className="input-style-4"
                placeholder="0.00"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Total Stock Value
              </label>

              <input
                type="number"
                step="0.01"
                value={stockValue || ""}
                onChange={(e) => {
                  setLastEdited("stockValue");
                  setValue("stockValue", Number(e.target.value || 0));
                }}
                className="input-style-4"
                placeholder="0.00"
              />
            </div>

          </div>
          }
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
