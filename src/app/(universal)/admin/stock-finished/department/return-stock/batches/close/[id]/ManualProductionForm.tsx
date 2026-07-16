"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Search, Package2 } from "lucide-react";

import { Button } from "@/components/ui/button";

 

import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { ProductStockType } from "@/lib/types/productStockType";
import toast from "react-hot-toast";
import { stockProductionManual } from "@/app/(universal)/action/production/stockProductionManual";
type Props = {
  products: ProductStockType[];
  batchId: string; // ✅ NEW
};

type FormType = {
  id: string;
  quantity: number;
  transactionUnit: InventoryUnit;
  note: string;
};

export default function ManualProductionForm({
  products,
  batchId, // ✅ NEW
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<ProductStockType | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<FormType>({
    defaultValues: {
      quantity: 0,
      transactionUnit: "kg",
      note: "",
    },
  });

  const transactionUnit = watch("transactionUnit");

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return [];

    return products
      .filter((item) =>
        item.name
          ?.toLowerCase()
          .includes(search.toLowerCase())
      )
      .slice(0, 20);
  }, [search, products]);

  async function onSubmit(data: FormType) {
    if (isSubmitting) return;

    if (!selectedProduct) {
      toast.error("Please select a product.");
      return;
    }

    if (!data.quantity || data.quantity <= 0) {
      toast.error("Enter valid quantity.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await stockProductionManual({
        id: data.id,
        productName: selectedProduct.name,
        sellingPrice: selectedProduct.sellingPrice,
        wholesalePrice: selectedProduct.wholesalePrice!,
        costPrice: selectedProduct.costPrice,
        avgCost: selectedProduct.avgCost!,
        direction: "IN",
        quantity: Number(data.quantity),
        transactionUnit: data.transactionUnit,
        note: data.note,
        createdBy: "admin",

        batchId, // ✅ IMPORTANT
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Production added");

      // ✅ update local stock UI
      setSelectedProduct((prev) =>
        prev
          ? {
              ...prev,
              currentStock:
                (prev.currentStock || 0) +
                Number(data.quantity),
            }
          : prev
      );

      // ✅ KEEP PRODUCT SELECTED (important UX)
      reset({
        id: selectedProduct.id,
        quantity: 0,
        transactionUnit: transactionUnit,
        note: "",
      });

      // ❌ DO NOT clear search → allows fast multiple entries
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

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Close Production Batch
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Add finished goods produced under this batch and finalize it.
        </p>

        {/* Batch Info */}
        <div className="mt-3 text-xs bg-gray-100 px-3 py-2 rounded-xl inline-block">
          Batch ID: <span className="font-semibold">{batchId}</span>
        </div>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5"
      >

        {/* PRODUCT */}
        <div className="flex flex-col gap-2">
          <label className="label-style-4">
            Finished Product
          </label>

          <div className="relative">
            {!search.trim() && (
              <Search
                size={18}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
              />
            )}

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowDropdown(true);
              }}
              placeholder="Search product..."
              className={`input-style-4 pr-4 ${
                !search.trim() ? "pl-12" : "pl-4"
              }`}
            />

            {showDropdown && filteredProducts.length > 0 && (
              <div className="absolute z-50 mt-2 w-full max-h-80 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl">
                {filteredProducts.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedProduct(item);
                      setValue("id", item.id);
                      setSearch(item.name);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-0"
                  >
                    <div className="font-medium">
                      {item.name}
                    </div>

                    <div className="text-xs text-gray-500">
                      Current Stock: {item.currentStock}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <input type="hidden" {...register("id")} />
        </div>

        {/* STOCK CARD */}
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
                <h3 className="font-semibold">
                  {selectedProduct.name}
                </h3>

                <p className="text-sm text-gray-500">
                  Current Stock
                </p>
              </div>
            </div>

            <div className="text-2xl font-bold text-blue-700">
              {selectedProduct.currentStock} {transactionUnit}
            </div>
          </div>
        )}

        {/* QUANTITY + UNIT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Quantity */}
          <div className="flex flex-col gap-2">
            <label className="label-style-4">
              Production Quantity
            </label>

            <input
              type="number"
              step="0.001"
              min="0.001"
              {...register("quantity", {
                valueAsNumber: true,
              })}
              onFocus={(e) => {
                if (e.target.value === "0") {
                  e.target.value = "";
                }
              }}
              className="input-style-4"
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
              <option value="kg">Kilogram (kg)</option>
              <option value="gm">Gram (g)</option>
              <option value="ltr">Liter (L)</option>
              <option value="ml">Milliliter (ml)</option>

              <option value="pcs">Piece (pcs)</option>
              <option value="box">Box</option>
              <option value="pack">Pack</option>
              <option value="bottle">Bottle</option>
              <option value="can">Can</option>
              <option value="jar">Jar</option>
              <option value="bag">Bag</option>
              <option value="carton">Carton</option>
              <option value="tray">Tray</option>
              <option value="roll">Roll</option>
              <option value="pair">Pair</option>
              <option value="dozen">Dozen</option>
            </select>
          </div>

        </div>

        {/* NOTE */}
        <div className="flex flex-col gap-2">
          <label className="label-style-4">
            Note
          </label>

          <textarea
            rows={3}
            {...register("note")}
            className="input-style-4 resize-none"
            placeholder="Optional note..."
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 mt-2">

          {/* ADD PRODUCTION */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 btn-save-4 h-11"
          >
            {isSubmitting
              ? "Adding..."
              : "Add Production"}
          </Button>

          {/* CLOSE BATCH */}
          <Button
            type="button"
            className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white"
            onClick={async () => {
              // const res = await closeProductionBatch(batchId);

              // if (res.success) {
              //   toast.success("Batch Closed");

              //   window.location.href =
              //     "/admin/stock-finished/issue/batches";
              // } else {
              //   toast.error(res.message);
              // }
            }}
          >
            Final Close
          </Button>

        </div>
      </form>
    </div>
  </div>
);
}