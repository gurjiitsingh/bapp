import Link from "next/link";

import {
  getFaults,
} from "@/app/(universal)/action/maintenance/faultActions";

import type {
  FaultPriority,
  FaultStatus,
} from "@/lib/maintenance/faultTypes";

function getPriorityClass(
  priority: FaultPriority
) {
  switch (priority) {
    case "LOW":
      return "bg-gray-100 text-gray-700";

    case "MEDIUM":
      return "bg-blue-100 text-blue-700";

    case "HIGH":
      return "bg-orange-100 text-orange-700";

    case "CRITICAL":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getStatusClass(
  status: FaultStatus
) {
  switch (status) {
    case "OPEN":
      return "bg-red-100 text-red-700";

    case "ASSIGNED":
      return "bg-blue-100 text-blue-700";

    case "IN_PROGRESS":
      return "bg-yellow-100 text-yellow-700";

    case "RESOLVED":
      return "bg-green-100 text-green-700";

    case "CLOSED":
      return "bg-gray-100 text-gray-700";

    case "CANCELLED":
      return "bg-gray-100 text-gray-500";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatDate(
  date: string | null
) {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

export default async function FaultsPage() {
  const faults =
    await getFaults();

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>

          <h1 className="text-2xl font-semibold">
            Machine Faults
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor and manage machine maintenance faults.
          </p>

        </div>

        <Link
          href="/admin/maintenance/faults/new"
          className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          + Report Fault
        </Link>

      </div>

      {/* =====================================================
          TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-lg border bg-white">

        {faults.length === 0 ? (

          <div className="p-10 text-center">

            <div className="text-4xl">
              🔧
            </div>

            <h2 className="mt-3 text-lg font-semibold">
              No faults reported
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Machine fault reports will appear here.
            </p>

            <Link
              href="/admin/maintenance/faults/new"
              className="mt-5 inline-block rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white"
            >
              Report Fault
            </Link>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px]">

              <thead>

                <tr className="border-b bg-gray-50 text-left text-sm">

                  <th className="px-5 py-4 font-semibold">
                    Ticket
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Machine
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Fault
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Priority
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Reported By
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Reported At
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {faults.map(
                  (fault) => (

                    <tr
                      key={fault.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >

                      {/* TICKET */}

                      <td className="px-5 py-4">

                        <div className="text-sm font-semibold">
                          {fault.ticketNumber}
                        </div>

                      </td>

                      {/* MACHINE */}

                      <td className="px-5 py-4">

                        <div className="text-sm font-medium">
                          {fault.machineName}
                        </div>

                        <div className="text-xs text-gray-500">
                          {fault.machineCode || "-"}
                        </div>

                      </td>

                      {/* FAULT */}

                      <td className="max-w-[280px] px-5 py-4">

                        <div className="truncate text-sm font-medium">
                          {fault.faultTitle}
                        </div>

                        <div className="truncate text-xs text-gray-500">
                          {fault.faultDescription}
                        </div>

                      </td>

                      {/* PRIORITY */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getPriorityClass(
                            fault.priority
                          )}`}
                        >
                          {fault.priority}
                        </span>

                      </td>

                      {/* REPORTED BY */}

                      <td className="px-5 py-4 text-sm">
                        {fault.reportedByName ||
                          fault.reportedBy ||
                          "-"}
                      </td>

                      {/* DATE */}

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDate(
                          fault.reportedAt
                        )}
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                            fault.status
                          )}`}
                        >
                          {fault.status}
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}