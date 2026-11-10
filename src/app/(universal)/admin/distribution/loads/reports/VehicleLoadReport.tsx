"use client";

import React, { useCallback, useEffect, useState } from "react";
import { getVehicleLoadReport } from "@/app/(universal)/action/distribution/getVehicleLoadReport";
import type { VehicleType } from "@/lib/types/distribution/VehicleType";
import Link from "next/link";

type VehicleLoadItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  costPerUnit: number;
  lineValue: number;
  sellingPrice?: number;
  wholesalePrice?: number;
};

type VehicleLoad = {
  loadId: string;
  loadNo: string;
  tripId: string;
  businessDate: string;
  createdAt: string | null;

  routeName: string;
  vehicleId: string;
  vehicleName: string;

  salesmanName?: string;
  driverName?: string;

  totalItems: number;
  totalQuantity: number;
  totalValue: number;

  status: string;
  remarks?: string;

  items: VehicleLoadItem[];
};

type Props = {
  vehicles: VehicleType[];
};

const numberFormat = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

function formatDate(date?: string | null) {
  if (!date) return "-";

  const parsed = new Date(`${date.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date?: string | null) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function todayString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function firstDayOfMonth() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}-01`;
}

export default function VehicleLoadReport({ vehicles }: Props) {
  const [dateFrom, setDateFrom] = useState(firstDayOfMonth());
  const [dateTo, setDateTo] = useState(todayString());
  const [vehicleId, setVehicleId] = useState("ALL");

  const [loads, setLoads] = useState<VehicleLoad[]>([]);
  const [expandedLoads, setExpandedLoads] = useState<Set<string>>(
    new Set()
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = useCallback(async () => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setError("From date cannot be after To date.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await getVehicleLoadReport({
        dateFrom,
        dateTo,
        vehicleId,
      });

      if (!result?.success) {
        setLoads([]);
        setError(result?.message || "Unable to load report.");
        return;
      }

      setLoads((result.loads || []) as VehicleLoad[]);
      setExpandedLoads(new Set());
    } catch (err) {
      console.error("Vehicle load report error:", err);
      setError("Something went wrong while loading the report.");
      setLoads([]);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, vehicleId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const toggleLoad = (loadId: string) => {
    setExpandedLoads((previous) => {
      const next = new Set(previous);

      if (next.has(loadId)) {
        next.delete(loadId);
      } else {
        next.add(loadId);
      }

      return next;
    });
  };

  const totalLoads = loads.length;

  const totalQuantity = loads.reduce(
    (sum, load) => sum + Number(load.totalQuantity || 0),
    0
  );

  const totalValue = loads.reduce(
    (sum, load) => sum + Number(load.totalValue || 0),
    0
  );

  const totalProducts = loads.reduce(
    (sum, load) => sum + Number(load.totalItems || 0),
    0
  );

  return (
    <div className="space-y-5">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            Vehicle Loading Report
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View vehicle loading records and product details.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReport}
          disabled={loading}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh Report"}
        </button>
      </div>

      {/* ================================================= */}
      {/* FILTERS */}
      {/* ================================================= */}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              From Date
            </label>

            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              To Date
            </label>

            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              Vehicle
            </label>

            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="ALL">All Vehicles</option>

              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={fetchReport}
              disabled={loading}
              className="h-10 w-full rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Apply Filters
            </button>
          </div>

        </div>
      </div>

      {/* ================================================= */}
      {/* SUMMARY CARDS */}
      {/* ================================================= */}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">
            Total Loading
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-800">
            {numberFormat.format(totalLoads)}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Loading records
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">
            Total Products
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-800">
            {numberFormat.format(totalProducts)}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Product lines
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">
            Total Quantity
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-700">
            {numberFormat.format(totalQuantity)}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Units loaded
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">
            Total Load Value
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-700">
            ₹{numberFormat.format(totalValue)}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            At loading cost value
          </p>
        </div>

      </div>

      {/* ================================================= */}
      {/* REPORT TABLE */}
      {/* ================================================= */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="font-semibold text-slate-800">
              Loading Records
            </h2>

            <p className="text-xs text-slate-500">
              {loads.length} records found
            </p>
          </div>
        </div>

        {error && (
          <div className="m-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Loading report...
          </div>
        ) : loads.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-medium text-slate-600">
              No loading records found
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Try changing the date range or vehicle.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">

              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="w-10 px-4 py-3"></th>
                  <th className="px-4 py-3">Date / Load No.</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Salesman</th>
                  <th className="px-4 py-3 text-right">Items</th>
                  <th className="px-4 py-3 text-right">Quantity</th>
                  <th className="px-4 py-3 text-right">Value</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loads.map((load) => {
                  const isExpanded = expandedLoads.has(load.loadId);

                  return (
                    <React.Fragment key={load.loadId}>

                      <tr
                        onClick={() => toggleLoad(load.loadId)}
                        className="cursor-pointer hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                            {isExpanded ? "−" : "+"}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800">
                            {formatDate(load.businessDate)}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {load.loadNo || load.loadId}
                          </p>
                        </td>

                        <td className="px-4 py-3 font-medium text-slate-700">
                          {load.vehicleName || "-"}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {load.routeName || "-"}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {load.salesmanName || load.driverName || "-"}
                        </td>

                        <td className="px-4 py-3 text-right tabular-nums">
                          {numberFormat.format(load.totalItems || 0)}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold tabular-nums">
                          {numberFormat.format(load.totalQuantity || 0)}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold tabular-nums">
                          ₹{numberFormat.format(load.totalValue || 0)}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            {load.status || "LOADED"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
  <Link
    href={`/distribution/loads/${encodeURIComponent(load.loadId)}/print`}
    target="_blank"
    onClick={(e) => e.stopPropagation()}
    className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
  >
    Print
  </Link>
</td>
                      </tr>

                      {/* EXPANDED PRODUCT DETAILS */}

                      {isExpanded && (
                        <tr>
                          <td colSpan={10} className="bg-slate-50 px-6 py-4">

                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <h3 className="font-semibold text-slate-800">
                                  Loaded Products
                                </h3>

                                <p className="text-xs text-slate-500">
                                  Load No: {load.loadNo || load.loadId}
                                  {" · "}
                                  Created: {formatDateTime(load.createdAt)}
                                </p>
                              </div>

                              {load.remarks && (
                                <p className="text-xs text-slate-500">
                                  Remarks: {load.remarks}
                                </p>
                              )}
                            </div>

                            {load.items.length === 0 ? (
                              <p className="py-4 text-center text-sm text-slate-500">
                                No product details found for this load.
                              </p>
                            ) : (
                              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                                <table className="w-full min-w-[650px] text-sm">

                                  <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                                    <tr>
                                      <th className="px-4 py-2.5 text-left">
                                        Product
                                      </th>

                                      <th className="px-4 py-2.5 text-right">
                                        Quantity
                                      </th>

                                      <th className="px-4 py-2.5 text-right">
                                        Cost / Unit
                                      </th>

                                      <th className="px-4 py-2.5 text-right">
                                        Line Value
                                      </th>
                                    </tr>
                                  </thead>

                                  <tbody className="divide-y divide-slate-100">
                                    {load.items.map((item) => (
                                      <tr key={item.id}>
                                        <td className="px-4 py-2.5 font-medium text-slate-700">
                                          {item.productName}
                                        </td>

                                        <td className="px-4 py-2.5 text-right tabular-nums">
                                          {numberFormat.format(item.quantity)}
                                        </td>

                                        <td className="px-4 py-2.5 text-right tabular-nums">
                                          ₹{numberFormat.format(item.costPerUnit)}
                                        </td>

                                        <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                                          ₹{numberFormat.format(item.lineValue)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>

                                </table>
                              </div>
                            )}

                          </td>
                        </tr>
                      )}

                    </React.Fragment>
                  );
                })}

              </tbody>

              <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-slate-800">
                <tr>
                  <td colSpan={6} className="px-4 py-3">
                    Total
                  </td>

                  <td className="px-4 py-3 text-right">
                    {numberFormat.format(totalProducts)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {numberFormat.format(totalQuantity)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    ₹{numberFormat.format(totalValue)}
                  </td>

                  <td></td>
                </tr>
              </tfoot>

            </table>
          </div>
        )}

      </div>

    </div>
  );
}