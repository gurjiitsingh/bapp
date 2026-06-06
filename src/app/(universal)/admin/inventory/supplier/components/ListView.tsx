"use client";

import { deleteInventoryItemSupplier } from "@/app/(universal)/action/inventoryItemSupplier/deleteInventoryItemSupplier";
import { Supplier } from "@/lib/types/SupplierType";
import Link from "next/link";
import { useTransition } from "react";

import {
  CiEdit,
  CiTrash,
  CiWallet,
} from "react-icons/ci";



type Props = {
  suppliers: Supplier[];
};

export default function ListView({
  suppliers,
}: Props) {
  
  if (
    !suppliers ||
    suppliers.length === 0
  ) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-semibold text-gray-700">
          No Suppliers Found
        </h2>

        <p className="text-sm text-gray-500 mt-2">
          Create your first supplier.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left px-4 py-3 text-sm font-semibold">
              Company
            </th>

            <th className="text-left px-4 py-3 text-sm font-semibold">
              Contact
            </th>

            <th className="text-left px-4 py-3 text-sm font-semibold">
              Phone
            </th>

            <th className="text-left px-4 py-3 text-sm font-semibold">
              City
            </th>

            <th className="text-left px-4 py-3 text-sm font-semibold">
              GST No.
            </th>

            <th className="text-left px-4 py-3 text-sm font-semibold">
              Type
            </th>

            <th className="text-left px-4 py-3 text-sm font-semibold">
              Status
            </th>

            <th className="text-center px-4 py-3 text-sm font-semibold">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {suppliers.map(
            (item) => (
              <tr
                key={item.id}
                className="border-b hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">
                    {item.companyName}
                  </div>
                </td>

                <td className="px-4 py-3 text-sm text-gray-600">
                  {item.contactPerson}
                </td>

                <td className="px-4 py-3">
                  {item.phone}
                </td>

                <td className="px-4 py-3">
                  {item.city || "-"}
                </td>

                <td className="px-4 py-3 text-sm">
                  {item.gstNumber || "-"}
                </td>

                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-lg bg-slate-100 text-yellow-900 text-xs font-medium capitalize">
                    {item.type}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${item.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                      }`}
                  >
                    {item.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">

                    {/* ✅ NEW: Supplier Account */}
                    <Link
                      href={`/admin/inventory/supplier/${item.id}`}
                    >
                      <button className="h-9 w-9 rounded-xl bg-slate-300 text-white flex items-center justify-center">
                        <CiWallet size={18} />
                      </button>
                    </Link>

                    {/* EDIT */}
                    <Link
                      href={`/admin/inventory/supplier/edit/${item.id}`}
                    >
                      <button className="h-9 w-9 rounded-xl bg-emerald-200 text-white flex items-center justify-center">
                        <CiEdit size={18} />
                      </button>
                    </Link>

                    {/* DELETE */}
                    <DeleteButton id={item.id} />

                  </div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

function DeleteButton({
  id,
}: {
  id: string;
}) {
  const [
    isPending,
    startTransition,
  ] = useTransition();

  const handleDelete =
    () => {
      const confirmed =
        window.confirm(
          "Delete this supplier?"
        );

      if (!confirmed)
        return;

      startTransition(
        async () => {
          const result =
            await deleteInventoryItemSupplier(
              id
            );

          if (
            result?.errors
          ) {
            alert(
              result.errors
                .general
            );
            return;
          }

          alert(
            "Supplier deleted successfully"
          );
        }
      );
    };

  return (
    <button
      onClick={
        handleDelete
      }
      disabled={
        isPending
      }
      className="h-9 w-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center"
    >
      <CiTrash size={18} />
    </button>
  );
}