
"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  AlertTriangle,
  PackageCheck,
  Boxes,
  Package2,
  Wrench,
   X, Calculator
} from "lucide-react";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { InventoryItemType } from "@/lib/types/InventoryItemType";

import TableRows from "./TableRows";
import { ProductStockType } from "@/lib/types/productStockType";
import Link from "next/link";
import ProductionEstimateFormFast from "../product-cost/ProductionEstimateFormFast";


type Props = {
  products: ProductStockType[];
  // categories: InventoryCategory[];
};

export default function ListView({
  products,

}: Props) {
  const [filtered, setFiltered] =
    useState<ProductStockType[]>([]);

  const [search, setSearch] =
    useState("");

const [selectedProduct, setSelectedProduct] =
  useState<ProductStockType | null>(null);

  // FILTER
  useEffect(() => {
    let list = [...products];

    if (search) {
      const q = search.toLowerCase();

      list = list.filter((item) =>
        item.name
          ?.toLowerCase()
          .includes(q)
      );
    }

    setFiltered(list);
  }, [search, products]);

  // STATS
  const totalItems = useMemo(() => {
    return products.length;
  }, [products]);

  const lowStockItems = useMemo(() => {
    return products.filter(
      (item) =>
        item.currentStock! <= item.minStock!!
    ).length;
  }, [products]);

  const activeItems = useMemo(() => {
    return products.filter(
      (item) => item.trackInventory
    ).length;
  }, [products]);

  const totalStockValue = useMemo(() => {
    return products.reduce((total, item) => {
      const avgCost = Number(item.avgCost ?? 0);
      const costPrice = Number(item.costPrice ?? 0);
      const quantity = Number(item.currentStock ?? 0);

      const unitCost =
        avgCost > 0 ? avgCost : costPrice;

      return total + quantity * unitCost;
    }, 0);
  }, [products]);

  return (
    <div className="flex flex-col gap-5">
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">

        {/* FILTER BAR */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            {/* SEARCH */}
            <div className="flex gap-2 relative w-full lg:max-w-md">
              {/* <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              /> */}

              <div className="flex flex-col gap-2">
                      <div className="flex gap-1 text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-700">
                    {filtered.length}
                  </span>{" "}

                  items
                </div>
                <input
                  type="text"
                  placeholder="Search inventory items..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="input-style-4 pl-10"
                />
          
              </div>
            </div>

         
          </div>
        </div>


       <div className="flex items-center gap-3 bg-red-500 p-1  rounded-2xl">
          <div className="h-11 w-11 rounded-2xl bg-rose-100 flex items-center justify-center">
            <Package2
              size={22}
              className="text-rose-600"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              Prodcut Stock Management
            </h1>

            <p className="text-sm text-gray-500">
              Manage finished items stock
            </p>
          </div>
        </div> 
        {/* TOTAL */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Items
              </p>

              <h3 className="text-3xl font-bold text-gray-800 mt-2">
                {totalItems}
              </h3>
            </div>

            <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Boxes
                className="text-blue-600"
                size={24}
              />
            </div>
          </div>
        </div>

        {/* ACTIVE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Active Items
              </p>

              <h3 className="text-3xl font-bold text-gray-800 mt-2">
                {activeItems}
              </h3>
            </div>

            <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <PackageCheck
                className="text-emerald-600"
                size={24}
              />
            </div>
          </div>
        </div>

        {/* TOTAL STOCK VALUE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Stock Value
              </p>

              <h3 className="text-2xl font-bold text-gray-800 mt-2">
                {totalStockValue.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 2,
                })}
              </h3>
            </div>

            <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center">
              <Boxes
                className="text-amber-600"
                size={24}
              />
            </div>
          </div>
        </div>

        {/* LOW STOCK */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Low Stock Alerts
              </p>

              <h3 className="text-3xl font-bold text-gray-800 mt-2">
                {lowStockItems}
              </h3>
            </div>

            <div className="h-12 w-12 rounded-2xl bg-rose-100 flex items-center justify-center">
              <AlertTriangle
                className="text-rose-600"
                size={24}
              />
            </div>
          </div>
        </div>

           {/* INFO */}
            <div className="flex flex-col gap-3 items-center p-2">
              <Link
                href="/admin/stock-finished/products/add"
                className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#00796b]"
              >
                + Products
              </Link>

              <Link href="/admin/stock-finished/repair">
                <button className="btn-save-4 flex items-center gap-2">
                  <Wrench size={18} />
                  Repair
                </button>
              </Link>

            </div>
      </div>



      {/* TABLE */}
    
{/* TABLE */}
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
  <div className="overflow-x-auto">
    <Table>
      <TableHeader className="bg-gray-50">
        <TableRow>
          <TableHead className="py-4">Item</TableHead>
          <TableHead>W Sale Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Avg Cost</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Min Stock</TableHead>
          <TableHead>Maintain Live</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right pr-5">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <TableRows
              key={item.id}
              item={item}
              onClick={() => setSelectedProduct(item)}
            />
          ))
        ) : (
          <TableRow>
            <td
              colSpan={9}
              className="text-center py-16 text-gray-400"
            >
              No inventory items found
            </td>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
</div>

{/* PRODUCTION ESTIMATE POPUP */}
{selectedProduct && (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 md:p-6"
    onClick={() => setSelectedProduct(null)}
  >
    <div
      className="relative w-full max-w-7xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* POPUP HEADER */}
      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100">
            <Calculator className="text-cyan-700" size={21} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Product Cost Estimation
            </h2>

            <p className="text-sm text-gray-500">
              {selectedProduct.name}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSelectedProduct(null)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
        >
          <X size={20} />
        </button>
      </div>

      {/* ESTIMATION CONTENT */}
      <div className="p-4 md:p-6">
        <ProductionEstimateFormFast
          selectedProduct={selectedProduct}
          quantity={1}
          transactionUnit="kg"
        />
      </div>
    </div>
  </div>
)}

    </div>
  );
}

