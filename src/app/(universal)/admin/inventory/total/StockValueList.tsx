"use client";

import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InventoryItemType } from "@/lib/types/InventoryItemType";

type Props = {
  inventoryItems: InventoryItemType[];
};

export default function StockValueList({
  inventoryItems,
}: Props) {
  const totalStockValue = useMemo(() => {
    return inventoryItems.reduce(
      (sum, item) => sum + (item.stockValue ?? 0),
      0
    );
  }, [inventoryItems]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">
                Stock Value
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {inventoryItems.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>

                <TableCell>{item.name}</TableCell>

                <TableCell className="text-right font-medium">
                  {(item.stockValue ?? 0).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}

            <TableRow className="bg-emerald-50 font-bold">
              <TableCell colSpan={2}>
                Total Stock Value
              </TableCell>

              <TableCell className="text-right text-emerald-700 text-lg">
                {totalStockValue.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}