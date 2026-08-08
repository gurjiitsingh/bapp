"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTruckSaleReports } from "@/app/(universal)/action/distribution/sale/getTruckSaleReports";

 

type TruckSaleReport = {
  saleId: string;
  tripId: string;

  vehicleId: string;
  vehicleName: string;

  locationCode?: string;
  responsiblePerson?: string;

  wholeSaleCutomerId: string;
  wholeSaleCutomerName: string;

  totalAmount: number;
  totalItems: number;
  totalQuantity: number;

  paidAmount: number;
  dueAmount: number;

  paymentStatus: "PAID" | "PARTIAL" | "CREDIT";
  paymentMethod?: string;

  remarks?: string;
  createdBy?: string;

  status?: string;
  createdAt?: Date;
};

export default function VehicleSaleReportTable() {
  const [sales, setSales] = useState<TruckSaleReport[]>([]);
  const [loading, setLoading] = useState(false);

  const [paymentStatus, setPaymentStatus] =
    useState("ALL");

  const [search, setSearch] =
    useState("");

  // =====================================================
  // LOAD REPORT
  // =====================================================

  async function loadReports() {
    setLoading(true);

    try {
      const result = await getTruckSaleReports({
        paymentStatus,
        limit: 100,
      });

      if (!result.success) {
        console.error(result.message);

        setSales([]);
        return;
      }

      setSales(result.data as TruckSaleReportType[]);
    } catch (error) {
      console.error(
        "❌ Failed to load truck sales:",
        error
      );

      setSales([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, [paymentStatus]);

  // =====================================================
  // DATE
  // =====================================================

  function formatDate(date?: Date) {
    if (!date) return "-";

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(new Date(date));
  }

  // =====================================================
  // MONEY
  // =====================================================

  function formatMoney(value: number) {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    ).format(Number(value || 0));
  }

  // =====================================================
  // STATUS CLASS
  // =====================================================

  function getPaymentStatusClass(
    status: string
  ) {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700";

      case "PARTIAL":
        return "bg-yellow-100 text-yellow-700";

      case "CREDIT":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredSales = sales.filter((sale) => {
    const value =
      search.trim().toLowerCase();

    if (!value) return true;

    return (
      sale.saleId
        ?.toLowerCase()
        .includes(value) ||

      sale.tripId
        ?.toLowerCase()
        .includes(value) ||

      sale.vehicleName
        ?.toLowerCase()
        .includes(value) ||

      sale.locationCode
        ?.toLowerCase()
        .includes(value) ||

      sale.wholeSaleCutomerName
        ?.toLowerCase()
        .includes(value)
    );
  });

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalSales =
    filteredSales.reduce(
      (sum, sale) =>
        sum + Number(sale.totalAmount || 0),
      0
    );

  const totalPaid =
    filteredSales.reduce(
      (sum, sale) =>
        sum + Number(sale.paidAmount || 0),
      0
    );

  const totalDue =
    filteredSales.reduce(
      (sum, sale) =>
        sum + Number(sale.dueAmount || 0),
      0
    );

  const totalQuantity =
    filteredSales.reduce(
      (sum, sale) =>
        sum + Number(sale.totalQuantity || 0),
      0
    );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-5">

      {/* ============================================== */}
      {/* FILTERS */}
      {/* ============================================== */}

      <div className="rounded-xl border bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* SEARCH */}

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search sale, trip, vehicle, customer..."
            className="
              h-10
              w-full
              rounded-md
              border
              border-gray-300
              px-3
              text-sm
              outline-none
              focus:border-blue-500
              lg:w-[420px]
            "
          />

          {/* STATUS */}

          <select
            value={paymentStatus}
            onChange={(e) =>
              setPaymentStatus(e.target.value)
            }
            className="
              h-10
              rounded-md
              border
              border-gray-300
              bg-white
              px-3
              text-sm
            "
          >
            <option value="ALL">
              All Payment Status
            </option>

            <option value="PAID">
              Paid
            </option>

            <option value="PARTIAL">
              Partial
            </option>

            <option value="CREDIT">
              Credit
            </option>
          </select>

        </div>

      </div>


      {/* ============================================== */}
      {/* SUMMARY */}
      {/* ============================================== */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">
            Sales
          </p>

          <p className="mt-1 text-xl font-semibold">
            {filteredSales.length}
          </p>
        </div>


        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">
            Quantity
          </p>

          <p className="mt-1 text-xl font-semibold">
            {totalQuantity}
          </p>
        </div>


        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">
            Total Sales
          </p>

          <p className="mt-1 text-xl font-semibold">
            {formatMoney(totalSales)}
          </p>
        </div>


        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">
            Outstanding
          </p>

          <p className="mt-1 text-xl font-semibold text-red-600">
            {formatMoney(totalDue)}
          </p>
        </div>

      </div>


      {/* ============================================== */}
      {/* TABLE */}
      {/* ============================================== */}

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1250px] text-sm">

            <thead className="bg-zinc-100">

              <tr>

                <th className="p-3 text-left">
                  Date
                </th>

                <th className="p-3 text-left">
                  Sale
                </th>

                <th className="p-3 text-left">
                  Trip
                </th>

                <th className="p-3 text-left">
                  Vehicle
                </th>

                <th className="p-3 text-left">
                  Customer
                </th>

                <th className="p-3 text-right">
                  Items
                </th>

                <th className="p-3 text-right">
                  Quantity
                </th>

                <th className="p-3 text-right">
                  Total
                </th>

                <th className="p-3 text-right">
                  Paid
                </th>

                <th className="p-3 text-right">
                  Due
                </th>

                <th className="p-3 text-center">
                  Payment
                </th>

              </tr>

            </thead>


            <tbody>

              {/* ====================================== */}
              {/* LOADING */}
              {/* ====================================== */}

              {loading && (
                <tr>

                  <td
                    colSpan={11}
                    className="p-10 text-center text-gray-500"
                  >
                    Loading truck sales...
                  </td>

                </tr>
              )}


              {/* ====================================== */}
              {/* EMPTY */}
              {/* ====================================== */}

              {!loading &&
                filteredSales.length === 0 && (
                  <tr>

                    <td
                      colSpan={11}
                      className="p-10 text-center text-gray-500"
                    >
                      No truck sales found.
                    </td>

                  </tr>
                )}


              {/* ====================================== */}
              {/* DATA */}
              {/* ====================================== */}

              {!loading &&
                filteredSales.map((sale) => (

                  <tr
                    key={sale.saleId}
                    className="
                      border-t
                      transition-colors
                      hover:bg-blue-50
                    "
                  >

                    {/* DATE */}

                    <td className="whitespace-nowrap p-3">
                      {formatDate(
                        sale.createdAt
                      )}
                    </td>


                    {/* SALE */}

                    <td className="p-3">

                      <Link
                        href={`/admin/distribution/truck-sales/${encodeURIComponent(
                          sale.saleId
                        )}`}
                        className="
                          font-medium
                          text-blue-600
                          hover:text-blue-800
                          hover:underline
                        "
                      >
                        {sale.saleId}
                      </Link>

                    </td>


                    {/* TRIP */}

                    <td className="p-3">

                      {sale.tripId ? (
                        <Link
                          href={`/admin/distribution/trips/${encodeURIComponent(
                            sale.tripId
                          )}`}
                          className="
                            text-gray-700
                            hover:text-blue-600
                            hover:underline
                          "
                        >
                          {sale.tripId}
                        </Link>
                      ) : (
                        "-"
                      )}

                    </td>


                    {/* VEHICLE */}

                    <td className="p-3">

                      <div className="font-medium">
                        {sale.vehicleName || "-"}
                      </div>

                      {sale.locationCode && (
                        <div className="text-xs text-gray-500">
                          {sale.locationCode}
                        </div>
                      )}

                    </td>


                    {/* CUSTOMER */}

                    <td className="p-3">

                      <div className="font-medium">
                        {sale.wholeSaleCutomerName ||
                          "-"}
                      </div>

                      {sale.wholeSaleCutomerId && (
                        <div className="text-xs text-gray-500">
                          {sale.wholeSaleCutomerId}
                        </div>
                      )}

                    </td>


                    {/* ITEMS */}

                    <td className="p-3 text-right">
                      {sale.totalItems}
                    </td>


                    {/* QUANTITY */}

                    <td className="p-3 text-right font-medium">
                      {sale.totalQuantity}
                    </td>


                    {/* TOTAL */}

                    <td className="p-3 text-right font-medium">
                      {formatMoney(
                        sale.totalAmount
                      )}
                    </td>


                    {/* PAID */}

                    <td className="p-3 text-right text-green-700">
                      {formatMoney(
                        sale.paidAmount
                      )}
                    </td>


                    {/* DUE */}

                    <td className="p-3 text-right text-red-600">
                      {formatMoney(
                        sale.dueAmount
                      )}
                    </td>


                    {/* PAYMENT STATUS */}

                    <td className="p-3 text-center">

                      <span
                        className={`
                          inline-flex
                          rounded-full
                          px-3
                          py-1
                          text-xs
                          font-medium
                          ${getPaymentStatusClass(
                            sale.paymentStatus
                          )}
                        `}
                      >
                        {sale.paymentStatus}
                      </span>

                      {sale.paymentMethod && (
                        <div className="mt-1 text-xs text-gray-500">
                          {sale.paymentMethod}
                        </div>
                      )}

                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>

      </div>


      {/* ============================================== */}
      {/* FOOTER SUMMARY */}
      {/* ============================================== */}

      {!loading &&
        filteredSales.length > 0 && (

          <div className="
            flex
            flex-wrap
            justify-end
            gap-x-8
            gap-y-2
            rounded-xl
            border
            bg-white
            p-4
            text-sm
          ">

            <div>
              <span className="text-gray-500">
                Total:
              </span>{" "}
              <strong>
                {formatMoney(totalSales)}
              </strong>
            </div>

            <div>
              <span className="text-gray-500">
                Paid:
              </span>{" "}
              <strong className="text-green-700">
                {formatMoney(totalPaid)}
              </strong>
            </div>

            <div>
              <span className="text-gray-500">
                Due:
              </span>{" "}
              <strong className="text-red-600">
                {formatMoney(totalDue)}
              </strong>
            </div>

          </div>

        )}

    </div>
  );
}