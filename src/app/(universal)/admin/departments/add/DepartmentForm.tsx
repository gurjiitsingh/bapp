"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { addDepartment } from "@/app/(universal)/action/department/addDepartment";


type TDepartmentForm = {
  name: string;
  code: string;
  type: "PRODUCTION" | "SERVICE";
  description?: string;

  managerId?: string;
  managerName?: string;

  isActive: boolean;
};

const DepartmentForm = ({
  employees = [],
}: {
  employees: { id: string; name: string }[];
}) => {
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } =
    useForm<TDepartmentForm>({
      defaultValues: {
        name: "",
        code: "",
        type: "PRODUCTION",
        description: "",
        managerId: "",
        managerName: "",
        isActive: true,
      },
    });

  async function onSubmit(
    data: TDepartmentForm
  ) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const result =
        await addDepartment(data);

      if (!result.success) {
        alert(result.message);
        return;
      }

      reset();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-7xl p-4 md:p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Create Department
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage production or service departments
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* LEFT */}
        <div className="xl:col-span-2 flex flex-col gap-5">
          {/* Basic Details */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Department Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="label-style-4">
                  Department Name *
                </label>

                <input
                  {...register("name", {
                    required:
                      "Department name is required",
                  })}
                  placeholder="Sweet Department"
                  className="input-style-4 mt-1"
                />

                <p className="text-xs text-red-500 mt-1">
                  {errors.name?.message}
                </p>
              </div>

              {/* Code */}
              <div>
                <label className="label-style-4">
                  Code *
                </label>

                <input
                  {...register("code", {
                    required:
                      "Code is required",
                  })}
                  placeholder="HAL"
                  className="input-style-4 mt-1 uppercase"
                />

                <p className="text-xs text-red-500 mt-1">
                  {errors.code?.message}
                </p>
              </div>
            </div>

            {/* Type */}
            <div className="mt-4">
              <label className="label-style-4">
                Department Type
              </label>

              <select
                {...register("type")}
                className="input-style-4 mt-1"
              >
                <option value="PRODUCTION">
                  Production
                </option>
                <option value="SERVICE">
                  Service
                </option>
              </select>
            </div>

            {/* Description */}
            <div className="mt-4">
              <label className="label-style-4">
                Description
              </label>

              <textarea
                {...register("description")}
                rows={3}
                placeholder="Main sweet production department"
                className="input-style-4 mt-1"
              />
            </div>
          </div>

          {/* Manager */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Manager
            </h2>

            <div>
              <label className="label-style-4">
                Select Manager
              </label>

              <select
                className="input-style-4 mt-1"
                onChange={(e) => {
                  const selected =
                    employees.find(
                      (emp) =>
                        emp.id ===
                        e.target.value
                    );

                  setValue(
                    "managerId",
                    selected?.id || ""
                  );
                  setValue(
                    "managerName",
                    selected?.name || ""
                  );
                }}
              >
                <option value="">
                  Select Manager
                </option>

                {employees.map((emp) => (
                  <option
                    key={emp.id}
                    value={emp.id}
                  >
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-5">
          {/* Settings */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Settings
            </h2>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register("isActive")}
                className="h-4 w-4"
              />

              <label className="label-style-4">
                Active Department
              </label>
            </div>
          </div>

          {/* Save */}
          <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl shadow-sm p-5">
            <h3 className="text-lg font-semibold text-gray-800">
              Save Department
            </h3>

            <p className="text-sm text-gray-500 mt-1 mb-5">
              Save this department to your system
            </p>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="btn-save-4 w-full"
            >
              {isSubmitting
                ? "Saving Department..."
                : "Save Department"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default DepartmentForm;