"use client";

import { getSalemanSettlements, SalemanSettlement } from "@/app/(universal)/action/distribution/saleman/getSalemanSettlements";
import { useEffect, useState } from "react";

 

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value || 0);
}

function formatDate(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function SalemanSettlementsPage() {
  const [settlements, setSettlements] = useState<
    SalemanSettlement[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  async function loadSettlements() {
    setLoading(true);

    try {
      const result =
        await getSalemanSettlements();

      if (result.success) {
        setSettlements(result.data);
      } else {
        setSettlements([]);
      }
    } catch (error) {
      console.error(error);
      setSettlements([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettlements();
  }, []);

  const filteredSettlements =
    settlements.filter((item) => {
      const value = search
        .trim()
        .toLowerCase();

      if (!value) return true;

      return (
        item.salesmanName
          .toLowerCase()
          .includes(value) ||
        item.vehicleName
          .toLowerCase()
          .includes(value) ||
        item.tripId
          .toLowerCase()
          .includes(value) ||
        item.settlementId
          .toLowerCase()
          .includes(value)
      );
    });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Salesman Settlements
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View salesman trip sales, collections and settlement details.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSettlements}
          disabled={loading}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Search */}

      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search salesman, vehicle or trip..."
          className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-500"
        />
      </div>

      {/* Summary */}

      {!loading && (
        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <SummaryCard
            title="Settlements"
            value={filteredSettlements.length.toString()}
          />

          <SummaryCard
            title="Sales"
            value={formatMoney(
              filteredSettlements.reduce(
                (sum, item) =>
                  sum + item.totalSalesAmount,
                0
              )
            )}
          />

          <SummaryCard
            title="Cash Collected"
            value={formatMoney(
              filteredSettlements.reduce(
                (sum, item) =>
                  sum + item.totalCashCollected,
                0
              )
            )}
          />

          <SummaryCard
            title="Expenses"
            value={formatMoney(
              filteredSettlements.reduce(
                (sum, item) =>
                  sum + item.totalExpenses,
                0
              )
            )}
          />
        </div>
      )}

      {/* Table */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading settlements...
          </div>
        ) : filteredSettlements.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No salesman settlements found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1500px] w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Trip
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Salesman
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Vehicle
                  </th>

                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    Total Sales
                  </th>

                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    Cash Sale
                  </th>

                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    Credit Sale
                  </th>

                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    Old Credit
                  </th>

                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    Cash Collected
                  </th>

                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    Expenses
                  </th>

                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    Payable
                  </th>

                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    Handed Over
                  </th>

                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    Difference
                  </th>

                  <th className="px-4 py-3 text-center font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredSettlements.map(
                  (item) => {
                    const difference =
                      item.excessAmount -
                      item.shortageAmount;

                    return (
                      <tr
                        key={item.settlementId}
                        className="hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                          {formatDate(
                            item.createdAt
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">
                            {item.tripId}
                          </div>

                          <div className="text-xs text-gray-400">
                            {item.settlementId}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">
                            {item.salesmanName ||
                              "-"}
                          </div>

                          <div className="text-xs text-gray-400">
                            {item.salesmanId}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-gray-700">
                          {item.vehicleName ||
                            "-"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-800">
                          {formatMoney(
                            item.totalSalesAmount
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">
                          {formatMoney(
                            item.newSaleCashCollected
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">
                          {formatMoney(
                            item.newSaleCreditAmount
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">
                          {formatMoney(
                            item.oldCreditCollected
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-gray-800">
                          {formatMoney(
                            item.totalCashCollected
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">
                          {formatMoney(
                            item.totalExpenses
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-800">
                          {formatMoney(
                            item.amountPayableToManager
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">
                          {formatMoney(
                            item.amountHandedOver
                          )}
                        </td>

                        <td
                          className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${
                            difference < 0
                              ? "text-red-600"
                              : difference > 0
                                ? "text-green-600"
                                : "text-gray-700"
                          }`}
                        >
                          {formatMoney(
                            difference
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <StatusBadge
                            status={
                              item.status
                            }
                          />
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================
   SUMMARY CARD
===================================================== */

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {title}
      </div>

      <div className="mt-1 text-lg font-bold text-gray-800">
        {value}
      </div>
    </div>
  );
}

/* =====================================================
   STATUS
===================================================== */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status.toUpperCase();

  let className =
    "bg-gray-100 text-gray-700";

  if (normalized === "OPEN") {
    className =
      "bg-yellow-100 text-yellow-700";
  }

  if (
    normalized === "SETTLED" ||
    normalized === "CLOSED"
  ) {
    className =
      "bg-green-100 text-green-700";
  }

  if (normalized === "CANCELLED") {
    className =
      "bg-red-100 text-red-700";
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {status}
    </span>
  );
}