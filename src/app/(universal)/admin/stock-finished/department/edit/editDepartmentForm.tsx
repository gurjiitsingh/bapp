"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";

import { addDepartment } from "@/app/(universal)/action/department/addDepartment";
import { updateDepartment } from "@/app/(universal)/action/department/updateDepartment";
import { deleteDepartment } from "@/app/(universal)/action/department/deleteDepartment";

type TDepartmentForm = {
  id?: string;

  name: string;
  code: string;
  type: "PRODUCTION" | "SERVICE";
  description?: string;
  employeeCount: number;
  managerId?: string;
  managerName?: string;

  isActive: boolean;
};

const EditDepartmentForm = ({
  employees = [],
  initialData,
}: {
  employees: { id: string; name: string }[];
  initialData?: TDepartmentForm;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!initialData?.id;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<TDepartmentForm>({
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

  // ✅ Prefill for edit
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

async function onSubmit(data: TDepartmentForm) {
  if (isSubmitting) return;

  setIsSubmitting(true);

  try {
    let result;

    if (isEdit) {
      if (!data.id) {
        alert("Missing department ID");
        return;
      }

      result = await updateDepartment({
        ...data,
        id: data.id, // ✅ now guaranteed
      });
    } else {
      result = await addDepartment(data);
    }

    if (!result.success) {
      alert(result.message);
      return;
    }

    alert(isEdit ? "Updated!" : "Created!");

    if (!isEdit) reset();
  } catch (error) {
    console.error(error);
    alert("Something went wrong");
  } finally {
    setIsSubmitting(false);
  }
}
  async function handleDelete() {
    if (!initialData?.id) return;

    const confirmDelete = confirm(
      "Are you sure you want to delete this department?"
    );

    if (!confirmDelete) return;

    setIsSubmitting(true);

    try {
      const result = await deleteDepartment(initialData.id);

      if (!result.success) {
        alert(result.message);
        return;
      }

      alert("Deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedManagerId = watch("managerId");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-7xl p-4 md:p-6"
    >
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEdit ? "Edit Department" : "Create Department"}
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage production or service departments
          </p>
        </div>

        {/* DELETE BUTTON */}
        {isEdit && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            Delete
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* LEFT */}
        <div className="xl:col-span-2 flex flex-col gap-5">
          {/* Basic Details */}
          <div className="bg-white border rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold mb-4">
              Department Details
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="label-style-4">
                  Department Name *
                </label>

                <input
                  {...register("name", {
                    required: "Department name is required",
                  })}
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
                    required: "Code is required",
                  })}
                  className="input-style-4 mt-1 uppercase"
                />
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
                <option value="PRODUCTION">Production</option>
                <option value="SERVICE">Service</option>
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
                className="input-style-4 mt-1"
              />
            </div>
          </div>

          {/* Manager */}
          <div className="bg-white border rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold mb-4">
              Manager
            </h2>

            <select
              className="input-style-4 mt-1"
              value={selectedManagerId}
              onChange={(e) => {
                const selected = employees.find(
                  (emp) => emp.id === e.target.value
                );

                setValue("managerId", selected?.id || "");
                setValue("managerName", selected?.name || "");
              }}
            >
              <option value="">Select Manager</option>

              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-5">
          {/* Settings */}
          <div className="bg-white border rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold mb-4">
              Settings
            </h2>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register("isActive")}
              />

              <label className="label-style-4">
                Active Department
              </label>
            </div>
          </div>

          {/* Save */}
          <div className="bg-gradient-to-br from-emerald-50 to-white border rounded-2xl shadow-sm p-5">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="btn-save-4 w-full"
            >
              {isSubmitting
                ? isEdit
                  ? "Updating..."
                  : "Saving..."
                : isEdit
                ? "Update Department"
                : "Save Department"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default EditDepartmentForm;