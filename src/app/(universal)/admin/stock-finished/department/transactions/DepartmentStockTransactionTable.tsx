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

type Props = {
  transactions?: any[];
  currentPage: number;
  hasMore: boolean;
};

export default function DepartmentStockTransactionTable({
  transactions = [],
  currentPage,
  hasMore,
}: Props) {
  const router = useRouter();

  function goToPage(page: number) {
    router.push(
      `/admin/stock-finished/department/transactions?page=${page}`
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border bg-white">

      <Table>

        <TableHeader className="bg-zinc-200">
          <TableRow>

            <TableHead>Department</TableHead>
  <TableHead>Direction</TableHead>
            <TableHead>Item</TableHead>

            <TableHead>Type</TableHead>

          

            <TableHead>Quantity</TableHead>

            {/* <TableHead>Unit Cost</TableHead>

            <TableHead>Total Cost</TableHead> */}

            <TableHead>Reference</TableHead>

            <TableHead>Date</TableHead>

          </TableRow>
        </TableHeader>

        <TableBody>

          {transactions.map((tx) => (
            <TableRow
              key={tx.id}
              className="
                odd:bg-zinc-50
                even:bg-zinc-100
                hover:bg-blue-50
              "
            >
              <TableCell>
                {tx.departmentName}
              </TableCell>
               <TableCell>

                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    tx.direction === "IN"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {tx.direction}
                </span>

              </TableCell>

              <TableCell>
                <div className="flex flex-col">

                  <span className="font-medium">
                    {tx.inventoryItemName}
                  </span>

                 

                </div>
              </TableCell>

              <TableCell>
                {tx.type}
              </TableCell>

             

              <TableCell>
              

                 <div className="flex flex-col">

                  <span className="font-medium">
                    {Number(tx.quantity).toFixed(2)}
                  </span>

                  <span className="text-xs text-gray-500">
                    {tx.purchaseUnit}
                  </span>

                </div>
              </TableCell>

              {/* <TableCell>
                {Number(tx.costPerUnit).toFixed(2)}
              </TableCell>

              <TableCell>
                {Number(tx.totalCost).toFixed(2)}
              </TableCell> */}

              <TableCell>
                <div className="flex flex-col">

                  <span>
                    {tx.referenceType}
                  </span>

                  <span className="text-xs text-gray-500">
                    {tx.trasferId}
                  </span>

                </div>
              </TableCell>

              <TableCell>
                {tx.createdAt
                  ? new Date(
                      tx.createdAt
                    ).toLocaleString()
                  : "-"}
              </TableCell>

            </TableRow>
          ))}

        </TableBody>

      </Table>

      <div className="flex items-center justify-between border-t p-4">

        <div className="text-sm text-gray-500">
          Page {currentPage}
        </div>

        <div className="flex gap-2">

          <Button
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() =>
              goToPage(currentPage - 1)
            }
          >
            <ChevronLeft
              className="mr-1"
              size={16}
            />
            Previous
          </Button>

          <Button
            variant="outline"
            disabled={!hasMore}
            onClick={() =>
              goToPage(currentPage + 1)
            }
          >
            Next
            <ChevronRight
              className="ml-1"
              size={16}
            />
          </Button>

        </div>

      </div>

    </div>
  );
}