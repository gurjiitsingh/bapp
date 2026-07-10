"use client";

import { deleteDepartment } from "@/app/(universal)/action/department/deleteDepartment";
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
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">
          Departments
        </h1>
        <p className="text-sm text-gray-500">
          Manage all departments
        </p>
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
                    className={`px-2 py-1 rounded text-xs ${
                      dep.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {dep.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </td>

               <td className="p-3 text-right space-x-2">
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