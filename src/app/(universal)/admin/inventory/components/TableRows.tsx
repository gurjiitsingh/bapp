
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



import { formatCurrencyNumber } from "@/utils/formatCurrency";

import { UseSiteContext } from "@/SiteContext/SiteContext";
import { InventoryItemType } from "@/lib/types/InventoryItemType";

function TableRows({
  item,
}: {
  item: InventoryItemType;
}) {
  const { settings } = UseSiteContext();

  const formattedCostPrice =
    formatCurrencyNumber(
      Number(item.costPrice) ?? 0,
      settings.currency as string,
      settings.locale as string
    );

  const isLowStock =
    item.currentStock <= item.minStock;

  async function handleDelete() {
    const confirmDelete = confirm(
      "Do you want to delete this inventory item?"
    );

    if (!confirmDelete) return;

    try {
      // ADD DELETE ACTION LATER
      console.log("Delete:", item.id);

      alert(
        "Delete action not connected yet"
      );
    } catch (error) {
      console.error(error);
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
      <TableCell>
        <span className="capitalize text-sm font-medium text-gray-700">
          {item.unit}
        </span>
      </TableCell>

      {/* STOCK */}
      <TableCell>
        <div className="flex flex-col">
          <span
            className={`font-bold text-base ${
              isLowStock
                ? "text-rose-600"
                : "text-gray-800"
            }`}
          >
            {item.currentStock}
          </span>

          <span className="text-xs text-gray-400">
            Available
          </span>
        </div>
      </TableCell>

      {/* MIN STOCK */}
      <TableCell>
        <span className="text-sm font-medium text-gray-700">
          {item.minStock}
        </span>
      </TableCell>

      {/* COST PRICE */}
      <TableCell>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">
            {formattedCostPrice}
          </span>

          <span className="text-xs text-gray-400">
            Cost
          </span>
        </div>
      </TableCell>

      {/* STATUS */}
      <TableCell>
        <div className="flex flex-col gap-2">
          {/* ACTIVE */}
          <div>
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
          </div>

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

      {/* ACTIONS */}
      <TableCell className="text-right pr-5">
        <div className="flex items-center justify-end gap-2">
          {/* EDIT */}
          <Link
            href={{
              pathname:
                "/admin/inventory/editform",
              query: {
                id: item.id,
              },
            }}
          >
            <Button
              size="sm"
              className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <CiEdit size={18} />
            </Button>
          </Link>

          {/* DELETE */}
          <Button
            onClick={handleDelete}
            size="sm"
            className="h-9 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
          >
            <MdDeleteForever size={18} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default TableRows;

