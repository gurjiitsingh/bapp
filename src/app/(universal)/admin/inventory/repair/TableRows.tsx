"use client";

import React, { useState } from "react";
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { updateInventoryField } from '@/app/(universal)/action/inventory/repair/updateInventoryField';

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

import { deleteInventoryItem } from "@/app/(universal)/action/inventory/dbOperation";

import { UseSiteContext } from "@/SiteContext/SiteContext";

import { InventoryItemType } from "@/lib/types/InventoryItemType";

import { displayStock } from "@/utils/inventory/displayStock";

import {
  getPrimaryPurchaseMapping,
} from "@/utils/getPrimaryPurchaseMapping";
import PurchaseUnitDialog from "./PurchaseUnitDialog";

function TableRows({
  item,
}: {
  item: InventoryItemType;
}) {

  const router = useRouter();

 

  const [qtyValue, setQtyValue] = useState(
    String(item.currentStock ?? 0)
  );

  const [costValue, setCostValue] = useState(
    String(item.averageCost ?? 0)
  );
  const { settings } = UseSiteContext();
  const [openUnitDialog, setOpenUnitDialog] = useState(false);



  // ==========================================
  // PRIMARY PURCHASE MAPPING
  // ==========================================

  const primaryMapping =
    getPrimaryPurchaseMapping(item);

  // ==========================================
  // STOCK STATUS
  // ==========================================

  const currentStock =
    Number(item.currentStock) || 0;

  const minStock =
    Number(item.minStock) || 0;

  const isLowStock =
    currentStock <= minStock;

  // ==========================================
  // DELETE
  // ==========================================

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

  async function saveQty() {
    const value = Number(qtyValue);

    if (isNaN(value)) return;

    const result = await updateInventoryField(
      item.id,
      'currentStock',
      value
    );

    if (!result.success) {
      alert(result.message);
      return;
    }

    router.refresh();
  }

  async function saveCost() {
    const value = Number(costValue);

    if (isNaN(value)) return;

    const result = await updateInventoryField(
      item.id,
      'averageCost',
      value
    );

    if (!result.success) {
      alert(result.message);
      return;
    }

    router.refresh();
  }


  return (
    <TableRow className="hover:bg-rose-50/40 transition-all border-b border-gray-100">

      {/* ========================================
          ITEM
      ======================================== */}

      <TableCell className="py-4">
        <div className="flex items-center gap-3">

          <div className="h-11 w-11 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
            <Package2
              size={20}
              className="text-rose-600"
            />
          </div>

          <div className="flex flex-col">

            <span className="font-semibold text-gray-800">
              {item.name}
            </span>



          </div>
        </div>
      </TableCell>

      {/* ========================================
          CATEGORY
      ======================================== */}

      {/* <TableCell>
        <span className="capitalize text-sm font-medium text-gray-700">
          {item.categoryName}
        </span>
      </TableCell> */}

      {/* ========================================
          SKU
      ======================================== */}




  

      {/* ========================================
          STOCK
      ======================================== */}

      <TableCell>
        <div className="flex flex-col gap-1">

          <Input
            value={qtyValue}
            onChange={(e) => setQtyValue(e.target.value)}
            onBlur={saveQty}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveQty();
            }}
            inputMode="numeric"
            type="number"
            step="1"
            className="h-9 w-32"
          />

          <span className="text-xs text-gray-400">
           Qty in gm
          </span>

        </div>
      </TableCell>

          {/* ========================================
          CONVERSION FACTOR
      ======================================== */}

      <TableCell>
        <div className="flex flex-col">

          <span className="font-bold text-sm text-gray-800">
            {item.conversionFactor}
          </span>



        </div>
      </TableCell>


 {/* ========================================
          PURCHASE UNIT
      ======================================== */}

  
       <TableCell className="text-right">
        {item.currentStock!/item.conversionFactor}
       </TableCell>

           <TableCell >
        <button
          type="button"
          onClick={() => setOpenUnitDialog(true)}
          className="capitalize  border-b  text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
        >
          {item.purchaseUnit?.trim()
            ? item.purchaseUnit
            : "-"}
        </button>
        <PurchaseUnitDialog
          open={openUnitDialog}
          onOpenChange={setOpenUnitDialog}
          item={item}
        />
      </TableCell>

      {/* ========================================
          AVG COST / PURCHASE UNIT COST
      ======================================== */}

      <TableCell>
        <div className="flex flex-col gap-1">

          <Input
            value={costValue}
            onChange={(e) => setCostValue(e.target.value)}
            onBlur={saveCost}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveCost();
            }}
            inputMode="decimal"
            type="number"
            step="0.01"
            className="h-9 w-32"
          />

          <span className="text-xs text-gray-400">
          per  {item.purchaseUnit?.trim()
            ? item.purchaseUnit
            : "-"}
          </span>

        </div>
      </TableCell>
     
      {/* ========================================
          STOCK VALUE
      ======================================== */}

      <TableCell>
        <div className="flex flex-col">

          <span className="font-bold text-base text-gray-800">
            Rs{" "}
            {Number(
              item.stockValue
            ).toFixed(2)}
          </span>

          <span className="text-xs text-gray-400">
            Total
          </span>

        </div>
      </TableCell>

      {/* ========================================
          MIN STOCK
      ======================================== */}

      {/* <TableCell>
        <span className="text-sm font-medium text-gray-700">
          {displayStock(
            minStock,
            primaryMapping.purchaseUnit,
            item.consumptionUnit,
            primaryMapping.factor
          )}
        </span>
      </TableCell> */}

      {/* ========================================
          STATUS
      ======================================== */}

      {/* <TableCell>
        <div className="flex flex-col gap-2">

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

          {isLowStock && (
            <div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">
                <AlertTriangle size={14} />
                Low Stock
              </span>
            </div>
          )}

        </div>
      </TableCell> */}

      {/* ========================================
          ACTIONS
      ======================================== */}

      <TableCell className="text-right pr-5">
        <div className="flex items-center justify-end gap-2">

          {/* EDIT */}
          <Link
            href={`/admin/inventory/edit/${item.id}`}
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