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
import { displayStock } from "@/utils/inventory/displayStock";

type Props = {
  transactions?: any[];

  currentPage: number;

  hasMore: boolean;
};
const financialTypes = [
  "SALE",
  "PURCHASE",
  "CUSTOMER_RETURN",
  "SUPPLIER_RETURN",
  "RETURN",
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

      {/* ===================================================== */}
      {/* TABLE */}
      {/* ===================================================== */}

      <Table className="text-sm">

        <TableHeader className="bg-zinc-200">
          <TableRow>

            <TableHead>
              Item
            </TableHead>

            <TableHead>
              Type
            </TableHead>

            <TableHead>
                  Party
                </TableHead>

             

         

            <TableHead>
              Price
            </TableHead>

            <TableHead>
              Qty
            </TableHead>

            <TableHead>
              Amount
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
  {transactions.map((tx) => {

   
    const showFinancial = financialTypes.includes(tx.type);

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
             <span className="mr-1">{tx.inventoryItemName}</span>   

                    <span
                  className={`text-xs px-1 px-2 py-1 rounded-full font-medium ${
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

              {/* SUPPLIER */}

            <TableCell>
  <div className="flex flex-col">
    <span>{tx.partyName || "-"}</span>

    {tx.partyType && (
      <span className="text-xs text-gray-500">
        {tx.partyType}
      </span>
    )}
  </div>
</TableCell>
             

            

              {/* PRICE */}

         <TableCell>
       {tx.purchaseUnitCost}
  {/* {showFinancial ? (
    <div className="flex flex-col">

      {tx.purchaseUnit &&
      tx.purchaseUnit !== tx.consumptionUnit &&
      tx.conversionFactor ? (
        <>
          <span className="font-medium">
            {tx.unitCost != null
              ? `${formatPrice(
                  tx.unitCost * tx.conversionFactor
                )} / ${tx.purchaseUnit}`
              : "-"}
          </span>

          <span className="text-xs text-gray-500">
            {tx.unitCost != null
              ? `${formatPriceS(tx.unitCost)} / ${tx.consumptionUnit}`
              : "-"}
          </span>
        </>
      ) : (
        <span className="font-medium">
          {tx.unitCost != null
            ? `${formatPrice(tx.unitCost)} / ${tx.consumptionUnit}`
            : "-"}
        </span>
      )}

    </div>
  ) : (
    "-"
  )} */}
</TableCell>

              {/* QUANTITY */}

              <TableCell>
                <div className="flex flex-col">





                 {Number(tx.purchaseQuantity).toFixed(2)}
               
                

                </div>
              </TableCell>

              {/* TOTAL */}

              <TableCell>
                {Number(tx.purchaseQuantity* tx.purchaseUnitCost).toFixed(2)}
              </TableCell>

              {/* BEFORE */}

              <TableCell>
                <div className="flex flex-col">
  {Number(tx.beforeStock/tx.conversionFactor).toFixed(2)}
                  {/* {tx.purchaseUnit &&
                  tx.purchaseUnit !== tx.consumptionUnit &&
                  tx.conversionFactor ? (
                    <>
                      <span className="font-medium">
                        {formatQuantity(
                          tx.beforeStock /
                            tx.conversionFactor,
                          tx.purchaseUnit
                        )}{" "}
                        {tx.purchaseUnit}
                      </span>

                      <span className="text-xs text-gray-500">
                        {formatQuantity(
                          tx.beforeStock,
                          tx.consumptionUnit
                        )}{" "}
                        {tx.consumptionUnit}
                      </span>
                    </>
                  ) : (
                    <span className="font-medium">
                      {formatQuantity(
                        tx.beforeStock,
                        tx.consumptionUnit
                      )}{" "}
                      {tx.consumptionUnit}
                    </span>
                  )} */}

                </div>
              </TableCell>

              {/* AFTER */}

              <TableCell>
                <div className="flex flex-col">
{Number(tx.afterStock/tx.conversionFactor).toFixed(2)}
                  {/* {tx.purchaseUnit &&
                  tx.purchaseUnit !== tx.consumptionUnit &&
                  tx.conversionFactor ? (
                    <>
                      <span className="font-medium">
                        {formatQuantity(
                          tx.afterStock /
                            tx.conversionFactor,
                          tx.purchaseUnit
                        )}{" "}
                        {tx.purchaseUnit}
                      </span>

                      <span className="text-xs text-gray-500">
                        {formatQuantity(
                          tx.afterStock,
                          tx.consumptionUnit
                        )}{" "}
                        {tx.consumptionUnit}
                      </span>
                    </>
                  ) : (
                    <span className="font-medium">
                      {formatQuantity(
                        tx.afterStock,
                        tx.consumptionUnit
                      )}{" "}
                      {tx.consumptionUnit}
                    </span>
                  )} */}

                </div>
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

      {/* ===================================================== */}
      {/* PAGINATION */}
      {/* ===================================================== */}

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