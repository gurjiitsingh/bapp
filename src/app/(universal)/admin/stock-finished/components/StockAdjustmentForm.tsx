
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


import { displayStock } from "@/utils/inventory/displayStock";
import { ProductType } from "@/lib/types/productType";
import { updateFinishedItemStock } from "@/app/(universal)/action/stock-finished/autoStockProduction";
import { ProductStock } from "@/lib/types/productStockType";
import toast from "react-hot-toast";
import { adjustFinishedItemStock } from "@/app/(universal)/action/stock-finished/AdjustFinshedItemStock";

type Props = {
  products: ProductStock[];
};

type FormType = {
  id: string;

  type:
  | "PURCHASE"
  | "OPENING_STOCK"
  | "ADJUSTMENT"
  | "WASTAGE"
  // | "SUPPLIER_RETURN"
  | "PURCHASE_RETURN"
  | "CUSTOMER_RETURN";

  direction:
  | "IN"
  | "OUT";

  quantity: number;

  transactionUnit: InventoryUnit

  note: string;
};
export default function StockAdjustmentForm({
  products,
}: Props) {
  const [isSubmitting, setIsSubmitting] =
    useState(false);



  const [search, setSearch] =
    useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<ProductStock | null>(null);

  const [showDropdown, setShowDropdown] =
    useState(false);



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
      transactionUnit: "kg",
      note: "",
    },
  });

  const type = watch(
    "type"
  );

  const transactionUnit = watch("transactionUnit");



  // =====================================================
  // AUTO SET STOCK DIRECTION
  // =====================================================



  useEffect(() => {
    switch (type) {
      case "OPENING_STOCK":
        setValue("direction", "IN");
        break;

      case "CUSTOMER_RETURN":
        setValue("direction", "IN");
        break;

      case "PURCHASE_RETURN":
        setValue("direction", "OUT");
        break;

      case "WASTAGE":
        setValue("direction", "OUT");
        break;

      case "ADJUSTMENT":
        // user selects direction
        break;

      default:
        break;
    }
  }, [type, setValue]);

  // =====================================================
  // FILTER INVENTORY
  // =====================================================

  const filteredInventory =
    useMemo(() => {
      if (!search.trim()) return [];

      return products
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
    }, [search, products]);

  // =====================================================
  // SUBMIT
  // =====================================================

  async function onSubmit(data: FormType) {
    if (isSubmitting) return;

    if (!selectedProduct) {
      toast.error("Please select an inventory item.");
      return;
    }

 
    const quantity = Number(data.quantity);

if (quantity < 0) {
  toast.error("Quantity cannot be negative.");
  return;
}

const finalQuantity = quantity;

    setIsSubmitting(true);

    try {
      const result = await adjustFinishedItemStock({
        id: data.id,
        productName: selectedProduct.name,
        sellingPrice: 0,
        wholesalePrice: 0,
        costPrice: 0,
        avgCost: 0,

        direction: data.direction,
        type: data.type,
        quantity: data.quantity,
        transactionUnit: data.transactionUnit,

        note: data.note,

        createdBy: "admin",
      });

      if (!result.success) {
        toast.error(result.message || "Failed to update stock.");
        return;
      }

      let updatedStock = selectedProduct.currentStock;

      if (data.direction === "IN") {
        updatedStock += finalQuantity;
      } else {
        updatedStock -= finalQuantity;
      }

      setSelectedProduct({
        ...selectedProduct,
        currentStock: updatedStock,
      });

      toast.success("Stock updated successfully.");
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong. Please try again.");
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
            Manually add or remove finished product stock.
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
                          setSelectedProduct(item); // ✅ correct

                          setValue("id", item.id);

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

                        </div>
                      </button>
                    ))}
                  </div>
                )}
            </div>

            <input
              type="hidden"
              {...register(
                "id"
              )}
            />
          </div>

          {/* ===================================================== */}
          {/* CURRENT STOCK */}
          {/* ===================================================== */}

          {selectedProduct && (
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
                      selectedProduct.name
                    }
                  </h3>

                  <p className="text-sm text-gray-500">
                    Current Stock
                  </p>
                </div>
              </div>

              <div className="text-2xl font-bold text-blue-700">
                {/* {displayStock(
      selectedProduct.currentStock!,
      selectedProduct.purchaseUnit,
      selectedProduct.consumptionUnit,
      selectedProduct.conversionFactor
    )} */}
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TYPE */}
          {/* ===================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Transaction Type */}
            <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Transaction Type
              </label>

              <select
                {...register("type")}
                className="input-style-4"
              >
                <option value="OPENING_STOCK">
                  Opening Stock
                </option>

                <option value="ADJUSTMENT">
                  Stock Adjustment
                </option>

                <option value="CUSTOMER_RETURN">
                  Customer Return
                </option>

                <option value="PURCHASE_RETURN">
                  Purchase Return
                </option>

                <option value="WASTAGE">
                  Wastage
                </option>
              </select>
            </div>

            {/* Direction (Only for Adjustment) */}
            {type === "ADJUSTMENT" && (
              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Adjustment Direction
                </label>

                <select
                  {...register("direction")}
                  className="input-style-4"
                >
                  <option value="IN">
                    Increase Stock
                  </option>

                  <option value="OUT">
                    Decrease Stock
                  </option>
                </select>
              </div>
            )}

          </div>

          {/* ===================================================== */}
          {/* QUANTITY */}
          {/* ===================================================== */}


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Quantity */}

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
                onFocus={(e) => {
                  if (e.target.value === "0") {
                    e.target.value = "";
                  }
                }}
               
              />
            </div>

            {/* Unit */}

            <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Unit
              </label>

              <select
                {...register("transactionUnit")}
                className="input-style-4"
              >
                <option value="pcs">Piece (pcs)</option>
                <option value="box">Box</option>
                <option value="pack">Pack</option>
                <option value="bottle">Bottle</option>
                <option value="dozen">Dozen</option>

                <option value="kg">Kilogram (kg)</option>
                <option value="gm">Gram (gm)</option>
                <option value="ltr">Liter (ltr)</option>
                <option value="ml">Milliliter (ml)</option>
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
