"use client";

import { deleteDepartment } from "@/app/(universal)/action/department/deleteDepartment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

type Department = {
  id: string;
  name: string;
  code: string;
  type: string;
  managerName?: string;
  isActive: boolean;
};

const DepartmentTable = ({
  departments,
}: {
  departments: Department[];
}) => {


  const router = useRouter();

  async function handleDelete(id: string) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this department?"
    );

    if (!confirmDelete) return;

    const res = await deleteDepartment(id);

    alert(res.message);

    if (res.success) {
      router.refresh();
    }
  }

  return (
    <div className="p-5">
      {/* Header */}
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Departments
          </h1>

          <p className="text-sm text-gray-500">
            Manage all departments
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/admin/stock-finished/department/issue-stock/add"
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#00796b]"
          >
            Issue Stock
          </Link>
            <Link
            href="/admin/stock-finished/department/return-stock/add"
            className="inline-flex items-center justify-center rounded-xl bg-slate-400 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#00796b]"
          >
            Return Stock to main store
          </Link>
          <Link
            href="/admin/stock-finished/department/add"
            className="inline-flex items-center justify-center rounded-xl bg-[#00897b] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#00796b]"
          >
            + Add Department
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">
                Name
              </th>
              <th className="text-left p-3">
                Code
              </th>
              <th className="text-left p-3">
                Type
              </th>
              <th className="text-left p-3">
                Manager
              </th>
              <th className="text-left p-3">
                Status
              </th>
              <th className="text-right p-3">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {departments.map((dep) => (
              <tr
                key={dep.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-3 font-medium">
                  {dep.name}
                </td>

                <td className="p-3">
                  {dep.code}
                </td>

                <td className="p-3">
                  {dep.type}
                </td>

                <td className="p-3">
                  {dep.managerName || "-"}
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${dep.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}
                  >
                    {dep.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </td>

                <td className="p-3 text-right font-bold space-x-2 ">
                  <div className="flex gap-6 justify-end">
                    <Link
                      href={`/admin/stock-finished/department/department-stock/${dep.id}`}
                      className="group"
                    >Stock</Link>
                    <button
                      onClick={() =>
                        router.push(`/admin/departments/edit/${dep.id}`)
                      }
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(dep.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {departments.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center p-6 text-gray-400"
                >
                  No departments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentTable;