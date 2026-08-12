"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  deleteFaultPhoto,
  updateFaultRepair,
  updateFaultStatus,
} from "@/app/(universal)/action/maintenance/faultActions";

import type {
  MaintenanceFault,
  FaultStatus,
} from "@/lib/maintenance/faultTypes";
import FaultWorkflowActions from "../../FaultWorkflowActions";
import RepairFaultForm from "../../RepairFaultForm";
import AssignFaultForm from "../../AssignFaultForm";
import { userDashboardType } from "@/lib/types/userDashboardType";

type FaultDetailsProps = {
  fault: MaintenanceFault;
  technicians: userDashboardType[];
};


export default function FaultDetails({
  fault,
  technicians,
}: FaultDetailsProps) {



  const router = useRouter();

  const [status, setStatus] =
    useState<FaultStatus>(fault.status);

  const [diagnosis, setDiagnosis] =
    useState(fault.diagnosis || "");

  const [repairDescription, setRepairDescription] =
    useState(
      fault.repairDescription || ""
    );

  const [downtimeMinutes, setDowntimeMinutes] =
    useState(
      String(fault.downtimeMinutes || 0)
    );

  const [remarks, setRemarks] =
    useState(fault.remarks || "");

  const [loading, setLoading] =
    useState(false);

  const [statusLoading, setStatusLoading] =
    useState(false);

  const [deleteLoading, setDeleteLoading] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /* =========================================================
     UPDATE STATUS
  ========================================================= */

  const handleStatusChange = async (
    newStatus: FaultStatus
  ) => {
    try {
      setStatusLoading(true);
      setError("");
      setMessage("");

      const result =
        await updateFaultStatus(
          fault.id,
          newStatus
        );

      if (!result.success) {
        setError(result.message);
        return;
      }

      setStatus(newStatus);
      setMessage(result.message);

      router.refresh();
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      setError(
        "Failed to update status."
      );
    } finally {
      setStatusLoading(false);
    }
  };

  /* =========================================================
     SAVE REPAIR
  ========================================================= */

  const handleSaveRepair = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const result =
        await updateFaultRepair(
          fault.id,
          {
            diagnosis,
            repairDescription,
            downtimeMinutes:
              Number(
                downtimeMinutes || 0
              ),
            remarks,
          }
        );

      if (!result.success) {
        setError(result.message);
        return;
      }

      setMessage(result.message);

      router.refresh();
    } catch (error) {
      console.error(
        "Repair update error:",
        error
      );

      setError(
        "Failed to save repair information."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     DELETE PHOTO
  ========================================================= */

  const handleDeletePhoto = async (
    imageUrl: string
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this photo?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(imageUrl);
      setError("");
      setMessage("");

      const result =
        await deleteFaultPhoto(
          fault.id,
          imageUrl
        );

      if (!result.success) {
        setError(result.message);
        return;
      }

      setMessage(result.message);

      router.refresh();
    } catch (error) {
      console.error(
        "Delete photo error:",
        error
      );

      setError(
        "Failed to delete photo."
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  /* =========================================================
     HELPERS
  ========================================================= */

  const formatDate = (
    value: string | null
  ) => {
    if (!value) {
      return "-";
    }

    try {
      return new Date(
        value
      ).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return value;
    }
  };

  const getPhotoUrl = (
    photo: unknown
  ): string => {
    if (typeof photo === "string") {
      return photo;
    }

    if (
      photo &&
      typeof photo === "object" &&
      "url" in photo
    ) {
      return String(
        (
          photo as {
            url?: string;
          }
        ).url || ""
      );
    }

    return "";
  };

  const priorityClass = {
    LOW:
      "bg-gray-100 text-gray-700",

    MEDIUM:
      "bg-blue-100 text-blue-700",

    HIGH:
      "bg-orange-100 text-orange-700",

    CRITICAL:
      "bg-red-100 text-red-700",
  };

  const statusClass: Record<FaultStatus, string> = {
    OPEN:
      "bg-red-100 text-red-700",

    ASSIGNED:
      "bg-purple-100 text-purple-700",

    IN_PROGRESS:
      "bg-yellow-100 text-yellow-700",

    RESOLVED:
      "bg-green-100 text-green-700",

    CLOSED:
      "bg-gray-100 text-gray-700",

    CANCELLED:
      "bg-gray-200 text-gray-600",
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="rounded-xl border bg-white p-6">

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">

          <div>
            <div className="flex flex-wrap items-center gap-3">

              <h2 className="text-xl font-bold">
                {fault.ticketNumber}
              </h2>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass[
                  fault.status
                  ] ||
                  "bg-gray-100 text-gray-700"
                  }`}
              >
                {fault.status.replace(
                  "_",
                  " "
                )}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass[
                  fault.priority
                  ] ||
                  "bg-gray-100 text-gray-700"
                  }`}
              >
                {fault.priority}
              </span>

            </div>

            <h1 className="mt-3 text-2xl font-bold text-gray-900">
              {fault.faultTitle}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Reported{" "}
              {formatDate(
                fault.reportedAt
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/maintenance/faults"
              )
            }
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Back to Faults
          </button>

        </div>

      </div>

      {/* =====================================================
          SUCCESS / ERROR
      ====================================================== */}

      {message && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          MACHINE INFORMATION
      ====================================================== */}

      <div className="rounded-xl border bg-white">

        <div className="border-b p-5">
          <h2 className="text-lg font-semibold">
            Machine Information
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-3">

          <InfoItem
            label="Machine"
            value={`${fault.machineCode} - ${fault.machineName}`}
          />

          <InfoItem
            label="Department"
            value={
              fault.departmentName || "-"
            }
          />

          <InfoItem
            label="Location"
            value={
              fault.location || "-"
            }
          />

        </div>

      </div>

      {/* =====================================================
          FAULT INFORMATION
      ====================================================== */}

      <div className="rounded-xl border bg-white">

        <div className="border-b p-5">
          <h2 className="text-lg font-semibold">
            Fault Information
          </h2>
        </div>

        <div className="space-y-5 p-6">

          <div>
            <p className="text-sm font-medium text-gray-500">
              Fault Description
            </p>

            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
              {fault.faultDescription}
            </p>
          </div>
          {/* FORM TO UPATE FAULT PROGRESS */}
          {/* FORM TO UPATE FAULT PROGRESS */}
          {/* FORM TO UPATE FAULT PROGRESS */}

          <FaultWorkflowActions
            faultId={fault.id}
            status={fault.status}
          />
          <AssignFaultForm
            faultId={fault.id}
            technicians={technicians}
            currentAssignedTo={fault.assignedTo}
            currentAssignedToName={fault.assignedToName}
            currentStatus={fault.status}
          />

          {fault.status === "IN_PROGRESS" && (
            <RepairFaultForm
              faultId={fault.id}
              diagnosis={fault.diagnosis}
              repairDescription={
                fault.repairDescription
              }
              downtimeMinutes={
                fault.downtimeMinutes
              }
              remarks={fault.remarks}
            />
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            <InfoItem
              label="Reported By"
              value={
                fault.reportedByName ||
                fault.reportedBy ||
                "-"
              }
            />

            <InfoItem
              label="Reported At"
              value={formatDate(
                fault.reportedAt
              )}
            />

            <InfoItem
              label="Priority"
              value={fault.priority}
            />

          </div>

        </div>

      </div>

      {/* =====================================================
          FAULT PHOTOS
      ====================================================== */}

      <div className="rounded-xl border bg-white">

        <div className="border-b p-5">

          <h2 className="text-lg font-semibold">
            Fault Photos
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Photos uploaded by the operator.
          </p>

        </div>

        <div className="p-6">

          {fault.photos &&
            fault.photos.length > 0 ? (

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

              {fault.photos.map(
                (
                  photo,
                  index
                ) => {
                  const imageUrl =
                    getPhotoUrl(
                      photo
                    );

                  if (!imageUrl) {
                    return null;
                  }

                  return (
                    <div
                      key={`${imageUrl}-${index}`}
                      className="overflow-hidden rounded-lg border bg-gray-50"
                    >

                      <div className="relative aspect-square">

                        <img
                          src={imageUrl}
                          alt={`Fault photo ${index + 1
                            }`}
                          className="h-full w-full object-cover"
                        />

                      </div>

                      <div className="flex items-center justify-between p-3">

                        <span className="text-xs text-gray-500">
                          Photo{" "}
                          {index + 1}
                        </span>

                        <button
                          type="button"
                          disabled={
                            deleteLoading ===
                            imageUrl
                          }
                          onClick={() =>
                            handleDeletePhoto(
                              imageUrl
                            )
                          }
                          className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          {deleteLoading ===
                            imageUrl
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          ) : (

            <div className="rounded-lg border border-dashed p-10 text-center">

              <div className="text-4xl">
                📷
              </div>

              <p className="mt-2 text-sm font-medium">
                No photos uploaded
              </p>

              <p className="mt-1 text-xs text-gray-500">
                No fault photos are available.
              </p>

            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          ASSIGNMENT
      ====================================================== */}

      <div className="rounded-xl border bg-white">

        <div className="border-b p-5">

          <h2 className="text-lg font-semibold">
            Assignment
          </h2>

        </div>

        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-3">

          <InfoItem
            label="Assigned To"
            value={
              fault.assignedToName ||
              fault.assignedTo ||
              "Not assigned"
            }
          />

          <InfoItem
            label="Assigned At"
            value={formatDate(
              fault.assignedAt
            )}
          />

          <InfoItem
            label="Started At"
            value={formatDate(
              fault.startedAt
            )}
          />

        </div>

      </div>

      {/* =====================================================
          STATUS
      ====================================================== */}

      <div className="rounded-xl border bg-white">

        <div className="border-b p-5">

          <h2 className="text-lg font-semibold">
            Fault Status
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Update the maintenance progress.
          </p>

        </div>

        <div className="p-6">

          <div className="flex flex-col gap-3 md:flex-row md:items-end">

            <div className="flex-1">

              <label className="label-style-4">
                Status
              </label>

              <select
                value={status}
                disabled={
                  statusLoading
                }
                onChange={(event) =>
                  setStatus(
                    event.target
                      .value as FaultStatus
                  )
                }
                className="input-style-4"
              >
                <option value="OPEN">
                  Open
                </option>

                <option value="ASSIGNED">
                  Assigned
                </option>

                <option value="IN_PROGRESS">
                  In Progress
                </option>

                <option value="RESOLVED">
                  Resolved
                </option>

                <option value="CLOSED">
                  Closed
                </option>
              </select>

            </div>

            <button
              type="button"
              disabled={
                statusLoading ||
                status === fault.status
              }
              onClick={() =>
                handleStatusChange(
                  status
                )
              }
              className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {statusLoading
                ? "Updating..."
                : "Update Status"}
            </button>

          </div>

        </div>

      </div>

      {/* =====================================================
          REPAIR INFORMATION
      ====================================================== */}

      <div className="rounded-xl border bg-white">

        <div className="border-b p-5">

          <h2 className="text-lg font-semibold">
            Diagnosis & Repair
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Record what was found and what was repaired.
          </p>

        </div>

        <div className="space-y-5 p-6">

          {/* DIAGNOSIS */}

          <div>

            <label className="label-style-4">
              Diagnosis
            </label>

            <textarea
              value={diagnosis}
              onChange={(event) =>
                setDiagnosis(
                  event.target.value
                )
              }
              rows={4}
              className="input-style-4 resize-none"
              placeholder="What caused the machine fault?"
            />

          </div>

          {/* REPAIR */}

          <div>

            <label className="label-style-4">
              Repair Description
            </label>

            <textarea
              value={
                repairDescription
              }
              onChange={(event) =>
                setRepairDescription(
                  event.target.value
                )
              }
              rows={4}
              className="input-style-4 resize-none"
              placeholder="Describe the repair work performed."
            />

          </div>

          {/* DOWNTIME */}

          <div>

            <label className="label-style-4">
              Downtime (Minutes)
            </label>

            <input
              type="number"
              min="0"
              value={
                downtimeMinutes
              }
              onChange={(event) =>
                setDowntimeMinutes(
                  event.target.value
                )
              }
              className="input-style-4"
              placeholder="0"
            />

          </div>

          {/* REMARKS */}

          <div>

            <label className="label-style-4">
              Remarks
            </label>

            <textarea
              value={remarks}
              onChange={(event) =>
                setRemarks(
                  event.target.value
                )
              }
              rows={3}
              className="input-style-4 resize-none"
              placeholder="Additional remarks..."
            />

          </div>

          {/* SAVE */}

          <div className="flex justify-end">

            <button
              type="button"
              disabled={loading}
              onClick={
                handleSaveRepair
              }
              className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : "Save Repair Information"}
            </button>

          </div>

        </div>

      </div>

      {/* =====================================================
          TIMELINE
      ====================================================== */}

      <div className="rounded-xl border bg-white">

        <div className="border-b p-5">

          <h2 className="text-lg font-semibold">
            Maintenance Timeline
          </h2>

        </div>

        <div className="space-y-4 p-6">

          <TimelineItem
            title="Fault Reported"
            date={fault.reportedAt}
          />

          <TimelineItem
            title="Technician Assigned"
            date={fault.assignedAt}
          />

          <TimelineItem
            title="Repair Started"
            date={fault.startedAt}
          />

          <TimelineItem
            title="Fault Resolved"
            date={fault.resolvedAt}
          />

          <TimelineItem
            title="Ticket Closed"
            date={fault.closedAt}
          />

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   TIMELINE ITEM
========================================================= */

function TimelineItem({
  title,
  date,
}: {
  title: string;
  date: string | null;
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="mt-1 h-3 w-3 rounded-full bg-black" />

      <div>

        <p className="text-sm font-medium text-gray-900">
          {title}
        </p>

        <p className="text-xs text-gray-500">
          {date
            ? new Date(
              date
            ).toLocaleString(
              "en-IN",
              {
                dateStyle:
                  "medium",
                timeStyle:
                  "short",
              }
            )
            : "Not yet"}
        </p>

      </div>

    </div>
  );
}