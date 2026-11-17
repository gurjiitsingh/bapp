
"use client";

import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { formatPrice } from "@/utils/inventory/formatPrice";
import { formatQuantity } from "@/utils/inventory/formatQty";

type Props = {
  transactions?: any[];
  currentPage: number;
  hasMore: boolean;
};

export default function InventoryTransactionTable({
  transactions = [],
  currentPage,
  hasMore,
}: Props) {
  const router = useRouter();

  function goToPage(page: number) {
    router.push(`/admin/inventory/transactions?page=${page}`);
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white">
      <div className="overflow-x-auto">
        <Table className="text-sm">
          <TableHeader className="bg-zinc-200">
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Salesperson</TableHead>
              <TableHead>Sale Price</TableHead>
              <TableHead>Production Cost</TableHead>
              <TableHead>Average Cost</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Sale Amount</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Profit / Loss</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {transactions.map((tx) => (
              <TableRow
                key={tx.id}
                className="
                  whitespace-nowrap
                  transition-colors
                  odd:bg-zinc-50
                  even:bg-zinc-100
                  hover:bg-blue-50
                  border-b border-zinc-200
                "
              >
                {/* PRODUCT */}
                <TableCell className="font-medium">
                  {tx.productName}
                </TableCell>

                {/* CUSTOMER */}
                <TableCell>
                  {tx.customerName || "-"}
                </TableCell>

                {/* SOURCE */}
                <TableCell>
                  <div className="font-medium">
                    {tx.saleSource || "-"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {tx.saleSourceName || ""}
                  </div>
                </TableCell>

                {/* SALESPERSON */}
                <TableCell>
                  {tx.salespersonName || "-"}
                </TableCell>

                {/* SELLING PRICE */}
                <TableCell>
                  {formatPrice(tx.unitPrice)} / {tx.transactionUnit}
                </TableCell>

                {/* PRODUCTION COST */}
                <TableCell>
                  {formatPrice(tx.costPriceAtSale)}
                </TableCell>

                {/* AVERAGE COST */}
                <TableCell>
                  {formatPrice(tx.costPriceAtSale)}
                </TableCell>

                {/* QUANTITY */}
                <TableCell>
                  <span className="font-medium">
                    {formatQuantity(tx.quantity)} {tx.transactionUnit}
                  </span>
                </TableCell>

                {/* SALE AMOUNT */}
                <TableCell className="font-medium">
                  {formatPrice(tx.totalAmount)}
                </TableCell>

                {/* TOTAL COST */}
                <TableCell>
                  {formatPrice(tx.totalCost)}
                </TableCell>

                {/* PROFIT / LOSS */}
                <TableCell>
                  <span
                    className={`font-semibold ${
                      tx.profit >= 0
                        ? "text-green-700"
                        : "text-red-600"
                    }`}
                  >
                    {formatPrice(tx.profit)}
                  </span>
                </TableCell>

                {/* PAYMENT */}
                <TableCell>
                  <div>{tx.paymentStatus || "-"}</div>
                  <div className="text-xs text-gray-500">
                    {tx.paymentMethod || ""}
                  </div>
                </TableCell>

                {/* USER */}
                <TableCell>
                  {tx.createdBy || "-"}
                </TableCell>

                {/* DATE */}
                <TableCell>
                  {tx.createdAt
                    ? new Date(tx.createdAt).toLocaleString()
                    : "-"}
                </TableCell>
              </TableRow>
            ))}

            {transactions.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={14}
                  className="py-10 text-center text-gray-500"
                >
                  No sales transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between p-4 border-t bg-white">
        <div className="text-sm text-gray-500">
          Page {currentPage}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            <ChevronLeft size={16} className="mr-1" />
            Previous
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={!hasMore}
            onClick={() => goToPage(currentPage + 1)}
          >
            Next
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
