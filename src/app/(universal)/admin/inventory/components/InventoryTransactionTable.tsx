"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  transactions: any[];
};

export default function InventoryTransactionTable({
  transactions,
}: Props) {
  
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white">
      <Table>
        <TableHeader className="bg-gray-100 ">
          <TableRow>
            <TableHead>
              Item
            </TableHead>

            <TableHead>
              Type
            </TableHead>

            <TableHead>
              Direction
            </TableHead>

            <TableHead>
              Qty
            </TableHead>

            <TableHead>
              Before
            </TableHead>

            <TableHead>
              After
            </TableHead>

            <TableHead>
              User
            </TableHead>

            <TableHead>
              Date
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {transactions.map((tx) => (
            <TableRow
              key={tx.id}
              className="whitespace-nowrap hover:bg-green-50 dark:hover:bg-zinc-800 transition rounded-xl"
            >
              <TableCell className="font-medium">
                {tx.inventoryItemName}
              </TableCell>

              <TableCell>
                {tx.transactionType}
              </TableCell>

              <TableCell>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    tx.stockDirection ===
                    "IN"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {tx.stockDirection}
                </span>
              </TableCell>

              <TableCell>
                {tx.quantity} {tx.unit}
              </TableCell>

              <TableCell>
                {tx.beforeStock}
              </TableCell>

              <TableCell>
                {tx.afterStock}
              </TableCell>

              <TableCell>
                {tx.createdBy}
              </TableCell>

              <TableCell>
                {tx.createdAt?.seconds
                  ? new Date(
                      tx.createdAt.seconds *
                        1000
                    ).toLocaleString()
                  : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}