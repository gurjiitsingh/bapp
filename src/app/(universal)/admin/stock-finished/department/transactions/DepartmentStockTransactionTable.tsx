"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { displayStock } from "@/utils/inventory/displayStock";
import { DepartmentType } from "@/lib/types/department/DepartmentType";

 

type Transaction = any;

type Props = {
  departments: DepartmentType[];
};

export default function DepartmentStockTransactionTable({
  departments,
}: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState("ISSUE_TO_DEPARTMENT");
  const [departmentId, setDepartmentId] =
  useState("ALL");
  const [search, setSearch] = useState("");

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  async function loadTransactions() {
    setLoading(true);

    try {
const params = new URLSearchParams({
  date,
  type,
  departmentId,
});

      const res = await fetch(
        `/api/department/department-stock-transactions?${params}`,
        {
          cache: "no-store",
        }
      );

      const json = await res.json();

      setTransactions(json.data ?? []);
    } catch (err) {
      console.error(err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  loadTransactions();
}, [date, type, departmentId]);

const filteredTransactions = useMemo(() => {
  if (!search.trim()) return transactions;

  const q = search.trim().toLowerCase();

  return transactions.filter((tx) =>
    [
      tx.departmentName,
      tx.inventoryItemName,
      tx.createdBy,
      tx.type,
      tx.referenceType,
      tx.remarks,
    ]
      .filter(Boolean)
      .some((value) =>
        String(value)
          .toLowerCase()
          .includes(q)
      )
  );
}, [transactions, search]);

 

  return (
    <>
      {/* Filters */}
      <div className="mb-5 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
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

        <div>
          <label className="mb-1 block text-sm font-medium">
            Transaction Type
          </label>

          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value)
            }
            className="h-10 w-full rounded-md border border-slate-200 px-3"
          >
            <option value="ISSUE_TO_DEPARTMENT">
              Issue to Department
            </option>

            <option value="RETURN_TO_MAIN_STORE">
              Return to Main Store
            </option>

            <option value="PRODUCTION">
              Production
            </option>

            <option value="ALL">
              All
            </option>
          </select>
        </div>
        <div>
  <label className="mb-1 block text-sm font-medium">
    Department
  </label>

  <select
    value={departmentId}
    onChange={(e) =>
      setDepartmentId(e.target.value)
    }
    className="h-10 w-full rounded-md border border-slate-200 px-3"
  >
    <option value="ALL">
      All Departments
    </option>

    {departments.map((department) => (
      <option
        key={department.id}
        value={department.id}
      >
        {department.name}
      </option>
    ))}
  </select>
</div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Search
          </label>

         <Input
  value={search}
  placeholder="Search item, remarks, user..."
  onChange={(e) => setSearch(e.target.value)}
/>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <Table>
          <TableHeader className="bg-zinc-200">
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-gray-500"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
            filteredTransactions.map((tx) => (
                <TableRow
                  key={tx.id}
                  className="odd:bg-zinc-50 even:bg-zinc-100 hover:bg-blue-50"
                >
                  <TableCell className="font-medium">
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
                    {tx.inventoryItemName}
                  </TableCell>

                  <TableCell>
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                      {tx.type}
                    </span>
                  </TableCell>

                  <TableCell>
                    {displayStock(
                      tx.quantity,
                      tx.purchaseUnit,
                      tx.consumptionUnit,
                      tx.conversionFactor
                    )}
                  </TableCell>

                  <TableCell>
                    {tx.referenceType || "-"}
                  </TableCell>

                  <TableCell>
                    {tx.createdAt
                      ? new Date(
                          tx.createdAt
                        ).toLocaleString()
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="border-t border-slate-500  bg-gray-50 px-4 py-3">
          <span className="text-sm text-gray-600">
            Total Transactions:{" "}
            <span className="font-semibold">
           {filteredTransactions.length}
            </span>
          </span>
        </div>
      </div>
    </>
  );
}