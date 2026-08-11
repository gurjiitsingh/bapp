"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { getDistributionTripDetail } from "@/app/(universal)/action/distribution/reports/trip/getDistributionTripDetail";
import { Button } from "@/components/ui/button";

export default function DistributionTripDetailPage() {

  const params = useParams();

  const tripId =
    params.tripId as string;

  const [data, setData] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {

    async function load() {

      if (!tripId) return;

      setLoading(true);

      try {

        const result =
          await getDistributionTripDetail(
            decodeURIComponent(tripId)
          );

        if (!result.success) {
          setError(
            result.message ||
            "Failed to load trip."
          );

          return;
        }

        setData(result.data);

      } catch (error: any) {

        console.error(error);

        setError(
          error?.message ||
          "Failed to load trip."
        );

      } finally {

        setLoading(false);

      }
    }

    load();

  }, [tripId]);


  function formatMoney(value: number) {

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    ).format(value || 0);
  }


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


  function statusClass(status: string) {

    switch (status) {

      case "LOADED":
        return "bg-blue-100 text-blue-700";

      case "IN_ROUTE":
        return "bg-yellow-100 text-yellow-700";

      case "SETTLED":
      case "COMPLETED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }


  if (loading) {

    return (
      <div className="p-6">
        Loading trip...
      </div>
    );
  }


  if (error) {

    return (
      <div className="p-6">

        <div className="rounded-xl border  border-slate-100  bg-white p-6 text-red-600">
          {error}
        </div>

      </div>
    );
  }


  if (!data) {
    return null;
  }


  const trip = data.trip;

  const loads = data.loads || [];

  const sales = data.sales || [];


  return (

    <div className="min-h-screen bg-gray-50 p-6">

      <div className="mx-auto max-w-7xl space-y-6">


        {/* ===================================== */}
        {/* BACK */}
        {/* ===================================== */}

 <div className="flex items-center justify-between">

  {/* Back */}
  <Link
    href="/admin/distribution/trips"
    className="
      inline-flex
      items-center
      gap-2
      rounded-lg
      border
      border-slate-200
      bg-white
      px-4
      py-2
      text-sm
      font-medium
      text-slate-600
      shadow-sm
      transition
      hover:bg-slate-50
      hover:text-slate-900
    "
  >
    ←
    <span>Back to Trips</span>
  </Link>


  {/* Settlement */}
  <Link
    href={`/admin/distribution/trips/${encodeURIComponent(
      tripId
    )}/settle`}
  >
    <Button
      className="
      bg-red-600
        inline-flex
        items-center
        gap-2
        rounded-lg
        px-5
        py-2.5
        font-semibold
        shadow-sm
      "
    >
      <span>💰</span>
      <span>
        {trip.status === "SETTLED"
          ? "View Settlement"
          : "Settle Trip"}
      </span>
    </Button>
  </Link>

</div>
        {/* ===================================== */}
        {/* HEADER */}
        {/* ===================================== */}

        <div className="rounded-2xl border  border-slate-100  bg-white p-6 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <h1 className="text-2xl font-bold">
                {trip.tripNo ||
                  trip.id}
              </h1>

              {/* <p className="mt-1 text-sm text-gray-500">
                Trip ID: {trip.id}
              </p> */}

            </div>


            <span
              className={`
                rounded-full
                px-4
                py-2
                text-sm
                font-medium
                ${statusClass(
                trip.status
              )}
              `}
            >
              {trip.status}
            </span>

          </div>


          {/* VEHICLE / DRIVER */}

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">

            <div>
              <p className="text-xs text-gray-500">
                Vehicle
              </p>

              <p className="font-medium">
                {trip.vehicleName || "-"}
              </p>

              <p className="text-xs text-gray-400">
                {trip.locationCode || ""}
              </p>
            </div>


            <div>
              <p className="text-xs text-gray-500">
                Saleman
              </p>

              <p className="font-medium">
                {trip.saleman ||
                  trip.responsiblePerson ||
                  "-"}
              </p>
            </div>


            <div>
              <p className="text-xs text-gray-500">
                Route
              </p>

              <p className="font-medium">
                {trip.routeName || "-"}
              </p>
            </div>


            <div>
              <p className="text-xs text-gray-500">
                Created
              </p>

              <p className="font-medium">
                {formatDate(
                  trip.createdAt
                )}
              </p>
            </div>

          </div>

        </div>


        {/* ===================================== */}
        {/* SUMMARY */}
        {/* ===================================== */}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">

          <SummaryCard
            title="Loaded"
            value={`${trip.totalLoadedQuantity || 0} kg`}
            subValue={formatMoney(
              trip.totalLoadedValue || 0
            )}
          />

          <SummaryCard
            title="Sales"
            value={formatMoney(
              trip.totalSalesAmount || 0
            )}
            subValue={`Credit ${formatMoney(
              trip.totalCreditAmount || 0
            )}`}
          />

          <SummaryCard
            title="Cash Sale"
            value={formatMoney(
              (trip.totalSalesAmount || 0) -
              (trip.totalCreditAmount || 0)
            )}
          />

          {/* <SummaryCard
            title="Credit Sale"
            value={formatMoney(
              trip.totalPreviousCreditCollected || 0
            )}
          /> */}

          <SummaryCard
            title="Total Cash Collected"
            value={formatMoney(
              trip.totalCashCollected || 0
            )}
            subValue="New sale cash + old credit"
          />

          <SummaryCard
            title="Settlement"
            value={formatMoney(
              trip.totalAmountHandedOver || 0
            )}
            subValue={`Difference ${formatMoney(
              trip.settlementDifference || 0
            )}`}
          />

        </div>


        {/* ===================================== */}
        {/* LOADS */}
        {/* ===================================== */}

        <div className="rounded-2xl border  border-slate-100  bg-white shadow-sm">

          <div className="border-b  border-slate-300   p-5">

            <h2 className="text-lg font-semibold">
              Vehicle Loads
            </h2>

            <p className="text-sm text-gray-500">
              Stock loaded during this trip.
            </p>

          </div>


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

                  <th className="p-3 text-right">
                    Items
                  </th>

                  <th className="p-3 text-right">
                    Quantity
                  </th>

                  <th className="p-3 text-right">
                    Value
                  </th>

                  <th className="p-3 text-center">
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {loads.length === 0 && (

                  <tr>

                    <td
                      colSpan={6}
                      className="p-8 text-center text-gray-500"
                    >
                      No loads found.
                    </td>

                  </tr>

                )}


                {loads.map(
                  (load: any) => (

                    <tr
                      key={load.loadId}
                      className="border-t  border-slate-300   hover:bg-blue-50"
                    >

                      <td className="p-3">
                        {formatDate(
                          load.createdAt
                        )}
                      </td>


                      <td className="p-3">

                        <Link
                          href={`/admin/distribution/vehicle-loads/${encodeURIComponent(
                            load.loadId
                          )}`}
                          className="
                            font-medium
                            text-blue-600
                            hover:underline
                          "
                        >
                          {load.loadNo ||
                            load.loadId}
                        </Link>

                      </td>


                      <td className="p-3 text-right">
                        {load.totalItems}
                      </td>


                      <td className="p-3 text-right">
                        {load.totalQuantity}
                      </td>


                      <td className="p-3 text-right">
                        {formatMoney(
                          load.totalValue
                        )}
                      </td>


                      <td className="p-3 text-center">

                        <span
                          className="
                            rounded-full
                            bg-blue-100
                            px-3
                            py-1
                            text-xs
                            text-blue-700
                          "
                        >
                          {load.status}
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* ===================================== */}
        {/* SALES */}
        {/* ===================================== */}

        <div className="rounded-2xl border  border-slate-100  bg-white shadow-sm">

          <div className="border-b  border-slate-300   p-5">

            <h2 className="text-lg font-semibold">
              Truck Sales
            </h2>

            <p className="text-sm text-gray-500">
              Sales made during this trip.
            </p>

          </div>


          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-zinc-100">

                <tr>

                  <th className="p-3 text-left">
                    Date
                  </th>

                  <th className="p-3 text-left">
                    Sale
                  </th>

                  <th className="p-3 text-left">
                    Customer
                  </th>

                  <th className="p-3 text-right">
                    Quantity
                  </th>

                  <th className="p-3 text-right">
                    Amount
                  </th>

                  <th className="p-3 text-right">
                    Paid
                  </th>

                  <th className="p-3 text-right">
                    Due
                  </th>

                  <th className="p-3 text-center">
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {sales.length === 0 && (

                  <tr>

                    <td
                      colSpan={8}
                      className="p-8 text-center text-gray-500"
                    >
                      No sales found.
                    </td>

                  </tr>

                )}


                {sales.map(
                  (sale: any) => (

                    <tr
                      key={sale.saleId}
                      className="border-t  border-slate-300   hover:bg-blue-50"
                    >

                      <td className="p-3">
                        {formatDate(
                          sale.createdAt
                        )}
                      </td>


                      <td className="p-3">

                        <Link
                          href={`/admin/distribution/truck-sales/${encodeURIComponent(
                            sale.saleId
                          )}`}
                          className="
                            font-medium
                            text-blue-600
                            hover:underline
                          "
                        >
                          {sale.saleNo}
                        </Link>

                      </td>


                      <td className="p-3">
                        {sale.customerName ||
                          "-"}
                      </td>


                      <td className="p-3 text-right">
                        {sale.totalQuantity}
                      </td>


                      <td className="p-3 text-right font-medium">
                        {formatMoney(
                          sale.totalAmount
                        )}
                      </td>


                      <td className="p-3 text-right">
                        {formatMoney(
                          sale.paidAmount
                        )}
                      </td>


                      <td className="p-3 text-right">
                        {formatMoney(
                          sale.dueAmount
                        )}
                      </td>


                      <td className="p-3 text-center">

                        <span
                          className="
                            rounded-full
                            bg-green-100
                            px-3
                            py-1
                            text-xs
                            text-green-700
                          "
                        >
                          {sale.paymentStatus}
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* ===================================== */}
        {/* REMARKS */}
        {/* ===================================== */}

        {trip.remarks && (

          <div className="rounded-xl border  border-slate-100  bg-white p-5">

            <h2 className="font-semibold">
              Remarks
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              {trip.remarks}
            </p>

          </div>

        )}

      </div>

    </div>
  );
}


/* ================================================= */
/* SUMMARY CARD */
/* ================================================= */

function SummaryCard({
  title,
  value,
  subValue,
}: {
  title: string;
  value: string;
  subValue?: string;
}) {

  return (

    <div className="rounded-2xl border  border-slate-100  border-slate-100 bg-white p-5 shadow-sm">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-xl font-bold">
        {value}
      </p>

      {subValue && (
        <p className="mt-1 text-xs text-gray-500">
          {subValue}
        </p>
      )}

    </div>
  );
}