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

import {
  formatPrice,
  formatPriceS,
} from "@/utils/inventory/formatPrice";

import { formatQuantity } from "@/utils/inventory/formatQty";

type Props = {
  transactions?: any[];
  currentPage: number;
  hasMore: boolean;
};

const financialTypes = [
  "SALE",
  "PURCHASE",
  "CUSTOMER_RETURN",
  "RETURN"
];

export default function InventoryTransactionTable({
  transactions = [],
  currentPage,
  hasMore,
}: Props) {
  const router = useRouter();



  function goToPage(page: number) {
    router.push(
      `/admin/inventory/transactions?page=${page}`
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white">
      <Table className="text-sm">
        <TableHeader className="bg-zinc-200">
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Avg Cost</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Before</TableHead>
            <TableHead>After</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>

     <TableBody>
  {transactions.map((tx) => {
    const showFinancial =
      financialTypes.includes(tx.type);

    return (
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
        {/* ITEM */}

        <TableCell className="font-medium">
        <span className="mr-2"> {tx.productName}</span> 
            <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              tx.direction === "IN"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {tx.direction}
          </span>
        </TableCell>

        {/* TYPE */}

        <TableCell>
          {tx.type}
        </TableCell>

        {/* CUSTOMER / SUPPLIER */}

        <TableCell>
          {tx.customerName || "-"}
        </TableCell>

    

        {/* UNIT PRICE */}

        <TableCell>
          {showFinancial ? (
            <span className="font-medium">
              {formatPrice(tx.unitPrice)} /{" "}
              {tx.transactionUnit}
            </span>
          ) : (
            "-"
          )}
        </TableCell>

        {/* QUANTITY */}

        <TableCell>
          <span className="font-medium">
            {formatQuantity(tx.quantity)}{" "}
            {tx.transactionUnit}
          </span>
        </TableCell>

        {/* TOTAL */}

        <TableCell>
          {showFinancial
            ? formatPrice(tx.totalAmount)
            : "-"}
        </TableCell>

        {/* BEFORE */}

        <TableCell>
          <span className="font-medium">
            {formatQuantity(tx.beforeStock)}{" "}
            {tx.transactionUnit}
          </span>
        </TableCell>

        {/* AFTER */}

        <TableCell>
          <span className="font-medium">
            {formatQuantity(tx.afterStock)}{" "}
            {tx.transactionUnit}
          </span>
        </TableCell>

        {/* USER */}

        <TableCell>
          {tx.createdBy}
        </TableCell>

        {/* DATE */}

        <TableCell>
          {tx.createdAt
            ? new Date(
                tx.createdAt
              ).toLocaleString()
            : "-"}
        </TableCell>
      </TableRow>
    );
  })}
</TableBody>
      </Table>

      <div className="flex items-center justify-between p-4 border-t bg-white">
        <div className="text-sm text-gray-500">
          Page {currentPage}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() =>
              goToPage(currentPage - 1)
            }
          >
            <ChevronLeft
              size={16}
              className="mr-1"
            />
            Previous
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={!hasMore}
            onClick={() =>
              goToPage(currentPage + 1)
            }
          >
            Next
            <ChevronRight
              size={16}
              className="ml-1"
            />
          </Button>
        </div>
      </div>
    </div>
  );
}