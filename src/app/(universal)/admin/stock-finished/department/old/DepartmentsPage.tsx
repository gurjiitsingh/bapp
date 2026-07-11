"use client";

import Link from "next/link";
import { DepartmentType } from "@/lib/types/department/DepartmentType";
import { Factory, Wrench, ChevronRight } from "lucide-react";

export default function DepartmentsPage({
  departments,
}: {
  departments: DepartmentType[];
}) {
  if (departments.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
        No departments found.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {departments.map((department) => (
        <DepartmentCard
          key={department.id}
          department={department}
        />
      ))}
    </div>
  );
}

function DepartmentCard({
  department,
}: {
  department: DepartmentType;
}) {
  const isProduction =
    department.type === "PRODUCTION";

  return (
    <Link
      href={`/admin/stock-finished/department/department-stock/${department.id}`}
      className="group"
    >
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">

        <div className="flex items-start justify-between">

          <div className="flex items-center gap-3">

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                isProduction
                  ? "bg-emerald-100"
                  : "bg-blue-100"
              }`}
            >
              {isProduction ? (
                <Factory
                  size={20}
                  className="text-emerald-600"
                />
              ) : (
                <Wrench
                  size={20}
                  className="text-blue-600"
                />
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">
                {department.name}
              </h3>

              <p className="text-xs text-gray-500">
                {department.code}
              </p>
            </div>

          </div>

          <ChevronRight
            size={18}
            className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-emerald-600"
          />

        </div>

        <div className="mt-4 flex items-center justify-between">

          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              isProduction
                ? "bg-emerald-50 text-emerald-700"
                : "bg-blue-50 text-blue-700"
            }`}
          >
            {department.type}
          </span>

          <span
            className={`rounded-full px-2.5 py-1 text-xs ${
              department.isActive
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {department.isActive
              ? "Active"
              : "Inactive"}
          </span>

        </div>

        {department.managerName && (
          <div className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-600">
            <span className="text-gray-400">
              Manager:
            </span>{" "}
            <span className="font-medium">
              {department.managerName}
            </span>
          </div>
        )}

      </div>
    </Link>
  );
}