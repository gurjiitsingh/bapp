

import {
  getMachines,
} from "@/app/(universal)/action/maintenance/machineActions";
 
import FaultReportForm from "../FaultReportForm";

export default async function NewFaultPage() {

  const machines =
    await getMachines();

  /**
   * =========================================================
   * TEMPORARY USER
   * =========================================================
   *
   * Replace this with your actual logged-in
   * employee/user information.
   *
   */

  const reportedBy =
    "CURRENT_USER_ID";

  const reportedByName =
    "Current User";

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="mx-auto max-w-5xl">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="mb-6">

          <h1 className="text-2xl font-semibold">
            Report Machine Fault
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Report a machine problem to the maintenance team.
          </p>

        </div>

        {/* =================================================
            FORM
        ================================================== */}

        <div className="overflow-hidden rounded-lg border bg-white">

        <FaultReportForm
  machines={machines}
  reportedBy={reportedBy}
  reportedByName={reportedByName}
/>

        </div>

      </div>

    </div>
  );
}