"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";

import { displayStock } from "@/utils/inventory/displayStock";
import { DepartmentStockType } from "@/lib/types/department/DepartmentStockType";
import { getDepartmentStock } from "@/app/(universal)/action/production/departments/getDepartmentStock";

type Props = {
  departmentId: string;
  departmentName: string;
};

export default function DepartmentStockTable({
  departmentId,
  departmentName,
}: Props) {
  const [search, setSearch] = useState("");
  const [stock, setStock] = useState<DepartmentStockType[]>([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // FETCH DEPARTMENT STOCK
  // =====================================================

  useEffect(() => {
    let mounted = true;

    async function loadStock() {
      setLoading(true);

      try {
      const result = await getDepartmentStock(departmentId);
   //   console.log("dp stock---------------------",result)

if (!mounted) return;

setStock(result);
      } catch (error) {
        console.error(
          "Failed to fetch department stock:",
          error
        );

        if (mounted) {
          setStock([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (departmentId) {
      loadStock();
    } else {
      setStock([]);
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [departmentId]);

  // =====================================================
  // SEARCH
  // =====================================================

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return stock;
    }

    return stock.filter((item) =>
      item.inventoryItemName
        ?.toLowerCase()
        .includes(query)
    );
  }, [stock, search]);

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      {/* HEADER */}

      <div className="m-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <h2 className="font-semibold text-gray-800">
            Department Stock -{" "}
            <span className="text-amber-600">
              {departmentName}
            </span>
          </h2>

          <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
            <Search
              size={16}
              className="text-gray-400"
            />

            <input
              placeholder="Search item..."
              className="text-sm outline-none"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>
        </div>

        {/* <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/stock-finished/department/issue-stock/add"
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#00796b]"
          >
            Issue Stock
          </Link>

          <Link
            href="/admin/stock-finished/department/return-stock/add"
            className="inline-flex items-center justify-center rounded-xl bg-slate-400 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#00796b]"
          >
            Return Stock to main store
          </Link>

          <Link
            href="/admin/stock-finished/department"
            className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#00796b]"
          >
            All Departments
          </Link>

          <Link
            href="/admin/stock-finished/department/add"
            className="inline-flex items-center justify-center rounded-xl bg-[#00897b] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#00796b]"
          >
            + Add Department
          </Link>
        </div> */}
      </div>

      {/* STATUS / COUNT */}

      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <div className="text-sm text-gray-500">
          {loading
            ? "Loading stock..."
            : `${filtered.length} item${
                filtered.length !== 1 ? "s" : ""
              }`}
        </div>
      </div>

      {/* TABLE */}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3 font-medium">
                Item
              </th>

              <th className="px-4 py-3 font-medium text-right">
                Quantity
              </th>

              <th className="px-4 py-3 font-medium text-right">
                Avg Cost
              </th>

              <th className="px-4 py-3 font-medium text-right">
                Stock Value
              </th>

              <th className="px-4 py-3 font-medium text-right">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {/* LOADING */}

            {loading && (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-gray-500"
                >
                  Loading department stock...
                </td>
              </tr>
            )}

            {/* EMPTY */}

            {!loading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-gray-500"
                >
                  {search
                    ? "No items found"
                    : "No stock available"}
                </td>
              </tr>
            )}

            {/* DATA */}

            {!loading &&
              filtered.map((item) => (
                <tr
                  key={item.inventoryItemId}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  {/* ITEM */}

                  <td className="px-4 py-3 font-medium text-gray-800">
                    {item.inventoryItemName}
                  </td>

                  {/* QUANTITY */}

                  <td className="px-4 py-3 text-right font-medium">
                    <span className="font-medium">
                      {displayStock(
                        item.currentStock ?? 0,
                        item.purchaseUnit,
                        item.consumptionUnit,
                        item.conversionFactor
                      )}
                    </span>
                  </td>

                  {/* AVG COST */}

                  <td className="px-4 py-3 text-right">
                     ₹
                    {Number(
                      item.averageCost ?? 0
                    ).toFixed(2)}
                  </td>

                  {/* STOCK VALUE */}

                  <td className="px-4 py-3 text-right font-semibold text-green-700">
                     ₹
                    {Number(
                      item.stockValue ?? 0
                    ).toFixed(2)}
                  </td>

                  {/* ACTION */}

                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/stock-finished/department/edit-stock/${item.id}`}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}