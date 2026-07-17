"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Search, Package2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getDepartmentStock,
 
} from "@/app/(universal)/action/production/departments/getDepartmentStock";

import { autoStockProduction  } from "@/app/(universal)/action/stock-finished/autoStockProduction";

import { InventoryItemType, InventoryUnit } from "@/lib/types/InventoryItemType";
import { ProductStockType } from "@/lib/types/productStockType";
import toast from "react-hot-toast";
import Link from "next/link";
import { DepartmentStockType } from "@/lib/types/department/DepartmentStockType";
type Props = {
  products: ProductStockType[];
   departments: { id: string; name: string; employeeCount:number,  managerName: string; }[];
    inventoryItems: InventoryItemType[];
};

type FormType = {
  id: string;
  quantity: number;
  transactionUnit: InventoryUnit;
  note: string;
};

export default function ProductionForm({
  products,
  departments,
  inventoryItems,
}: Props) {

  const [departmentStock, setDepartmentStock] = useState<DepartmentStockType[]>([]);
    const [departmentId, setDepartmentId] = useState("");
    const [items, setItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [showDropdown, setShowDropdown] =
    useState(false);

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState<ProductStockType | null>(null);

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

    setIsSubmitting(true);

    try {
      const result = await autoStockProduction({
        id: data.id,
        batchId: "fromUpdate",
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


        departmentId,
        departmentName: selectedDepartment?.name || "",
        managerName: selectedDepartment?.managerName || "",
        employeeCount: selectedDepartment?.employeeCount || 0,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      setSelectedProduct({
        ...selectedProduct,
        currentStock:
          (selectedProduct.currentStock || 0) +
          Number(data.quantity),
      });

      reset({
        id: selectedProduct.id,
        quantity: 0,
        transactionUnit: transactionUnit,
        note: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }


 const selectedDepartment = departments.find(
    (d) => d.id === departmentId
  );

 useEffect(() => {
    async function loadDepartmentStock() {
      if (!departmentId) {
        setDepartmentStock([]);
        return;
      }

      try {
        const stock = await getDepartmentStock(departmentId);
        setDepartmentStock(stock);

        // Optional: clear previous items
        setItems([]);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load department stock");
      }
    }

    loadDepartmentStock();
  }, [departmentId]);

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">
      <div className="max-w-3xl">
        <div className="mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Auto Production
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Production and inventory record.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/admin/stock-finished/issue/add"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-red-600 px-5 font-medium text-white shadow-sm transition hover:bg-red-700"
              >
                Manual Production
              </Link>

              <Link
                href="/admin/stock-finished/batchs"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-red-200 bg-white px-5 font-medium text-red-600 shadow-sm transition hover:bg-red-50"
              >
                Production Batches
              </Link>
            </div>
          </div>


        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5"
        >



            <div className="flex gap-3">
          <div>
            <label className="text-sm text-gray-600">Department</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {selectedDepartment && (
            <div className="mt-6 flex h-[42px] gap-3 items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm">
              <span className="text-gray-600">
                Employee Count
              </span>

              <span className="font-semibold text-blue-700">
                {selectedDepartment.employeeCount}
              </span>
            </div>
          )}
       
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
                className={`input-style-4 pr-4 ${!search.trim()
                  ? "pl-12"
                  : "pl-4"
                  }`}
              />

              {showDropdown &&
                filteredProducts.length > 0 && (
                  <div className="absolute z-50 mt-2 w-full max-h-80 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl">
                    {filteredProducts.map(
                      (item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedProduct(
                              item
                            );

                            setValue(
                              "id",
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
                          <div className="font-medium">
                            {item.name}
                          </div>

                          <div className="text-xs text-gray-500">
                            Current Stock:{" "}
                            {
                              item.currentStock
                            }
                          </div>
                        </button>
                      )
                    )}
                  </div>
                )}
            </div>

            <input
              type="hidden"
              {...register("id")}
            />
          </div>

 </div>



          {/* STOCK */}
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

          {/* QUANTITY */}
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


                <option value="gm">Gram (g)</option>
                <option value="ltr">Liter (L)</option>
                <option value="ml">Milliliter (ml)</option>
              </select>
            </div>

          </div>

          {/* NOTE */}
          <div className="flex flex-col gap-2">
            <label className="label-style-4">
              Note
            </label>

            <textarea
              rows={4}
              {...register("note")}
              className="input-style-4 resize-none"
              placeholder="Optional note..."
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="btn-save-4 h-11"
          >
            {isSubmitting
              ? "Producing..."
              : "Record Production"}
          </Button>
        </form>
      </div>
    </div>
  );
}