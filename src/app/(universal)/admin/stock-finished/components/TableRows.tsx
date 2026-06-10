
"use client";

import React from "react";

import {
  TableCell,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import Link from "next/link";

import {
  CiEdit,
} from "react-icons/ci";

import {
  MdDeleteForever,
} from "react-icons/md";

import {
  AlertTriangle,
  CheckCircle2,
  Package2,
} from "lucide-react";

import { deleteInventoryItem } from "@/app/(universal)/action/stock-finished/dbOperation";

import { formatCurrencyNumber } from "@/utils/formatCurrency";

import { UseSiteContext } from "@/SiteContext/SiteContext";

import { displayStock } from "@/utils/inventory/displayStock";
import { ProductType } from "@/lib/types/productType";




function TableRows({
  item,
}: {
  item: ProductType;
}) {
  const { settings } = UseSiteContext();

  console.log("item--------", item)

  const formattedCostPrice =
    formatCurrencyNumber(
      Number(item.price) ?? 0,
      settings.currency as string,
      settings.locale as string
    );

  const isLowStock =
    item.currentStock!! <= item.minStock!!;

  async function handleDelete() {
    const confirmDelete = confirm(
      `Delete "${item.name}" ?`
    );

    if (!confirmDelete) return;

    const result =
      await deleteInventoryItem(item.id);

    if (!result.success) {
      alert(result.message);
    }
  }
  return (
    <TableRow className="hover:bg-rose-50/40 transition-all border-b border-gray-100">
      {/* ITEM */}
      <TableCell className="py-4">
        <div className="flex items-center gap-3">
          {/* ICON */}
          <div className="h-11 w-11 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
            <Package2
              size={20}
              className="text-rose-600"
            />
          </div>

          {/* TEXT */}
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">
              {item.name}
            </span>

            {/* <span className="font-semibold text-gray-800">
              {item.categoryName}
            </span> */}

            {item.barcode ? (
              <span className="text-xs text-gray-400 mt-1">
                Barcode: {item.barcode}
              </span>
            ) : (
              <span className="text-xs text-gray-300 mt-1 italic">
                No barcode
              </span>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="capitalize text-sm font-medium text-gray-700">
          {item.productCat}
        </span>
      </TableCell>

      {/* SKU */}
      <TableCell>
        {item.sku ? (
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
            {item.sku}
          </span>
        ) : (
          <span className="text-gray-300 italic text-sm">
            —
          </span>
        )}
      </TableCell>

      {/* UNIT */}
      {/* <TableCell>
        <span className="capitalize text-sm font-medium text-gray-700">
          {item.purchaseUnit}
        </span>
      </TableCell> */}

      {/* STOCK */}
      <TableCell>
        <div className="flex flex-col">
          <span
            className={`font-bold text-base ${isLowStock
                ? "text-rose-600"
                : "text-gray-800"
              }`}
          >
            { item.currentStock}
            
            {/* {displayStock(
              item.currentStock,
              item.purchaseUnit,
              item.consumptionUnit,
              item.conversionFactor
            )} */}
          </span>

          <span className="text-xs text-gray-400">
            Available
          </span>
        </div>
      </TableCell>

      {/* MIN STOCK */}
      {/* <TableCell>
        <span className="text-sm font-medium text-gray-700">
         
        </span>
      </TableCell> */}

      {/* COST PRICE */}
      {/* <TableCell>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">
            {formattedCostPrice}
          </span>

          <span className="text-xs text-gray-400">
            Cost
          </span>
        </div>
      </TableCell> */}

      {/* STATUS */}
      <TableCell>
        <div className="flex flex-col gap-2">
         
          {/* <div>
            {item.isActive ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                <CheckCircle2 size={14} />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                Inactive
              </span>
            )}
          </div> */}

          {/* LOW STOCK */}
          {isLowStock && (
            <div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">
                <AlertTriangle size={14} />
                Low Stock
              </span>
            </div>
          )}
        </div>
      </TableCell>

  <TableCell>
  <select
    value={item.productMode || "recipe_live"}
    onChange={async (e) => {
      const newMode = e.target.value;

      try {
        await fetch(
          "/api/products/update-mode",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              id: item.id,
              productMode: newMode,
            }),
          }
        );

        window.location.reload();
      } catch (error) {
        console.error(error);
      }
    }}
    className="
      border border-gray-200
      rounded-lg
      px-2 py-1
      text-sm
      bg-white
      text-gray-700
    "
  >
    <option value="recipe_live">
      Live Recipe
    </option>

    <option value="stock_managed">
      Live Product
    </option>

    <option value="simple">
      Simple Product
    </option>
  </select>
</TableCell>

      {/* ACTIONS */}
      {/* <TableCell className="text-right pr-5">
        <div className="flex items-center justify-end gap-2">
         
          <Link
            href={`/admin/stock-finished/${item.id}`}
          >
            <Button
              size="sm"
              className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <CiEdit size={18} />
            </Button>
          </Link>

        
          <Button
            onClick={handleDelete}
            size="sm"
            className="h-9 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
          >
            <MdDeleteForever size={18} />
          </Button>
        </div>
      </TableCell> */}
    </TableRow>
  );
}

export default TableRows;

