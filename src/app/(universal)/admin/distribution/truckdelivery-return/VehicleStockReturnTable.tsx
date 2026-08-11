"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";

import {
  getVehicleStockReturns,
} from "@/app/(universal)/action/distribution/returnStock/getVehicleStockReturns";

import { VehicleType } from "@/lib/types/distribution/VehicleType";

type ReturnRow = {
  id: string;
  returnId: string;

  returnType: string;

  tripId: string;
  tripNo: string;

  customerId: string;
  customerName: string;

  vehicleId: string;
  vehicleName: string;

  locationCode: string;

  salesmanId: string;
  salesmanName: string;

  productId: string;
  productName: string;

  quantity: number;

  wholesalePrice: number;

  returnValue: number;

  reason: string;
  remarks: string;

  createdAt: string | null;
};

type Props = {
  vehicles: VehicleType[];
};

export default function VehicleStockReturnTable({
  vehicles,
}: Props) {

  // ===================================================
  // STATE
  // ===================================================

  const [returns, setReturns] =
    useState<ReturnRow[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [date, setDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [returnType, setReturnType] =
    useState("ALL");

  const [vehicleId, setVehicleId] =
    useState("ALL");

  const [search, setSearch] =
    useState("");

  // ===================================================
  // LOAD
  // ===================================================

  const loadReturns =
    async () => {

      setLoading(true);

      try {

        const result =
          await getVehicleStockReturns({
            date,
            returnType,
            vehicleId,
          });

        if (!result.success) {
          setReturns([]);

          return;
        }

        setReturns(
          result.data as ReturnRow[]
        );

      } catch (error) {

        console.error(
          error
        );

        setReturns([]);

      } finally {

        setLoading(false);

      }
    };

  // ===================================================
  // LOAD WHEN FILTER CHANGES
  // ===================================================

  useEffect(() => {
    loadReturns();
  }, [
    date,
    returnType,
    vehicleId,
  ]);

  // ===================================================
  // SEARCH
  // ===================================================

  const filteredReturns =
    useMemo(() => {

      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return returns;
      }

      return returns.filter(
        (item) =>
          item.productName
            ?.toLowerCase()
            .includes(value) ||

          item.customerName
            ?.toLowerCase()
            .includes(value) ||

          item.vehicleName
            ?.toLowerCase()
            .includes(value) ||

          item.salesmanName
            ?.toLowerCase()
            .includes(value) ||

          item.tripNo
            ?.toLowerCase()
            .includes(value)
      );

    }, [
      returns,
      search,
    ]);

  // ===================================================
  // TOTALS
  // ===================================================

  const totalQuantity =
    filteredReturns.reduce(
      (sum, item) =>
        sum +
        item.quantity,
      0
    );

  const totalValue =
    filteredReturns.reduce(
      (sum, item) =>
        sum +
        item.returnValue,
      0
    );

  // ===================================================
  // RETURN TYPE LABEL
  // ===================================================

  const getReturnTypeLabel =
    (type: string) => {

      switch (type) {

        case "CUSTOMER_RETURN":
          return "Customer Return";

        case "UNSOLD_RETURN":
          return "Unsold Return";

        case "SPOILED":
          return "Spoiled";

        case "DAMAGED":
          return "Damaged";

        default:
          return type;
      }
    };

  // ===================================================
  // DATE FORMAT
  // ===================================================

  const formatDate =
    (value: string | null) => {

      if (!value) {
        return "-";
      }

      return new Date(
        value
      ).toLocaleString(
        "en-IN"
      );
    };

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="w-full space-y-4">

      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="rounded-xl border bg-white p-4 shadow-sm">

        <div className="flex flex-wrap items-end gap-4">

          {/* DATE */}

          <div className="flex flex-col">

            <label className="mb-1 text-xs text-gray-500">
              Date
            </label>

            <Input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(
                  e.target.value
                )
              }
              className="h-9 w-40"
            />

          </div>

          {/* RETURN TYPE */}

          <div className="flex flex-col">

            <label className="mb-1 text-xs text-gray-500">
              Return Type
            </label>

            <select
              value={returnType}
              onChange={(e) =>
                setReturnType(
                  e.target.value
                )
              }
              className="h-9 w-44 rounded border px-2 text-sm"
            >

              <option value="ALL">
                All Returns
              </option>

              <option value="CUSTOMER_RETURN">
                Customer Return
              </option>

              <option value="UNSOLD_RETURN">
                Unsold Return
              </option>

              <option value="SPOILED">
                Spoiled
              </option>

              <option value="DAMAGED">
                Damaged
              </option>

            </select>

          </div>

          {/* VEHICLE */}

          <div className="flex flex-col">

            <label className="mb-1 text-xs text-gray-500">
              Vehicle
            </label>

            <select
              value={vehicleId}
              onChange={(e) =>
                setVehicleId(
                  e.target.value
                )
              }
              className="h-9 w-44 rounded border px-2 text-sm"
            >

              <option value="ALL">
                All Vehicles
              </option>

              {vehicles.map(
                (vehicle) => (
                  <option
                    key={vehicle.id}
                    value={vehicle.id}
                  >
                    {vehicle.name}
                  </option>
                )
              )}

            </select>

          </div>

          {/* SEARCH */}

          <div className="relative flex flex-col">

            <label className="mb-1 text-xs text-gray-500">
              Search
            </label>

            <Search
              size={14}
              className="absolute right-2 top-[29px] text-gray-400"
            />

            <Input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Product, customer, trip..."
              className="h-9 w-60 pr-7"
            />

          </div>

        </div>

      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-xl border bg-white p-4 shadow-sm">

          <div className="text-xs text-gray-500">
            Returns
          </div>

          <div className="text-2xl font-bold">
            {filteredReturns.length}
          </div>

        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">

          <div className="text-xs text-gray-500">
            Return Quantity
          </div>

          <div className="text-2xl font-bold">
            {totalQuantity}
          </div>

        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">

          <div className="text-xs text-gray-500">
            Return Value
          </div>

          <div className="text-2xl font-bold">
            ₹{totalValue.toFixed(2)}
          </div>

        </div>

      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="rounded-xl border bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-zinc-200">

              <tr>

                <th className="p-3 text-left">
                  Date
                </th>

                <th className="p-3 text-left">
                  Return Type
                </th>

                <th className="p-3 text-left">
                  Product
                </th>

                <th className="p-3 text-left">
                  Customer
                </th>

                <th className="p-3 text-left">
                  Vehicle
                </th>

                <th className="p-3 text-left">
                  Salesman
                </th>

                <th className="p-3 text-left">
                  Trip
                </th>

                <th className="p-3 text-center">
                  Qty
                </th>

                <th className="p-3 text-right">
                  Price
                </th>

                <th className="p-3 text-right">
                  Value
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan={10}
                    className="py-10 text-center"
                  >

                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />

                  </td>

                </tr>

              ) : filteredReturns.length ===
                0 ? (

                <tr>

                  <td
                    colSpan={10}
                    className="py-10 text-center text-gray-500"
                  >
                    No return records found.
                  </td>

                </tr>

              ) : (

                filteredReturns.map(
                  (item, index) => (

                    <tr
                      key={item.id}
                      className={
                        index % 2 === 0
                          ? "bg-zinc-50"
                          : "bg-white"
                      }
                    >

                      <td className="p-3 text-sm">
                        {formatDate(
                          item.createdAt
                        )}
                      </td>

                      <td className="p-3 text-sm font-medium">
                        {getReturnTypeLabel(
                          item.returnType
                        )}
                      </td>

                      <td className="p-3 text-sm font-medium">
                        {item.productName}
                      </td>

                      <td className="p-3 text-sm">
                        {item.customerName ||
                          "-"}
                      </td>

                      <td className="p-3 text-sm">
                        {item.vehicleName}
                      </td>

                      <td className="p-3 text-sm">
                        {item.salesmanName}
                      </td>

                      <td className="p-3 text-sm">
                        {item.tripNo}
                      </td>

                      <td className="p-3 text-center font-semibold">
                        {item.quantity}
                      </td>

                      <td className="p-3 text-right">
                        ₹
                        {item.wholesalePrice.toFixed(
                          2
                        )}
                      </td>

                      <td className="p-3 text-right font-semibold">
                        ₹
                        {item.returnValue.toFixed(
                          2
                        )}
                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}