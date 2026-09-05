"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

 

import { addPosUser } from "@/app/(universal)/action/user/addPosUser";
import { createPosUserSchema, TCreatePosUserSchema } from "@/lib/types/users/createPosUserSchema";

export default function RegisterForm() {
const router = useRouter();

const {
register,
handleSubmit,
formState: { errors, isSubmitting },
} = useForm<TCreatePosUserSchema>({
resolver: zodResolver(createPosUserSchema),
defaultValues: {
role: "user",
status: "active",
},
});

const onSubmitUserRegister = async (data: TCreatePosUserSchema) => {
const formData = new FormData();

 
formData.append("fullName", data.fullName);
formData.append("username", data.username);
formData.append("mobile", data.mobile);
formData.append("role", data.role);
formData.append("status", data.status);
formData.append("pin", data.pin);

const result = await addPosUser(formData);

if (result.success) {
  toast.success(result.message);
  router.push("/admin/store-pos/pos-users");
} else {       
  toast.error(result.message);
}
 

};

return ( <div className="p-4 md:p-6"> <div className="max-w-3xl">

 
    {/* Header */}
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        Add POS User
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        Create a user for your POS system.
      </p>
    </div>

    {/* Form */}
    <form
      onSubmit={handleSubmit(onSubmitUserRegister)}
      className="bg-white border border-slate-200 rounded-xl"
    >
      <div className="p-6">

        {/* User Information */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-slate-800">
            User Information
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Enter the basic information for this POS user.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Full Name
            </label>

            <input
              {...register("fullName")}
              placeholder="Enter full name"
              className={`w-full h-10 px-3 rounded-lg border text-sm text-slate-900 outline-none transition
                ${
                  errors.fullName
                    ? "border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                }`}
            />

            {errors.fullName && (
              <p className="mt-1 text-xs text-red-500">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Username
            </label>

            <input
              {...register("username")}
              placeholder="Enter username"
              className={`w-full h-10 px-3 rounded-lg border text-sm text-slate-900 outline-none transition
                ${
                  errors.username
                    ? "border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                }`}
            />

            {errors.username && (
              <p className="mt-1 text-xs text-red-500">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Mobile Number
            </label>

            <input
              {...register("mobile")}
              placeholder="Enter mobile number"
              className={`w-full h-10 px-3 rounded-lg border text-sm text-slate-900 outline-none transition
                ${
                  errors.mobile
                    ? "border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                }`}
            />

            {errors.mobile && (
              <p className="mt-1 text-xs text-red-500">
                {errors.mobile.message}
              </p>
            )}
          </div>

          {/* PIN */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              POS PIN
            </label>

            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              {...register("pin")}
              placeholder="Enter POS PIN"
              className={`w-full h-10 px-3 rounded-lg border text-sm text-slate-900 outline-none transition
                ${
                  errors.pin
                    ? "border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                }`}
            />

            {errors.pin && (
              <p className="mt-1 text-xs text-red-500">
                {errors.pin.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Role
            </label>

            <select
              {...register("role")}
              className={`w-full h-10 px-3 rounded-lg border bg-white text-sm text-slate-900 outline-none transition
                ${
                  errors.role
                    ? "border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                }`}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            {errors.role && (
              <p className="mt-1 text-xs text-red-500">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Status
            </label>

            <select
              {...register("status")}
              className={`w-full h-10 px-3 rounded-lg border bg-white text-sm text-slate-900 outline-none transition
                ${
                  errors.status
                    ? "border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                }`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {errors.status && (
              <p className="mt-1 text-xs text-red-500">
                {errors.status.message}
              </p>
            )}
          </div>

        </div>

        {/* Role Information */}
        <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-100">
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-800">
              Admin:
            </span>{" "}
            Full POS access including settings, reports, discounts,
            refunds, inventory and user management.
          </p>

          <p className="text-sm text-slate-600 mt-1">
            <span className="font-medium text-slate-800">
              User:
            </span>{" "}
            Standard POS access for daily sales operations.
          </p>
        </div>

      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">

        <button
          type="button"
          onClick={() => router.push("/admin/store-pos")}
          className="h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-10 px-5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? "Creating..." : "Create POS User"}
        </button>

      </div>
    </form>
  </div>
</div>
 

);
}
