"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";

import {
  CreateMachineInput,
  MachineStatus,
} from "@/lib/maintenance/machineTypes";

import { addMachine } from "@/app/(universal)/action/maintenance/machineActions";

type Department = {
  id: string;
  name: string;
};

type MachineFormValues = {
  machineCode: string;
  machineName: string;

  departmentId: string;
  departmentName: string;

  location: string;

  manufacturer: string;
  model: string;
  serialNumber: string;

  installationDate: string;

  status: MachineStatus;
};

type MachineFormProps = {
  departments: Department[];
};

export default function MachineForm({
  departments,
}: MachineFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MachineFormValues>({
    defaultValues: {
      machineCode: "",
      machineName: "",

      departmentId: "",
      departmentName: "",

      location: "",

      manufacturer: "",
      model: "",
      serialNumber: "",

      installationDate: "",

      status: "ACTIVE",
    },
  });

  /**
   * =========================================================
   * DEPARTMENT CHANGE
   * =========================================================
   *
   * When department is selected:
   *
   * departmentId   -> selected department ID
   * departmentName -> selected department name
   *
   */

  const handleDepartmentChange = (
    departmentId: string
  ) => {
    const selectedDepartment = departments.find(
      (department) => department.id === departmentId
    );

    setValue("departmentId", departmentId);

    setValue(
      "departmentName",
      selectedDepartment?.name || ""
    );
  };

  /**
   * =========================================================
   * SUBMIT
   * =========================================================
   */

  const onSubmit = async (
    values: MachineFormValues
  ) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!values.departmentId) {
        setError("Please select a department.");
        return;
      }

      const input: CreateMachineInput = {
        machineCode: values.machineCode,
        machineName: values.machineName,

        departmentId: values.departmentId,
        departmentName: values.departmentName,

        location: values.location,

        manufacturer: values.manufacturer,
        model: values.model,
        serialNumber: values.serialNumber,

        installationDate: values.installationDate,

        status: values.status,
      };

      const result = await addMachine(input);

      if (!result.success) {
        setError(result.message);
        return;
      }

      setSuccess(result.message);

      setTimeout(() => {
        router.push(
          "/admin/maintenance/machines"
        );

        router.refresh();
      }, 700);
    } catch (error) {
      console.error(
        "Machine form error:",
        error
      );

      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 p-6"
    >
      {/* =====================================================
          BASIC INFORMATION
      ====================================================== */}

      <div className="rounded-lg border bg-white">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">
            Machine Information
          </h2>

          <p className="text-sm text-gray-500">
            Enter the basic information of the machine.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">

          {/* =================================================
              MACHINE CODE
          ================================================== */}

          <div>
            <label className="label-style-4">
              Machine Code *
            </label>

            <input
              {...register("machineCode", {
                required:
                  "Machine code is required",
              })}
              className="input-style-4"
              placeholder="MC-001"
            />

            {errors.machineCode && (
              <p className="mt-1 text-sm text-red-500">
                {errors.machineCode.message}
              </p>
            )}
          </div>

          {/* =================================================
              MACHINE NAME
          ================================================== */}

          <div>
            <label className="label-style-4">
              Machine Name *
            </label>

            <input
              {...register("machineName", {
                required:
                  "Machine name is required",
              })}
              className="input-style-4"
              placeholder="CNC Machine"
            />

            {errors.machineName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.machineName.message}
              </p>
            )}
          </div>

          {/* =================================================
              DEPARTMENT
          ================================================== */}

          <div>
            <label className="label-style-4">
              Department *
            </label>

            <select
              {...register("departmentId", {
                required:
                  "Department is required",
                onChange: (event) => {
                  handleDepartmentChange(
                    event.target.value
                  );
                },
              })}
              className="input-style-4"
              defaultValue=""
            >
              <option value="">
                Select Department
              </option>

              {departments.map(
                (department) => (
                  <option
                    key={department.id}
                    value={department.id}
                  >
                    {department.name}
                  </option>
                )
              )}
            </select>

            {errors.departmentId && (
              <p className="mt-1 text-sm text-red-500">
                {errors.departmentId.message}
              </p>
            )}
          </div>

          {/* =================================================
              LOCATION
          ================================================== */}

          <div>
            <label className="label-style-4">
              Location *
            </label>

            <input
              {...register("location", {
                required:
                  "Location is required",
              })}
              className="input-style-4"
              placeholder="Production Floor"
            />

            {errors.location && (
              <p className="mt-1 text-sm text-red-500">
                {errors.location.message}
              </p>
            )}
          </div>

          {/* =================================================
              STATUS
          ================================================== */}

          <div>
            <label className="label-style-4">
              Status
            </label>

            <select
              {...register("status")}
              className="input-style-4"
            >
              <option value="ACTIVE">
                Active
              </option>

              <option value="UNDER_MAINTENANCE">
                Under Maintenance
              </option>

              <option value="BREAKDOWN">
                Breakdown
              </option>

              <option value="INACTIVE">
                Inactive
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* =====================================================
          MANUFACTURER INFORMATION
      ====================================================== */}

      <div className="rounded-lg border bg-white">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">
            Manufacturer Details
          </h2>

          <p className="text-sm text-gray-500">
            Optional machine identification
            information.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">

          {/* =================================================
              MANUFACTURER
          ================================================== */}

          <div>
            <label className="label-style-4">
              Manufacturer
            </label>

            <input
              {...register("manufacturer")}
              className="input-style-4"
              placeholder="ABC Industries"
            />
          </div>

          {/* =================================================
              MODEL
          ================================================== */}

          <div>
            <label className="label-style-4">
              Model
            </label>

            <input
              {...register("model")}
              className="input-style-4"
              placeholder="XYZ-100"
            />
          </div>

          {/* =================================================
              SERIAL NUMBER
          ================================================== */}

          <div>
            <label className="label-style-4">
              Serial Number
            </label>

            <input
              {...register("serialNumber")}
              className="input-style-4"
              placeholder="SN123456"
            />
          </div>

          {/* =================================================
              INSTALLATION DATE
          ================================================== */}

          <div>
            <label className="label-style-4">
              Installation Date
            </label>

            <input
              type="date"
              {...register("installationDate")}
              className="input-style-4"
            />
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
          onClick={() =>
            router.push(
              "/admin/maintenance/machines"
            )
          }
          className="rounded-md border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : "Save Machine"}
        </button>
      </div>
    </form>
  );
}