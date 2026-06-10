
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
import { InventoryCategory } from "@/lib/types/InventoryCategory";
import { ProductType } from "@/lib/types/productType";

type Props = {
  products: ProductType[];
 // categories: InventoryCategory[];
};

export default function ListView({
  products,
  
}: Props) {
  const [filtered, setFiltered] =
    useState<ProductType[]>([]);

  const [search, setSearch] =
    useState("");

// const categoryMap = useMemo(() => {
//   return new Map(
//     (categories ?? []).map((category) => [
//       category.id,
//       category.name,
//     ])
//   );
// }, [categories]);

  // const inventoryWithCategory =
  //   useMemo(() => {
  //     return filtered.map((item) => ({
  //       ...item,
  //       categoryName:
  //         categoryMap.get(
  //           item.categoryId || ""
  //         ) || "-",
  //     }));
  //   }, [filtered, categories]);

  // FILTER
  useEffect(() => {
    let list = [... products];

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
        item.currentStock!! <= item.minStock!!
    ).length;
  }, [products]);

  const activeItems = useMemo(() => {
    return products.filter(
      (item) => item.isFeatured
    ).length;
  }, [products]);

  return (
    <div className="flex flex-col gap-5">
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {filtered.length}
            </span>{" "}
            inventory items
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
                  Category
                </TableHead>
                <TableHead>
                  SKU
                </TableHead>

                {/* <TableHead>
                  Unit
                </TableHead> */}

                <TableHead>
                  Stock
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
                  Maintain Stock
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

