"use client";

import {
  TableCell,
  TableRow,
} from "@/components/ui/table";

import {
  formatPrice,
  formatPriceS,
} from "@/utils/inventory/formatPrice";

import { formatQuantity } from "@/utils/inventory/formatQty";

type Props = {
  tx: any;
};

const financialTypes = [
  "SALE",
  "PURCHASE",
];

export default function InventoryTransactionRow({
  tx,
}: Props) {
  const showFinancial =
    financialTypes.includes(tx.type);

  return (
    <TableRow
      className="
        whitespace-nowrap
        transition-colors
        odd:bg-zinc-50
        even:bg-zinc-100
        hover:bg-blue-50
        border-b border-zinc-200
      "
    >
      <TableCell className="font-medium">
        {tx.productName}
      </TableCell>

      <TableCell>{tx.type}</TableCell>

      <TableCell>
        {tx.supplierName || "-"}
      </TableCell>

      <TableCell>
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

      {/* PRICE */}

      <TableCell>
        {!showFinancial ? (
          <span className="text-gray-400">
            —
          </span>
        ) : tx.purchaseUnit &&
          tx.purchaseUnit !== tx.unit &&
          tx.conversionFactor ? (
          <div className="flex flex-col">
            <span className="font-medium">
              {formatPrice(
                tx.unitCost *
                  tx.conversionFactor
              )}{" "}
              / {tx.purchaseUnit}
            </span>

            <span className="text-xs text-gray-500">
              {formatPriceS(tx.unitCost)} /{" "}
              {tx.unit}
            </span>
          </div>
        ) : (
          <span className="font-medium">
            {formatPrice(tx.unitCost)} /{" "}
            {tx.unit}
          </span>
        )}
      </TableCell>

      {/* QUANTITY */}

      <TableCell>
        <div className="flex flex-col">
          {tx.purchaseUnit &&
          tx.purchaseUnit !== tx.unit &&
          tx.conversionFactor ? (
            <>
              <span className="font-medium">
                {formatQuantity(
                  tx.quantity /
                    tx.conversionFactor,
                  tx.purchaseUnit
                )}{" "}
                {tx.purchaseUnit}
              </span>

              <span className="text-xs text-gray-500">
                {formatQuantity(
                  tx.quantity,
                  tx.unit
                )}{" "}
                {tx.unit}
              </span>
            </>
          ) : (
            <span className="font-medium">
              {formatQuantity(
                tx.quantity,
                tx.unit
              )}{" "}
              {tx.unit}
            </span>
          )}
        </div>
      </TableCell>

      {/* TOTAL */}

      <TableCell>
        {showFinancial
          ? formatPrice(tx.totalAmount)
          : (
            <span className="text-gray-400">
              —
            </span>
          )}
      </TableCell>

      <TableCell>
        {formatQuantity(
          tx.beforeStock,
          tx.unit
        )}{" "}
        {tx.unit}
      </TableCell>

      <TableCell>
        {formatQuantity(
          tx.afterStock,
          tx.unit
        )}{" "}
        {tx.unit}
      </TableCell>

      <TableCell>
        {tx.createdBy}
      </TableCell>

      <TableCell>
        {tx.createdAt
          ? new Date(
              tx.createdAt
            ).toLocaleString()
          : "-"}
      </TableCell>
    </TableRow>
  );
}