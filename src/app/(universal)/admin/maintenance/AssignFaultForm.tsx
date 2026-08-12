"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { assignFault } from "@/app/(universal)/action/maintenance/faultActions";
import { userDashboardType } from "@/lib/types/userDashboardType";

type AssignFaultFormProps = {
  faultId: string;

  technicians: userDashboardType[];

  currentAssignedTo?: string | null;
  currentAssignedToName?: string | null;
  currentStatus?: string;
};

export default function AssignFaultForm({
  faultId,
  technicians,
  currentAssignedTo,
  currentAssignedToName,
  currentStatus,
}: AssignFaultFormProps) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [selectedTechnicianId, setSelectedTechnicianId] =
    useState(currentAssignedTo || "");

  const selectedTechnician =
    technicians.find(
      (technician) =>
        technician.id === selectedTechnicianId
    );

  const handleAssign = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!faultId) {
        setError("Fault ID is required.");
        return;
      }

      if (!selectedTechnicianId) {
        setError("Please select a technician.");
        return;
      }

      if (!selectedTechnician) {
        setError("Selected technician was not found.");
        return;
      }

      const result = await assignFault(
        faultId,
        selectedTechnician.id,
        selectedTechnician.fullName
      );

      if (!result.success) {
        setError(result.message);
        return;
      }

      setSuccess(result.message);

      router.refresh();
    } catch (error) {
      console.error(
        "Assign fault error:",
        error
      );

      setError(
        "Something went wrong while assigning the technician."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-white">

      {/* HEADER */}
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">
          Technician Assignment
        </h2>

        <p className="text-sm text-gray-500">
          Assign this fault to the maintenance technician.
        </p>
      </div>

      {/* CONTENT */}
      <div className="space-y-5 p-6">

        {/* TECHNICIAN SELECT */}
        <div>
          <label className="label-style-4">
            Technician
          </label>

          {technicians.length > 0 ? (
            <select
              value={selectedTechnicianId}
              onChange={(event) =>
                setSelectedTechnicianId(
                  event.target.value
                )
              }
              disabled={loading}
              className="input-style-4 mt-2"
            >
              <option value="">
                Select Technician
              </option>

              {technicians.map(
                (technician) => (
                  <option
                    key={technician.id}
                    value={technician.id}
                  >
                    {technician.fullName}
                    {technician.employeeId
                      ? ` - ${technician.employeeId}`
                      : ""}
                  </option>
                )
              )}
            </select>
          ) : (
            <div className="mt-2 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
              No technicians were found.
            </div>
          )}
        </div>

        {/* SELECTED TECHNICIAN DETAILS */}
        {selectedTechnician && (
          <div className="rounded-md border bg-gray-50 p-4">

            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Selected Technician
            </p>

            <p className="mt-1 text-base font-semibold text-gray-900">
              {selectedTechnician.fullName}
            </p>

            {selectedTechnician.employeeId && (
              <p className="mt-1 text-sm text-gray-500">
                Employee ID:{" "}
                <span className="font-medium">
                  {selectedTechnician.employeeId}
                </span>
              </p>
            )}

            {selectedTechnician.department && (
              <p className="mt-1 text-sm text-gray-500">
                Department:{" "}
                <span className="font-medium">
                  {selectedTechnician.department}
                </span>
              </p>
            )}

            {selectedTechnician.mobile && (
              <p className="mt-1 text-sm text-gray-500">
                Mobile:{" "}
                <span className="font-medium">
                  {selectedTechnician.mobile}
                </span>
              </p>
            )}

          </div>
        )}

        {/* CURRENT ASSIGNMENT */}
        {currentAssignedToName && (
          <div className="rounded-md border border-blue-200 bg-blue-50 p-4">

            <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
              Currently Assigned To
            </p>

            <p className="mt-1 text-sm font-semibold text-blue-900">
              {currentAssignedToName}
            </p>

            {currentStatus && (
              <p className="mt-1 text-xs text-blue-700">
                Status:{" "}
                {currentStatus.replace(
                  "_",
                  " "
                )}
              </p>
            )}

          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* BUTTON */}
        <div className="flex justify-end">

          <button
            type="button"
            onClick={handleAssign}
            disabled={
              loading ||
              !selectedTechnician
            }
            className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Assigning..."
              : currentAssignedTo
                ? "Reassign Technician"
                : "Assign Technician"}
          </button>

        </div>

      </div>
    </div>
  );
}