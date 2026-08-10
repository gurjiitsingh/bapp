"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  getDistributionTrips,
  DistributionTripReport,
} from "@/app/(universal)/action/distribution/reports/trip/getDistributionTrips";

export default function DistributionTripsPage() {
  const [trips, setTrips] =
    useState<DistributionTripReport[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [status, setStatus] =
    useState("ALL");

  async function loadTrips() {
    setLoading(true);

    try {
      const result =
        await getDistributionTrips({
          status,
          limit: 100,
        });

      if (!result.success) {
        console.error(result.message);
        setTrips([]);
        return;
      }

      setTrips(result.data);
    } catch (error) {
      console.error(error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrips();
  }, [status]);

  function formatDate(date?: Date) {
    if (!date) return "-";

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(date);
  }

  function formatMoney(value: number) {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    ).format(value);
  }

  function getStatusClass(status: string) {
    switch (status) {
      case "LOADED":
        return "bg-blue-100 text-blue-700";

      case "IN_ROUTE":
        return "bg-yellow-100 text-yellow-700";

      case "SETTLED":
        return "bg-green-100 text-green-700";

      case "COMPLETED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="w-full space-y-6">

        {/* ===================================== */}
        {/* HEADER */}
        {/* ===================================== */}

        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              Distribution Trips
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Vehicle trips, loading, sales and
              settlement summary.
            </p>
          </div>

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
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

            <option value="COMPLETED">
              Completed
            </option>

            <option value="SETTLED">
              Settled
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>
          </select>

        </div>


        {/* ===================================== */}
        {/* TABLE */}
        {/* ===================================== */}

        <div className="overflow-hidden rounded-xl border bg-white">

          <table className="w-full text-sm">

            <thead className="bg-zinc-100">

              <tr>

                <th className="p-3 text-left">
                  Date
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
                  Loaded
                </th>

                <th className="p-3 text-right">
                  Sales
                </th>

                <th className="p-3 text-right">
                  Cash
                </th>

                <th className="p-3 text-right">
                  Credit
                </th>

                <th className="p-3 text-right">
                  Expenses
                </th>

                <th className="p-3 text-center">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {loading && (
                <tr>
                  <td
                    colSpan={11}
                    className="p-10 text-center"
                  >
                    Loading trips...
                  </td>
                </tr>
              )}


              {!loading &&
                trips.length === 0 && (
                  <tr>
                    <td
                      colSpan={11}
                      className="p-10 text-center text-gray-500"
                    >
                      No distribution trips found.
                    </td>
                  </tr>
                )}


              {!loading &&
                trips.map((trip) => (

                  <tr
                    key={trip.tripId}
                    className="
                      border-t
                      hover:bg-blue-50
                      transition-colors
                    "
                  >

                    {/* DATE */}

                    <td className="p-3 whitespace-nowrap">
                      {formatDate(
                        trip.createdAt
                      )}
                    </td>


                    {/* TRIP */}

                    <td className="p-3">

                      <Link
                        href={`/admin/distribution/trips/${encodeURIComponent(
                          trip.tripId
                        )}`}
                        className="
                          font-medium
                          text-blue-600
                          hover:text-blue-800
                          hover:underline
                        "
                      >
                        {trip.tripNo ||
                          trip.tripId}
                      </Link>

                      {/* <div className="text-xs text-gray-400">
                        {trip.tripId}
                      </div> */}

                    </td>


                    {/* VEHICLE */}

                    <td className="p-3 flex gap2 ">

                      <div className="font-medium">
                        {trip.vehicleName || "-"}
                      </div>

                      {trip.locationCode && (
                        <div className="text-[9px] text-gray-500">
                         ( {trip.locationCode})
                        </div>
                      )}

                    </td>


                    {/* DRIVER */}

                    <td className="p-3">
                      {trip.driverName ||
                        trip.responsiblePerson ||
                        "-"}
                    </td>


                    {/* ROUTE */}

                    <td className="p-3">
                      {trip.routeName || "-"}
                    </td>


                    {/* LOADED */}

                    <td className="p-3 text-right">

                      <div className="font-medium">
                        {trip.totalLoadedQuantity}
                      </div>

                      <div className="text-xs text-gray-500">
                        {formatMoney(
                          trip.totalLoadedValue
                        )}
                      </div>

                    </td>


                    {/* SALES */}

                    <td className="p-3 text-right font-medium">
                      {formatMoney(
                        trip.totalSalesAmount
                      )}
                    </td>


                    {/* CASH */}

                    <td className="p-3 text-right">
                      {formatMoney(
                        trip.totalCashCollected
                      )}
                    </td>


                    {/* CREDIT */}

                    <td className="p-3 text-right">
                      {formatMoney(
                        trip.totalCreditAmount
                      )}
                    </td>


                    {/* EXPENSE */}

                    <td className="p-3 text-right">
                      {formatMoney(
                        trip.totalExpenses
                      )}
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
                          ${getStatusClass(
                            trip.status
                          )}
                        `}
                      >
                        {trip.status}
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