"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, TsignUpSchema } from "@/lib/types/userType";
import { addUserDirect } from "@/app/(universal)/action/user/dbOperation";
import { useRouter } from "next/navigation";
import { createUserSchema, TCreateUserSchema } from "@/lib/types/createUserSchema";

export default function RegisterForm() {
  const router = useRouter();

const {
  register,
  handleSubmit,
  formState: {
    errors,
    isSubmitting,
  },
} = useForm<TCreateUserSchema>({
  resolver: zodResolver(createUserSchema),
});

  const onSubmitUserRegister = async (
  data: TCreateUserSchema
) => {
    const formData = new FormData();
  formData.append("fullName", data.fullName);
formData.append("username", data.username);
formData.append("email", data.email);
formData.append("mobile", data.mobile);
formData.append("password", data.password);
formData.append("confirmPassword", data.confirmPassword);
formData.append("role", data.role);
formData.append("status", data.status);
formData.append("employeeId", data.employeeId ?? "");
formData.append("department", data.department ?? "");
formData.append("address", data.address ?? "");
formData.append("notes", data.notes ?? "");

// Object.entries(data).forEach(([key, value]) => {
//   formData.append(key, String(value ?? ""));
// });

    const result = await addUserDirect(formData);
    if (result) {
      router.push("/user");
    }
  };

return (
 <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 flex  ">
  <div className="w-full max-w-4xl  ">
    {/* Header */}
    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Create User
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Register employees, customers, and ERP users seamlessly.
        </p>
      </div>
    </div>

    <form
      onSubmit={handleSubmit(onSubmitUserRegister)}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div className="p-6 md:p-10 space-y-10">
        
        {/* Section: Basic Information */}
        <div>
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Basic Information</h2>
            <p className="text-xs text-slate-400">Core personal identification and contact info.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                {...register("fullName")}
                placeholder="John Doe"
                className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200 outline-none ${
                  errors.fullName ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200'
                }`}
              />
              {errors.fullName && (
                <p className="text-rose-500 text-xs font-medium mt-1.5 flex items-center gap-1">
                  • {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                {...register("username")}
                placeholder="johndoe"
                className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200 outline-none ${
                  errors.username ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200'
                }`}
              />
              {errors.username && (
                <p className="text-rose-500 text-xs font-medium mt-1.5 flex items-center gap-1">
                  • {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="john@example.com"
                className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200 outline-none ${
                  errors.email ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200'
                }`}
              />
              {errors.email && (
                <p className="text-rose-500 text-xs font-medium mt-1.5 flex items-center gap-1">
                  • {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-2">
                Mobile Number
              </label>
              <input
                {...register("mobile")}
                placeholder="+1 (555) 000-0000"
                className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200 outline-none ${
                  errors.mobile ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200'
                }`}
              />
              {errors.mobile && (
                <p className="text-rose-500 text-xs font-medium mt-1.5 flex items-center gap-1">
                  • {errors.mobile.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section: Login Details */}
        <div>
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Login Security</h2>
            <p className="text-xs text-slate-400">Set up custom authentication details for safety.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                {...register("password")}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200 outline-none ${
                  errors.password ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200'
                }`}
              />
              {errors.password && (
                <p className="text-rose-500 text-xs font-medium mt-1.5 flex items-center gap-1">
                  • {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                {...register("confirmPassword")}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200 outline-none ${
                  errors.confirmPassword ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200'
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-rose-500 text-xs font-medium mt-1.5 flex items-center gap-1">
                  • {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section: Access Control */}
        <div>
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-lg font-semibold text-slate-800">User Role & Status</h2>
            <p className="text-xs text-slate-400">Manage fine-grained permissions and accessibility state.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-2">
                Assigned Role
              </label>
              <select
                {...register("role")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200 outline-none appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundSize: '1em', backgroundRepeat: 'no-repeat' }}
              >
                <option value="">Select Role</option>
                <option value="admin">Administrator</option>
                <option value="manager">Manager</option>
                <option value="shopkeeper">Shopkeeper</option>
                <option value="cashier">Cashier</option>
                <option value="sales">Sales Executive</option>
                <option value="storekeeper">Store Keeper</option>
                <option value="driver">Driver</option>
                <option value="delivery">Delivery Boy</option>
                <option value="accountant">Accountant</option>
                <option value="customer">Customer</option>
                <option value="supplier">Supplier</option>
                <option value="user">User</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-2">
                Account Status
              </label>
              <select
                {...register("status")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200 outline-none appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundSize: '1em', backgroundRepeat: 'no-repeat' }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section: Employee Info */}
        <div>
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Employee Profile</h2>
            <p className="text-xs text-slate-400">Fill this out if the new user belongs to internal staff.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-2">
                Employee ID
              </label>
              <input
                {...register("employeeId")}
                placeholder="EMP-001"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-2">
                Department
              </label>
              <select
                {...register("department")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200 outline-none appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundSize: '1em', backgroundRepeat: 'no-repeat' }}
              >
                <option value="">Select Department</option>
                <option value="management">Management</option>
                <option value="sales">Sales</option>
                <option value="inventory">Inventory</option>
                <option value="accounts">Accounts</option>
                <option value="production">Production</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
          </div>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-2">
              Address
            </label>
            <textarea
              rows={3}
              {...register("address")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200 outline-none resize-none"
              placeholder="123 Modern St, Suite 100..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-2">
              Notes
            </label>
            <textarea
              rows={4}
              {...register("notes")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200 outline-none resize-none"
              placeholder="Add any internal onboarding notes here..."
            />
          </div>
        </div>

      </div>

      {/* Footer / Actions panel */}
      <div className="flex justify-end items-center gap-3 bg-slate-50 px-6 md:px-10 py-5 border-t border-slate-100">
        <button
          type="button"
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 transition duration-150 outline-none"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-500/10 transition duration-150 outline-none"
        >
          {isSubmitting ? "Creating User..." : "Create User"}
        </button>
      </div>
    </form>
  </div>
</div>
);
}
