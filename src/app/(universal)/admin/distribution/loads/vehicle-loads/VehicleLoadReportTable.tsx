"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { VehicleLoadReport } from "@/lib/types/distribution/VehicleLoadReportType";
import { getVehicleLoadReports } from "@/app/(universal)/action/distribution/reports/load/getVehicleLoadReports";

type Props = {
  data: VehicleLoadReport[];
};

export default function VehicleLoadReportTable({
  data,
}: Props) {
  const [loads, setLoads] = useState<VehicleLoadReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("ALL");

  async function loadReports() {
    setLoading(true);

    try {
      const result = await getVehicleLoadReports({
        status,
        limit: 100,
      });

      if (!result.success) {
        console.error(result.message);
        setLoads([]);
        return;
      }

      setLoads(result.data);
    } catch (error) {
      console.error(error);
      setLoads([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, [status]);

  function formatDate(date?: Date) {
    if (!date) return "-";

    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  function formatMoney(value: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);
  }

  function getStatusClass(status: string) {
    switch (status) {
      case "LOADED":
        return "bg-blue-100 text-blue-700";

      case "IN_ROUTE":
        return "bg-yellow-100 text-yellow-700";

      case "RETURNED":
        return "bg-orange-100 text-orange-700";

      case "SETTLED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <div className="w-full space-y-5">

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-xl font-semibold">
            Vehicle Load History
          </h2>

          <p className="text-sm text-gray-500">
            Stock transferred from factory to vehicles
          </p>
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-md border bg-white px-3 text-sm"
        >
          <option value="ALL">
            All Status
          </option>

          <option value="LOADED">
            Loaded
          </option>

          <option value="IN_ROUTE">
            In Route
          </option>

          <option value="RETURNED">
            Returned
          </option>

          <option value="SETTLED">
            Settled
          </option>

          <option value="CANCELLED">
            Cancelled
          </option>
        </select>

      </div>

      {/* ================================= */}
      {/* TABLE */}
      {/* ================================= */}

      <div className="overflow-hidden rounded-xl border bg-white">

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-zinc-100">

              <tr>

                <th className="p-3 text-left">
                  Date
                </th>

                <th className="p-3 text-left">
                  Load
                </th>

                <th className="p-3 text-left">
                  Trip
                </th>

                <th className="p-3 text-left">
                  Vehicle
                </th>

                <th className="p-3 text-left">
                  Driver
                </th>

                <th className="p-3 text-left">
                  Route
                </th>

                <th className="p-3 text-right">
                  Items
                </th>

                <th className="p-3 text-right">
                  Quantity
                </th>

                <th className="p-3 text-right">
                  Cost Value
                </th>

                <th className="p-3 text-center">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {/* Loading */}

              {loading && (
                <tr>
                  <td
                    colSpan={10}
                    className="p-10 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              )}

              {/* Empty */}

              {!loading && loads.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="p-10 text-center text-gray-500"
                  >
                    No vehicle loads found.
                  </td>
                </tr>
              )}

              {/* Data */}

           {!loading &&
  loads.map((load) => (
    <tr
      key={load.loadId}
      className="
        border-t
        hover:bg-blue-50
        transition-colors
      "
    >
      {/* DATE */}
      <td className="p-3 whitespace-nowrap">
        {formatDate(load.createdAt)}
      </td>

      {/* LOAD */}
      <td className="p-3 font-medium">
        <Link
          href={`/admin/distribution/loads/vehicle-loads/${encodeURIComponent(
            load.loadId
          )}`}
          className="
            text-blue-600
            hover:text-blue-800
            hover:underline
          "
        >
          {load.loadNo || load.loadId}
        </Link>
      </td>

      {/* TRIP */}
      <td className="p-3">
        {load.tripId ? (
          <Link 
            href={`/admin/distribution/trips/${encodeURIComponent(
              load.tripId
            )}`}
            className="
              text-gray-700
              hover:text-blue-600
              hover:underline
            "
          >
            {load.tripId || load.tripId}
          </Link>
        ) : (
          "-"
        )}
      </td>

      {/* VEHICLE */}
      <td className="p-3">
        <div className="font-medium">
          {load.vehicleName || "-"}
        </div>

        {load.locationCode && (
          <div className="text-xs text-gray-500">
            {load.locationCode}
          </div>
        )}
      </td>

      {/* DRIVER */}
      <td className="p-3">
        {load.driverName ||
          load.responsiblePerson ||
          "-"}
      </td>

      {/* ROUTE */}
      <td className="p-3">
        {load.routeName || "-"}
      </td>

      {/* ITEMS */}
      <td className="p-3 text-right">
        {load.totalItems}
      </td>

      {/* QUANTITY */}
      <td className="p-3 text-right font-medium">
        {load.totalQuantity}
      </td>

      {/* COST */}
      <td className="p-3 text-right">
        {formatMoney(load.totalValue)}
      </td>

      {/* STATUS */}
      <td className="p-3 text-center">
        <span
          className={`
            inline-flex
            rounded-full
            px-3
            py-1
            text-xs
            font-medium
            ${getStatusClass(load.status)}
          `}
        >
          {load.status}
        </span>
      </td>
    </tr>
  ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}