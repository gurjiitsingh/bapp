"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import {
  updateFaultRepair,
} from "@/app/(universal)/action/maintenance/faultActions";

type RepairFaultFormProps = {
  faultId: string;

  diagnosis?: string;

  repairDescription?: string;

  downtimeMinutes?: number;

  remarks?: string;
};

type RepairFormValues = {
  diagnosis: string;
  repairDescription: string;
  downtimeMinutes: number;
  remarks: string;
};

export default function RepairFaultForm({
  faultId,
  diagnosis = "",
  repairDescription = "",
  downtimeMinutes = 0,
  remarks = "",
}: RepairFaultFormProps) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RepairFormValues>({
    defaultValues: {
      diagnosis,
      repairDescription,
      downtimeMinutes,
      remarks,
    },
  });

  const onSubmit = async (
    values: RepairFormValues
  ) => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const result =
        await updateFaultRepair(
          faultId,
          {
            diagnosis:
              values.diagnosis,

            repairDescription:
              values.repairDescription,

            downtimeMinutes:
              Number(
                values.downtimeMinutes || 0
              ),

            remarks:
              values.remarks,
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
        "Repair form error:",
        error
      );

      setError(
        "Failed to save repair information."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-lg border bg-white p-6"
    >
      <div>
        <h2 className="text-lg font-semibold">
          Repair Information
        </h2>

        <p className="text-sm text-gray-500">
          Record the diagnosis and repair performed.
        </p>
      </div>

      <div>
        <label className="label-style-4">
          Diagnosis *
        </label>

        <textarea
          {...register("diagnosis", {
            required:
              "Diagnosis is required.",
          })}
          rows={4}
          className="input-style-4 resize-none"
          placeholder="What caused the machine fault?"
        />

        {errors.diagnosis && (
          <p className="mt-1 text-sm text-red-500">
            {errors.diagnosis.message}
          </p>
        )}
      </div>

      <div>
        <label className="label-style-4">
          Repair Description *
        </label>

        <textarea
          {...register(
            "repairDescription",
            {
              required:
                "Repair description is required.",
            }
          )}
          rows={5}
          className="input-style-4 resize-none"
          placeholder="Describe the repair work performed."
        />

        {errors.repairDescription && (
          <p className="mt-1 text-sm text-red-500">
            {
              errors
                .repairDescription
                .message
            }
          </p>
        )}
      </div>

      <div>
        <label className="label-style-4">
          Downtime Minutes
        </label>

        <input
          type="number"
          min="0"
          {...register(
            "downtimeMinutes",
            {
              valueAsNumber: true,
              min: {
                value: 0,
                message:
                  "Downtime cannot be negative.",
              },
            }
          )}
          className="input-style-4"
        />

        {errors.downtimeMinutes && (
          <p className="mt-1 text-sm text-red-500">
            {
              errors.downtimeMinutes
                .message
            }
          </p>
        )}
      </div>

      <div>
        <label className="label-style-4">
          Remarks
        </label>

        <textarea
          {...register("remarks")}
          rows={3}
          className="input-style-4 resize-none"
          placeholder="Additional remarks..."
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : "Save Repair Information"}
        </button>
      </div>
    </form>
  );
}