"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import {
  addFault,
} from "@/app/(universal)/action/maintenance/faultActions";

import type {
  CreateFaultInput,
  FaultPriority,
} from "@/lib/maintenance/faultTypes";

import type {
  Machine,
} from "@/lib/maintenance/machineTypes";

type FaultReportFormProps = {
  machines: Machine[];

  /**
   * Current logged-in user.
   *
   * Pass these from your page/auth system.
   */
  reportedBy: string;
  reportedByName?: string;
};

type FaultFormValues = {
  machineId: string;

  faultTitle: string;

  faultDescription: string;

  priority: FaultPriority;
};

export default function FaultReportForm({
  machines,
  reportedBy,
  reportedByName,
}: FaultReportFormProps) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: {
      errors,
    },
  } = useForm<FaultFormValues>({
    defaultValues: {
      machineId: "",
      faultTitle: "",
      faultDescription: "",
      priority: "MEDIUM",
    },
  });

  const selectedMachineId =
    watch("machineId");

  const selectedMachine =
    machines.find(
      (machine) =>
        machine.id ===
        selectedMachineId
    );

  /**
   * =========================================================
   * SUBMIT
   * =========================================================
   */

  const onSubmit = async (
    values: FaultFormValues
  ) => {
    try {
      setLoading(true);

      setError("");
      setSuccess("");

      /**
       * Find selected machine
       */

      const machine =
        machines.find(
          (item) =>
            item.id ===
            values.machineId
        );

      if (!machine) {
        setError(
          "Please select a machine."
        );

        return;
      }

      /**
       * =======================================================
       * CREATE FAULT INPUT
       * =======================================================
       */

      const input: CreateFaultInput = {
        machineId:
          machine.id,

        machineName:
          machine.machineName,

        machineCode:
          machine.machineCode,

        departmentId:
          machine.departmentId,

        departmentName:
          machine.departmentName,

        location:
          machine.location,

        faultTitle:
          values.faultTitle.trim(),

        faultDescription:
          values.faultDescription.trim(),

        priority:
          values.priority,

        reportedBy:
          reportedBy,

        reportedByName:
          reportedByName || "",
      };

      /**
       * =======================================================
       * SAVE
       * =======================================================
       */

      const result =
        await addFault(input);

      if (!result.success) {
        setError(
          result.message
        );

        return;
      }

      /**
       * =======================================================
       * SUCCESS
       * =======================================================
       */

      setSuccess(
        result.ticketNumber
          ? `Fault reported successfully. Ticket: ${result.ticketNumber}`
          : result.message
      );

      /**
       * Give user a moment to see
       * the ticket number.
       */

      setTimeout(() => {
        router.push(
          "/admin/maintenance/faults"
        );

        router.refresh();
      }, 1200);
    } catch (error) {
      console.error(
        "Fault report form error:",
        error
      );

      setError(
        "Something went wrong while reporting the fault."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit
      )}
      className="space-y-6 p-6"
    >

      {/* =====================================================
          MACHINE INFORMATION
      ====================================================== */}

      <div className="rounded-lg border bg-white">

        <div className="border-b p-4">

          <h2 className="text-lg font-semibold">
            Machine
          </h2>

          <p className="text-sm text-gray-500">
            Select the machine that has the fault.
          </p>

        </div>

        <div className="p-6">

          <div>

            <label className="label-style-4">
              Machine *
            </label>

            <select
              {...register(
                "machineId",
                {
                  required:
                    "Machine is required.",
                }
              )}
              className="input-style-4"
            >

              <option value="">
                Select Machine
              </option>

              {machines.map(
                (machine) => (
                  <option
                    key={machine.id}
                    value={machine.id}
                  >
                    {machine.machineCode} -{" "}
                    {machine.machineName}
                  </option>
                )
              )}

            </select>

            {errors.machineId && (
              <p className="mt-1 text-sm text-red-500">
                {
                  errors.machineId
                    .message
                }
              </p>
            )}

          </div>

          {/* =================================================
              SELECTED MACHINE DETAILS
          ================================================== */}

          {selectedMachine && (

            <div className="mt-4 rounded-md bg-gray-50 p-4">

              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">

                <div>
                  <span className="text-gray-500">
                    Department
                  </span>

                  <p className="font-medium">
                    {
                      selectedMachine.departmentName ||
                      "-"
                    }
                  </p>
                </div>

                <div>
                  <span className="text-gray-500">
                    Location
                  </span>

                  <p className="font-medium">
                    {
                      selectedMachine.location ||
                      "-"
                    }
                  </p>
                </div>

                <div>
                  <span className="text-gray-500">
                    Current Status
                  </span>

                  <p className="font-medium">
                    {
                      selectedMachine.status
                    }
                  </p>
                </div>

              </div>

            </div>

          )}

          {machines.length === 0 && (

            <p className="mt-2 text-sm text-red-500">
              No machines are available.
              Please add a machine first.
            </p>

          )}

        </div>

      </div>

      {/* =====================================================
          FAULT INFORMATION
      ====================================================== */}

      <div className="rounded-lg border bg-white">

        <div className="border-b p-4">

          <h2 className="text-lg font-semibold">
            Fault Information
          </h2>

          <p className="text-sm text-gray-500">
            Describe what is wrong with the machine.
          </p>

        </div>

        <div className="space-y-5 p-6">

          {/* FAULT TITLE */}

          <div>

            <label className="label-style-4">
              Fault Title *
            </label>

            <input
              {...register(
                "faultTitle",
                {
                  required:
                    "Fault title is required.",
                }
              )}
              className="input-style-4"
              placeholder="Machine motor not starting"
            />

            {errors.faultTitle && (
              <p className="mt-1 text-sm text-red-500">
                {
                  errors.faultTitle
                    .message
                }
              </p>
            )}

          </div>

          {/* DESCRIPTION */}

          <div>

            <label className="label-style-4">
              Fault Description *
            </label>

            <textarea
              {...register(
                "faultDescription",
                {
                  required:
                    "Fault description is required.",
                }
              )}
              rows={5}
              className="input-style-4 resize-none"
              placeholder="Describe what happened, what the operator noticed, any unusual sound, error message, smoke, vibration, etc."
            />

            {errors.faultDescription && (
              <p className="mt-1 text-sm text-red-500">
                {
                  errors
                    .faultDescription
                    .message
                }
              </p>
            )}

          </div>

          {/* PRIORITY */}

          <div>

            <label className="label-style-4">
              Priority *
            </label>

            <select
              {...register(
                "priority"
              )}
              className="input-style-4"
            >

              <option value="LOW">
                Low
              </option>

              <option value="MEDIUM">
                Medium
              </option>

              <option value="HIGH">
                High
              </option>

              <option value="CRITICAL">
                Critical
              </option>

            </select>

          </div>

        </div>

      </div>

      {/* =====================================================
          PHOTO PLACEHOLDER
      ====================================================== */}

      <div className="rounded-lg border bg-white">

        <div className="border-b p-4">

          <h2 className="text-lg font-semibold">
            Fault Photos
          </h2>

          <p className="text-sm text-gray-500">
            Photos can be added after the fault is created.
          </p>

        </div>

        <div className="p-6">

          <div className="rounded-md border border-dashed p-8 text-center">

            <div className="text-3xl">
              📷
            </div>

            <p className="mt-2 text-sm font-medium">
              Photo upload
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Camera and image upload will be added in the next step.
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>

      )}

      {/* =====================================================
          SUCCESS
      ====================================================== */}

      {success && (

        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>

      )}

      {/* =====================================================
          BUTTONS
      ====================================================== */}

      <div className="flex justify-end gap-3">

        <button
          type="button"
          disabled={loading}
          onClick={() =>
            router.push(
              "/admin/maintenance/faults"
            )
          }
          className="rounded-md border px-5 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            loading ||
            machines.length === 0
          }
          className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Reporting..."
            : "Report Fault"}
        </button>

      </div>

    </form>
  );
}