"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber, formatPrice } from "@/utils/inventory/formatPrice";
import { formatQuantity } from "@/utils/inventory/formatQty";

type Props = {
  transactions: any[];
};

export default function InventoryTransactionTable({
  transactions,
}: Props) {
  console.log("transactions------------", transactions)
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white">
     <Table
  className="text-sm"
>
      <TableHeader className="bg-zinc-200">
          <TableRow>
            <TableHead>
              Item
            </TableHead>

            <TableHead>
              Type
            </TableHead>
           

              <TableHead>
             supplierName
            </TableHead>

            <TableHead>
              Direction
            </TableHead>
            <TableHead>
              Price
            </TableHead>
            <TableHead>
              Qty
            </TableHead>
            <TableHead>
              Order Amount
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
                {tx.inventoryItemName}
              </TableCell> 

                

              <TableCell>
                {tx.transactionType}
              </TableCell>

               <TableCell>
                {tx.supplierName}
              </TableCell>

              <TableCell>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${tx.stockDirection ===
                    "IN"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                    }`}
                >
                  {tx.stockDirection}
                </span>
              </TableCell>
          
               <TableCell>
  <div className="flex flex-col">
    
    {tx.purchaseUnit &&
    tx.purchaseUnit !== tx.unit &&
    tx.conversionFactor ? (
      <>
        <span className="font-medium">
          {formatPrice(
            tx.unitCost * tx.conversionFactor
          )}{" "}
          / {tx.purchaseUnit}
        </span>

        <span className="text-xs text-gray-500">
          {formatPrice(tx.unitCost)} / {tx.unit}
        </span>
      </>
    ) : (
      <span className="font-medium">
        {formatPrice(tx.unitCost)} / {tx.unit}
      </span>
    )}
  </div>
</TableCell>
             


              <TableCell>
                <div className="flex flex-col">

                  {/* Purchase/display quantity */}
                  {tx.purchaseUnit &&
                    tx.purchaseUnit !== tx.unit &&
                    tx.conversionFactor ? (
                    <>
                      <span className="font-medium">
                        {formatQuantity(
                          tx.quantity / tx.conversionFactor,
                          tx.purchaseUnit
                        )}{" "}
                        {tx.purchaseUnit}
                      </span>

                      <span className="text-xs text-gray-500">
                        {formatQuantity(tx.quantity, tx.unit)}{" "}
                        {tx.unit}
                      </span>
                    </>
                  ) : (
                    <span className="font-medium">
                      {formatQuantity(tx.quantity, tx.unit)}{" "}
                      {tx.unit}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {formatPrice(tx.totalAmount)}
              </TableCell>


              {/* <TableCell>
  {formatQuantity(tx.beforeStock, tx.unit)}
</TableCell> */}


              <TableCell>
                <div className="flex flex-col">

                  {/* Purchase/display quantity */}
                  {tx.purchaseUnit &&
                    tx.purchaseUnit !== tx.unit &&
                    tx.conversionFactor ? (
                    <>
                      <span className="font-medium">
                        {formatQuantity(
                          tx.beforeStock / tx.conversionFactor,
                          tx.purchaseUnit
                        )}{" "}
                        {tx.purchaseUnit}
                      </span>

                      <span className="text-xs text-gray-500">
                        {formatQuantity(tx.beforeStock, tx.unit)}{" "}
                        {tx.unit}
                      </span>
                    </>
                  ) : (
                    <span className="font-medium">
                      {formatQuantity(tx.beforeStock, tx.unit)}{" "}
                      {tx.unit}
                    </span>
                  )}
                </div>
              </TableCell>






              <TableCell>
                <div className="flex flex-col">

                  {/* Purchase/display quantity */}
                  {tx.purchaseUnit &&
                    tx.purchaseUnit !== tx.unit &&
                    tx.conversionFactor ? (
                    <>
                      <span className="font-medium">
                        {formatQuantity(
                          tx.afterStock / tx.conversionFactor,
                          tx.purchaseUnit
                        )}{" "}
                        {tx.purchaseUnit}
                      </span>

                      <span className="text-xs text-gray-500">
                        {formatQuantity(tx.afterStock, tx.unit)}{" "}
                        {tx.unit}
                      </span>
                    </>
                  ) : (
                    <span className="font-medium">
                      {formatQuantity(tx.afterStock, tx.unit)}{" "}
                      {tx.unit}
                    </span>
                  )}
                </div>
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