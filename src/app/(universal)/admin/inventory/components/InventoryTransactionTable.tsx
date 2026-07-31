"use client";

 
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { displayStock } from "@/utils/inventory/displayStock";
import { displayStock_1 } from "@/utils/inventory/displayStock_1";

type Props = {
  initialTransactions?: any[];
};

const financialTypes = [
  "SALE",
  "PURCHASE",
  "CUSTOMER_RETURN",
  "SUPPLIER_RETURN",
  "RETURN",
];

export default function InventoryTransactionTable({
  initialTransactions: initialTransactions = [],
}: Props) {

  
  const [transactions, setTransactions] = useState<any[]>(
    initialTransactions
  );
 
  const [loading, setLoading] = useState(false);

  const [type, setType] =
    useState("PURCHASE");

  const [search, setSearch] =
    useState("");

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  console.log("initialTransactions", initialTransactions);
console.log("transactions", transactions);


async function loadTransactions() {
  setLoading(true);

  try {
    const params = new URLSearchParams();

    if (date) {
      params.append("date", date);
    }

    if (type) {
      params.append("type", type);
    }

    const res = await fetch(
      `/api/inventory/inventory-transactions?${params.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to load transactions");
    }

    const json = await res.json();

    setTransactions(json.data ?? []);
  } catch (err) {
    console.error("Load transactions error:", err);
    setTransactions([]);
  } finally {
    setLoading(false);
  }
}

  const firstLoad = useRef(true);

useEffect(() => {
  if (firstLoad.current) {
    firstLoad.current = false;
    return;
  }

  loadTransactions();
}, [date, type]);


useEffect(() => {
  setTransactions(initialTransactions);
}, [initialTransactions]);

const filteredTransactions = useMemo(() => {
  if (!search.trim()) {
    return transactions;
  }

  const q = search.trim().toLowerCase();

  return transactions.filter((tx) =>
    [
      tx.inventoryItemName,
      tx.partyName,
      tx.partyType,
      tx.type,
      tx.direction,
      tx.createdBy,
    ]
      .filter(Boolean)
      .some((value) =>
        String(value)
          .toLowerCase()
          .includes(q)
      )
  );
}, [transactions, search]);

console.log("filteredTransactions---------------", filteredTransactions);
return (
  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
    {/* ===================================================== */}
    {/* FILTERS */}
    {/* ===================================================== */}

    <div className="border-b border-gray-200 bg-white p-4">
      <div className="grid gap-4 md:grid-cols-4">
        {/* Date */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Date
          </label>

          <Input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
          />
        </div>

        {/* Transaction Type */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Transaction Type
          </label>

          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value)
            }
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3"
          >
            <option value="PURCHASE">
             PURCHASE
            </option>
 <option value="STROE TO DPT">
              ISSUE TO DPT
            </option>
            <option value="DPT RETURN">
              DPT RETURN
            </option>
           

          

            <option value="SUPPLIER_RETURN">
             SUPPLIER RETURN
            </option>

            {/* <option value="PRODUCTION">
              Production
            </option> */}

            <option value="OPENING_STOCK">
             OPENING STOCK
            </option>

            <option value="ADJUSTMENT">
               ADJUSTMENT
            </option>

            <option value="ALL">
              ALL
            </option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Search
          </label>

          <Input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Item, supplier, user..."
          />
        </div>

        {/* Refresh */}
        <div className="flex items-end">
          <Button
            className="w-full"
            onClick={loadTransactions}
          >
            Refresh
          </Button>
        </div>
      </div>
    </div>

    {/* ===================================================== */}
    {/* TABLE */}
    {/* ===================================================== */}

    <Table className="text-sm">
      <TableHeader className="bg-zinc-200">
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Party</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Before</TableHead>
          <TableHead>After</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell
              colSpan={10}
              className="py-10 text-center"
            >
              Loading...
            </TableCell>
          </TableRow>
        ) : filteredTransactions.map((tx) => (
  <TableRow
    key={tx.id}
    className="
      whitespace-nowrap
      odd:bg-zinc-50
      even:bg-zinc-100
      hover:bg-blue-50
      border-b border-zinc-200
    "
  >
    <TableCell>{tx.inventoryItemName}</TableCell>
    <TableCell>{tx.type}</TableCell>
    <TableCell>{tx.partyName}</TableCell>
    <TableCell>{tx.purchaseUnitCost}</TableCell>
    <TableCell>
      {/* {tx.quantity} */}
      

      {displayStock_1(
                            tx.quantity,
                            tx.purchaseUnit,
                            tx.consumptionUnit,
                            tx.conversionFactor
                          )}
    </TableCell>
    <TableCell>
      {tx.transactionAmount} {" "}Rs
    </TableCell>
    <TableCell>{tx.beforeStock}</TableCell>
    <TableCell>{tx.afterStock}</TableCell>
    <TableCell>{tx.createdBy}</TableCell>
    <TableCell>
      {tx.createdAt
        ? new Date(tx.createdAt).toLocaleString()
        : "-"}
    </TableCell>
  </TableRow>
)
        )}
      </TableBody>
    </Table>

    {/* ===================================================== */}
    {/* FOOTER */}
    {/* ===================================================== */}

    <div className="flex items-center justify-between border-t bg-gray-50 px-4 py-3">
      <span className="text-sm text-gray-600">
        Total Transactions:{" "}
        <span className="font-semibold">
          {filteredTransactions.length}
        </span>
      </span>

      {loading && (
        <span className="text-sm text-blue-600">
          Loading...
        </span>
      )}
    </div>
  </div>
);
}