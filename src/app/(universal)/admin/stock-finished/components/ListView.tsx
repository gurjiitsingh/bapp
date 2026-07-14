
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

  return (
    <div className="flex flex-col gap-5">
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-rose-100 flex items-center justify-center">
                  <Package2
                    size={22}
                    className="text-rose-600"
                  />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
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
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          {/* SEARCH */}
          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

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

          {/* INFO */}
          <div className="flex gap-3 items-center">
             <Link
            href="/admin/stock-finished/products/add"
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#00796b]"
          >
            + Products
          </Link>
          <div className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {filtered.length}
            </span>{" "}
            inventory items
          </div>

</div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="py-4">
                  Item
                </TableHead>

                  <TableHead>
                  W Sale Price
                </TableHead>
                 
              
                {/* <TableHead>
                  SKU
                </TableHead> */}

                {/* <TableHead>
                  Unit
                </TableHead> */}

                <TableHead>
                  Stock
                </TableHead>
                <TableHead>
                  Avg Cost
                </TableHead>
                <TableHead>
                  Value
                </TableHead>
                <TableHead>
                  Min Stock
                </TableHead>

                {/* <TableHead>
                  Cost Price
                </TableHead> */}

                {/* <TableHead>
                  Status
                </TableHead> */}
                <TableHead>
                  Maintain Live
                </TableHead>
                  <TableHead>
                  Category
                </TableHead>

                {/* <TableHead className="text-right pr-5">
                  Actions
                </TableHead> */}
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length > 0 ? (

                filtered.map(
                  (item) => (
                    <TableRows
                      key={item.id}
                      item={item}
                    />
                  )
                )
              ) : (
                <TableRow>
                  <td
                    colSpan={8}
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
    </div>
  );
}

