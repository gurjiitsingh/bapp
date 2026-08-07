import { getMachines } from "@/app/(universal)/action/maintenance/machineActions";
import { MachineStatus } from "@/lib/maintenance/machineTypes";
import Link from "next/link";





function getStatusLabel(status: MachineStatus) {
  switch (status) {
    case "ACTIVE":
      return "Active";

    case "UNDER_MAINTENANCE":
      return "Under Maintenance";

    case "BREAKDOWN":
      return "Breakdown";

    case "INACTIVE":
      return "Inactive";

    default:
      return status;
  }
}

function getStatusClass(status: MachineStatus) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-700";

    case "UNDER_MAINTENANCE":
      return "bg-yellow-100 text-yellow-700";

    case "BREAKDOWN":
      return "bg-red-100 text-red-700";

    case "INACTIVE":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default async function MachinesPage() {
  const machines = await getMachines();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            Machines
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage machines used in your organization.
          </p>
        </div>

        <Link
          href="/admin/maintenance/machines/new"
          className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          + Add Machine
        </Link>
      </div>

      {/* =====================================================
          TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-lg border bg-white">
        {machines.length === 0 ? (
          <div className="p-10 text-center">
            <h2 className="text-lg font-semibold">
              No machines found
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Add your first machine to start using maintenance
              management.
            </p>

            <Link
              href="/admin/maintenance/machines/new"
              className="mt-4 inline-block rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white"
            >
              Add Machine
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-sm">
                  <th className="px-5 py-4 font-semibold">
                    Machine Code
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Machine
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Department
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Location
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Model
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {machines.map((machine) => (
                  <tr
                    key={machine.id}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-sm font-medium">
                      {machine.machineCode}
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-sm font-medium">
                        {machine.machineName}
                      </div>

                      {machine.manufacturer && (
                        <div className="text-xs text-gray-500">
                          {machine.manufacturer}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {machine.departmentName}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {machine.location}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {machine.model || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                          machine.status
                        )}`}
                      >
                        {getStatusLabel(machine.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}