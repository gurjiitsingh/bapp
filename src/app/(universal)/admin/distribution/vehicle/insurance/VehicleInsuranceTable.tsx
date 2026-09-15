"use client";

import React from "react";
import Link from "next/link";
import { VehicleInsuranceListItem } from "@/lib/types/distribution/vehicle/insurance/VehicleInsuranceListItem";

type VehicleInsuranceTableProps = {
  insurances: VehicleInsuranceListItem[];
};

function formatDate(timestamp: number) {
  if (!timestamp) return "-";

  return new Date(timestamp).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatus(endDate: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryDate = new Date(endDate);
  expiryDate.setHours(0, 0, 0, 0);

  if (expiryDate < today) {
    return "EXPIRED";
  }

  const diff =
    expiryDate.getTime() - today.getTime();

  const days = Math.ceil(
    diff / (1000 * 60 * 60 * 24)
  );

  if (days <= 30) {
    return "EXPIRING SOON";
  }

  return "ACTIVE";
}

export default function VehicleInsuranceTable({
  insurances,
}: VehicleInsuranceTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">
              Vehicle
            </th>

            <th className="px-4 py-3 text-left font-semibold">
              Insurance Company
            </th>

            <th className="px-4 py-3 text-left font-semibold">
              Policy Number
            </th>

            <th className="px-4 py-3 text-left font-semibold">
              Type
            </th>

            <th className="px-4 py-3 text-left font-semibold">
              Start Date
            </th>

            <th className="px-4 py-3 text-left font-semibold">
              End Date
            </th>

            <th className="px-4 py-3 text-left font-semibold">
              Renew Date
            </th>

            <th className="px-4 py-3 text-right font-semibold">
              Premium
            </th>

            <th className="px-4 py-3 text-left font-semibold">
              Status
            </th>

            <th className="px-4 py-3 text-right font-semibold">
              Action
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {insurances.length === 0 ? (
            <tr>
              <td
                colSpan={10}
                className="px-4 py-10 text-center text-gray-500"
              >
                No vehicle insurance records found.
              </td>
            </tr>
          ) : (
            insurances.map((insurance) => {
              const status = getStatus(
                insurance.endDate
              );

              return (
                <tr
                  key={insurance.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-4">
                    <div className="font-medium">
                      {insurance.vehicleNumber ||
                        insurance.locationCode}
                    </div>

                    {insurance.vehicleName && (
                      <div className="text-xs text-gray-500">
                        {insurance.vehicleName}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {insurance.insuranceCompany}
                  </td>

                  <td className="px-4 py-4">
                    {insurance.policyNumber}
                  </td>

                  <td className="px-4 py-4">
                    {insurance.insuranceType}
                  </td>

                  <td className="px-4 py-4">
                    {formatDate(
                      insurance.startDate
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {formatDate(
                      insurance.endDate
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {formatDate(
                      insurance.renewDate
                    )}
                  </td>

                  <td className="px-4 py-4 text-right">
                    ₹
                    {insurance.premiumAmount.toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : status === "EXPIRING SOON"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {status}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/distribution/vehicle/insurance/${insurance.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}