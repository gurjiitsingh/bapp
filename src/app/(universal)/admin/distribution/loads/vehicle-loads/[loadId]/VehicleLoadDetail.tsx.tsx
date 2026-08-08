"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Truck,
  User,
  MapPin,
  Route,
  Package,
  CalendarDays,
  FileText,
} from "lucide-react";

type LoadItem = {
  id: string;
  loadId: string;
  tripId: string;

  productId: string;
  productName: string;

  quantity: number;

  costPerUnit: number;
  lineValue: number;

  sellingPrice: number;
  wholesalePrice: number;
};

type LoadData = {
  id: string;

  loadId?: string;
  loadNo?: string;

  tripId?: string;
  tripNo?: string;

  vehicleId?: string;
  vehicleName?: string;

  driverId?: string;
  driverName?: string;

  routeId?: string;
  routeName?: string;

  locationCode?: string;
  responsiblePerson?: string;

  totalItems?: number;
  totalQuantity?: number;
  totalValue?: number;

  status?: string;

  remarks?: string;
  createdBy?: string;

  businessDate?: string;
  createdAt?: Date;
};

type Props = {
  data: {
    load: LoadData;
    items: LoadItem[];
  };
};

export default function VehicleLoadDetail({
  data,
}: Props) {
  const { load, items } = data;

  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalCost = items.reduce(
    (sum, item) => sum + item.lineValue,
    0
  );

  const potentialWholesaleValue = items.reduce(
    (sum, item) =>
      sum + item.quantity * item.wholesalePrice,
    0
  );

  const potentialGrossProfit =
    potentialWholesaleValue - totalCost;

  function formatMoney(value: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatDate(date?: Date) {
    if (!date) return "-";

    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  function statusClass(status?: string) {
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
    <div className="mx-auto w-full max-w-[1600px] space-y-6">

      {/* ================================================= */}
      {/* BACK */}
      {/* ================================================= */}

      <Link
        href="/admin/distribution/loads/vehicle-loads"
        className="
          inline-flex
          items-center
          gap-2
          text-sm
          text-gray-600
          hover:text-blue-600
        "
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Vehicle Loads
      </Link>

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-4 border-b border-slate-200 p-6 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <Truck className="h-7 w-7 text-blue-600" />

              <div>

                <h1 className="text-2xl font-semibold">
                  {load.loadNo || load.loadId}
                </h1>

                <p className="text-sm text-gray-500">
                  Vehicle Load Detail
                </p>

              </div>

            </div>

          </div>

          <span
            className={`
              inline-flex
              w-fit
              rounded-full
              px-4
              py-2
              text-sm
              font-medium
              ${statusClass(load.status)}
            `}
          >
            {load.status || "LOADED"}
          </span>

        </div>

        {/* ================================================= */}
        {/* LOAD INFORMATION */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2 lg:grid-cols-4">

          {/* Trip */}

          <InfoCard
            icon={<Route className="h-4 w-4" />}
            label="Trip"
            value={load.tripNo || load.tripId || "-"}
          />

          {/* Vehicle */}

          <InfoCard
            icon={<Truck className="h-4 w-4" />}
            label="Vehicle"
            value={load.vehicleName || "-"}
            subValue={
              load.locationCode ||
              load.vehicleId
            }
          />

          {/* Driver */}

          <InfoCard
            icon={<User className="h-4 w-4" />}
            label="Driver"
            value={
              load.driverName ||
              load.responsiblePerson ||
              "-"
            }
          />

          {/* Route */}

          <InfoCard
            icon={<MapPin className="h-4 w-4" />}
            label="Route"
            value={load.routeName || "-"}
          />

          {/* Load Date */}

          <InfoCard
            icon={<CalendarDays className="h-4 w-4" />}
            label="Loaded At"
            value={formatDate(load.createdAt)}
          />

          {/* Business Date */}

          <InfoCard
            icon={<CalendarDays className="h-4 w-4" />}
            label="Business Date"
            value={load.businessDate || "-"}
          />

          {/* Created By */}

          <InfoCard
            icon={<User className="h-4 w-4" />}
            label="Created By"
            value={load.createdBy || "-"}
          />

          {/* Responsible */}

          <InfoCard
            icon={<User className="h-4 w-4" />}
            label="Responsible"
            value={load.responsiblePerson || "-"}
          />

        </div>

      </div>

      {/* ================================================= */}
      {/* SUMMARY */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

        <SummaryCard
          label="Products"
          value={String(
            load.totalItems ??
              new Set(
                items.map((x) => x.productId)
              ).size
          )}
        />

        <SummaryCard
          label="Total Quantity"
          value={`${totalQuantity}`}
        />

        <SummaryCard
          label="Load Cost"
          value={formatMoney(totalCost)}
        />

        <SummaryCard
          label="Potential Gross Profit"
          value={formatMoney(
            potentialGrossProfit
          )}
        />

      </div>

      {/* ================================================= */}
      {/* ITEMS */}
      {/* ================================================= */}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-4">

          <div className="flex items-center gap-2">

            <Package className="h-5 w-5 text-blue-600" />

            <div>

              <h2 className="font-semibold">
                Loaded Products
              </h2>

              <p className="text-sm text-gray-500">
                Products transferred from factory
                to this vehicle.
              </p>

            </div>

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-zinc-100">

              <tr>

                <th className="p-3 text-left">
                  Product
                </th>

                <th className="p-3 text-right">
                  Quantity
                </th>

                <th className="p-3 text-right">
                  Cost / Unit
                </th>

                <th className="p-3 text-right">
                  Cost Value
                </th>

                <th className="p-3 text-right">
                  Wholesale Price
                </th>

                <th className="p-3 text-right">
                  Potential Sales
                </th>

                <th className="p-3 text-right">
                  Potential Profit
                </th>

              </tr>

            </thead>

            <tbody>

              {items.length === 0 ? (

                <tr>

                  <td
                    colSpan={7}
                    className="p-10 text-center text-gray-500"
                  >
                    No products found in this load.
                  </td>

                </tr>

              ) : (

                items.map((item) => {

                  const salesValue =
                    item.quantity *
                    item.wholesalePrice;

                  const profit =
                    salesValue -
                    item.lineValue;

                  return (
                    <tr
                      key={item.id}
                      className="
                        border-t
                        border-slate-200
                        hover:bg-blue-50
                      "
                    >

                      <td className="  px-2">

                        <div className="font-medium">
                          {item.productName}
                        </div>

                        {/* <div className="text-xs text-gray-500">
                          {item.productId}
                        </div> */}

                      </td>

                      <td className="p-3 text-right font-medium">
                        {item.quantity}
                      </td>

                      <td className="p-3 text-right">
                        {formatMoney(
                          item.costPerUnit
                        )}
                      </td>

                      <td className="p-3 text-right font-medium">
                        {formatMoney(
                          item.lineValue
                        )}
                      </td>

                      <td className="p-3 text-right">
                        {formatMoney(
                          item.wholesalePrice
                        )}
                      </td>

                      <td className="p-3 text-right">
                        {formatMoney(
                          salesValue
                        )}
                      </td>

                      <td
                        className={`
                          p-3
                          text-right
                          font-medium
                          ${
                            profit >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        `}
                      >
                        {formatMoney(profit)}
                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

            {/* TOTAL */}

            {items.length > 0 && (

              <tfoot className="border-t border-slate-200 bg-zinc-50">

                <tr>

                  <td className="p-3 font-semibold">
                    Total
                  </td>

                  <td className="p-3 text-right font-semibold">
                    {totalQuantity}
                  </td>

                  <td />

                  <td className="p-3 text-right font-semibold">
                    {formatMoney(totalCost)}
                  </td>

                  <td />

                  <td className="p-3 text-right font-semibold">
                    {formatMoney(
                      potentialWholesaleValue
                    )}
                  </td>

                  <td className="p-3 text-right font-semibold text-green-600">
                    {formatMoney(
                      potentialGrossProfit
                    )}
                  </td>

                </tr>

              </tfoot>

            )}

          </table>

        </div>

      </div>

      {/* ================================================= */}
      {/* REMARKS */}
      {/* ================================================= */}

      {load.remarks && (

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-start gap-3 p-6">

            <FileText className="mt-0.5 h-5 w-5 text-gray-500" />

            <div>

              <h3 className="font-semibold">
                Remarks
              </h3>

              <p className="mt-1 text-sm text-gray-600">
                {load.remarks}
              </p>

            </div>

          </div>

        </div>

      )}

      {/* ================================================= */}
      {/* FUTURE TRIP RECONCILIATION */}
      {/* ================================================= */}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-4">

          <h2 className="font-semibold">
            Trip Reconciliation
          </h2>

          <p className="text-sm text-gray-500">
            Sales, returns, remaining stock and
            customer collections will appear here.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-4">

          <ReconciliationCard
            label="Sold"
            value="—"
          />

          <ReconciliationCard
            label="Returned"
            value="—"
          />

          <ReconciliationCard
            label="Remaining"
            value="—"
          />

          <ReconciliationCard
            label="Cash Collected"
            value="—"
          />

        </div>

      </div>

    </div>
  );
}

/* ================================================= */
/* INFO CARD */
/* ================================================= */

function InfoCard({
  icon,
  label,
  value,
  subValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-zinc-50 p-4">

      <div className="flex items-center gap-2 text-xs text-gray-500">
        {icon}
        {label}
      </div>

      <div className="mt-2 font-medium">
        {value}
      </div>

      {subValue && (
        <div className="mt-1 text-xs text-gray-500">
          {subValue}
        </div>
      )}

    </div>
  );
}

/* ================================================= */
/* SUMMARY CARD */
/* ================================================= */

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold">
        {value}
      </p>

    </div>
  );
}

/* ================================================= */
/* RECONCILIATION CARD */
/* ================================================= */

function ReconciliationCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-zinc-50 p-4">

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold">
        {value}
      </p>

    </div>
  );
}