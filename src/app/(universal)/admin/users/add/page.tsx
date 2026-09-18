"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  createUserSchema,
  TCreateUserSchema,
} from "@/lib/types/createUserSchema";

import { addUserDashboard } from "@/app/(universal)/action/user/addUserDashboard";

export default function RegisterForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TCreateUserSchema>({
    resolver: zodResolver(createUserSchema),
  });

  // =====================================================
  // SUBMIT USER
  // =====================================================

  const onSubmitUserRegister = async (data: TCreateUserSchema) => {
    try {
      const formData = new FormData();

      formData.append("fullName", data.fullName);
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("mobile", data.mobile);
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);
      formData.append("role", data.role);
      formData.append("status", data.status);

      // Employee ID removed

      formData.append(
        "department",
        data.department ?? ""
      );

      formData.append(
        "address",
        data.address ?? ""
      );

      formData.append(
        "notes",
        data.notes ?? ""
      );

      const result = await addUserDashboard(formData);

      if (result.success) {
        toast.success(result.message);
        router.push("/admin/users");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(
        "Error creating user:",
        error
      );

      toast.error(
        "Something went wrong while creating the user."
      );
    }
  };

  return (
    <div className="my-5">

      {/* =====================================================
          TOP NAVIGATION
      ===================================================== */}

      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">

        {/* Left Side */}

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex gap-2">
            <Link href="/admin/users">
              <Button
                type="button"
                className="
                  h-10
                  rounded-xl
                  bg-slate-400
                  text-white
                  shadow-none
                  hover:bg-[#00796b]
                "
              >
                All Users
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Side */}

        <div className="flex gap-2">
          <Link href="/admin/users">
            <Button
              type="button"
              className="
                h-10
                rounded-xl
                bg-slate-400
                text-white
                shadow-none
                hover:bg-[#00796b]
              "
            >
              User List
            </Button>
          </Link>
        </div>
      </div>

      {/* =====================================================
          FORM
      ===================================================== */}

      <form
        onSubmit={handleSubmit(
          onSubmitUserRegister
        )}
      >
        <div className="flex flex-col gap-4 p-5">

          <h1 className="mb-2 text-2xl font-semibold">
            Add User
          </h1>

          <div className="flex flex-col gap-5 lg:flex-row">

            {/* =================================================
                LEFT COLUMN
            ================================================= */}

            <div className="flex flex-1 flex-col gap-y-5">

              {/* ===============================================
                  USER INFORMATION
              =============================================== */}

              <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4">

                <h2 className="font-semibold">
                  User Information
                </h2>

                {/* Full Name */}

                <div className="flex w-full flex-col gap-1">
                  <label className="label-style">
                    Full Name{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    {...register("fullName")}
                    className="input-style"
                    placeholder="Enter full name"
                  />

                  {errors.fullName && (
                    <span className="error-text">
                      {errors.fullName.message}
                    </span>
                  )}
                </div>

                {/* Username */}

                <div className="flex w-full flex-col gap-1">
                  <label className="label-style">
                    Username{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    {...register("username")}
                    className="input-style"
                    placeholder="Enter username"
                  />

                  {errors.username && (
                    <span className="error-text">
                      {errors.username.message}
                    </span>
                  )}
                </div>

                {/* Email */}

                <div className="flex w-full flex-col gap-1">
                  <label className="label-style">
                    Email Address{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="email"
                    {...register("email")}
                    className="input-style"
                    placeholder="Enter email address"
                  />

                  {errors.email && (
                    <span className="error-text">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                {/* Mobile */}

                <div className="flex w-full flex-col gap-1">
                  <label className="label-style">
                    Mobile Number{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    {...register("mobile")}
                    className="input-style"
                    placeholder="Enter mobile number"
                  />

                  {errors.mobile && (
                    <span className="error-text">
                      {errors.mobile.message}
                    </span>
                  )}
                </div>
              </div>

              {/* ===============================================
                  LOGIN DETAILS
              =============================================== */}

              <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">

                <h2 className="text-lg font-semibold text-gray-800">
                  Login Details
                </h2>

                {/* Password */}

                <div className="flex flex-col gap-1">
                  <label className="label-style">
                    Password{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      {...register("password")}
                      className="input-style pr-11"
                      placeholder="Enter password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        text-slate-500
                        hover:text-slate-700
                      "
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="error-text">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}

                <div className="flex flex-col gap-1">
                  <label className="label-style">
                    Confirm Password{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      {...register("confirmPassword")}
                      className="input-style pr-11"
                      placeholder="Confirm password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) => !value
                        )
                      }
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        text-slate-500
                        hover:text-slate-700
                      "
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {errors.confirmPassword && (
                    <p className="error-text">
                      {
                        errors.confirmPassword
                          .message
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                RIGHT COLUMN
            ================================================= */}

            <div className="flex h-full flex-1 flex-col gap-5">

              {/* ===============================================
                  ROLE & STATUS
              =============================================== */}

              <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4">

                <h2 className="font-semibold">
                  Role & Status
                </h2>

                {/* Role */}

                <div className="flex flex-col gap-1">
                  <label className="label-style">
                    Assigned Role{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    {...register("role")}
                    className="input-style"
                  >
                    <option value="">
                      Select Role
                    </option>

                    <option value="accountant">
                      Accountant
                    </option>

                    <option value="admin">
                      Administrator
                    </option>

                    <option value="captain">
                      Captain
                    </option>

                    <option value="cashier">
                      Cashier
                    </option>

                    <option value="chef">
                      Chef
                    </option>

                    <option value="confectioner">
                      Confectioner
                    </option>

                    <option value="customer">
                      Customer
                    </option>

                    <option value="delivery">
                      Delivery Boy
                    </option>

                    <option value="dispatch_operator">
                      Dispatch Operator
                    </option>

                    <option value="driver">
                      Driver
                    </option>

                    <option value="employee">
                      Employee
                    </option>

                    <option value="head_chef">
                      Head Chef
                    </option>

                    <option value="host">
                      Host
                    </option>

                    <option value="manager">
                      Manager
                    </option>

                    <option value="production_manager">
                      Production Manager
                    </option>

                    <option value="production_supervisor">
                      Production Supervisor
                    </option>

                    <option value="purchase_manager">
                      Purchase Manager
                    </option>

                    <option value="quality_control">
                      Quality Control
                    </option>

                    <option value="restaurant_manager">
                      Restaurant Manager
                    </option>

                    <option value="sales_executive">
                      Sales Executive
                    </option>

                    <option value="sales_manager">
                      Sales Manager
                    </option>

                    <option value="shopkeeper">
                      Shopkeeper
                    </option>

                    <option value="steward">
                      Steward
                    </option>

                    <option value="storekeeper">
                      Store Keeper
                    </option>

                    <option value="supplier">
                      Supplier
                    </option>

                    <option value="user">
                      User
                    </option>

                    <option value="waiter">
                      Waiter
                    </option>

                    <option value="warehouse_assistant">
                      Warehouse Assistant
                    </option>
                  </select>

                  {errors.role && (
                    <p className="error-text">
                      {errors.role.message}
                    </p>
                  )}
                </div>

                {/* Status */}

                <div className="flex flex-col gap-1">
                  <label className="label-style">
                    Account Status{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    {...register("status")}
                    className="input-style"
                  >
                    <option value="active">
                      Active
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>
                  </select>

                  {errors.status && (
                    <p className="error-text">
                      {errors.status.message}
                    </p>
                  )}
                </div>
              </div>

              {/* ===============================================
                  USER DETAILS
              =============================================== */}

              <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4">

                <h2 className="font-semibold">
                  User Details
                </h2>

                {/* Department */}

                <div className="flex flex-col gap-1">
                  <label className="label-style">
                    Department
                  </label>

                  <select
                    {...register("department")}
                    className="input-style"
                  >
                    <option value="">
                      Select Department
                    </option>

                    <option value="management">
                      Management
                    </option>

                    <option value="sales">
                      Sales
                    </option>

                    <option value="inventory">
                      Inventory
                    </option>

                    <option value="accounts">
                      Accounts
                    </option>

                    <option value="production">
                      Production
                    </option>

                    <option value="delivery">
                      Delivery
                    </option>
                  </select>

                  {errors.department && (
                    <p className="error-text">
                      {errors.department.message}
                    </p>
                  )}
                </div>
              </div>

              {/* ===============================================
                  GENERAL DETAILS
              =============================================== */}

              <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4">

                <h2 className="font-semibold">
                  General Detail
                </h2>

                {/* Address */}

                <div className="flex flex-col gap-1">
                  <label className="label-style">
                    Address
                  </label>

                  <textarea
                    {...register("address")}
                    className="textarea-style"
                    placeholder="Enter user address"
                  />

                  {errors.address && (
                    <p className="error-text">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                {/* Notes */}

                <div className="flex flex-col gap-1">
                  <label className="label-style">
                    Notes
                  </label>

                  <textarea
                    {...register("notes")}
                    className="textarea-style"
                    placeholder="Enter any additional notes"
                  />

                  {errors.notes && (
                    <p className="error-text">
                      {errors.notes.message}
                    </p>
                  )}
                </div>

                {/* Save */}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`btn-save ${
                    isSubmitting
                      ? "opacity-80"
                      : ""
                  }`}
                >
                  {isSubmitting
                    ? "Creating..."
                    : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
 
