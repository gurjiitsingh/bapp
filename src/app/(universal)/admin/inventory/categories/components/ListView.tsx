"use client";

import { InventoryCategory } from "@/lib/types/InventoryCategory";
import Link from "next/link";

import {
  CiEdit,
  CiTrash,
} from "react-icons/ci";
import { useTransition } from "react";
import { deleteInventoryCategory } from "../../../../action/inventoryCategory/deleteInventoryCategory";



type Props = {
  categories: InventoryCategory[];
};

export default function ListView({
  categories,
}: Props) {
  if (
    !categories ||
    categories.length === 0
  ) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-semibold text-gray-700">
          No Categories Found
        </h2>

        <p className="text-sm text-gray-500 mt-2">
          Create your first
          inventory category.
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
              Category
            </th>

            <th className="text-left px-4 py-3 text-sm font-semibold">
              Description
            </th>

            <th className="text-left px-4 py-3 text-sm font-semibold">
              Sort
            </th>

            <th className="text-left px-4 py-3 text-sm font-semibold">
              Track
            </th>

            <th className="text-left px-4 py-3 text-sm font-semibold">
              Negative
              Stock
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
          {categories.map(
            (item) => (
              <tr
                key={item.id}
                className="border-b hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">
                    {item.name}
                  </div>
                </td>

                <td className="px-4 py-3 text-sm text-gray-600">
                  {item.description ||
                    "-"}
                </td>

                <td className="px-4 py-3">
                  {
                    item.sortOrder
                  }
                </td>

                <td className="px-4 py-3">
                  {item.trackInventory
                    ? "Yes"
                    : "No"}
                </td>

                <td className="px-4 py-3">
                  {item.allowNegativeStock
                    ? "Yes"
                    : "No"}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      item.isActive
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
                    {/* <Link
                      href={`/admin/inventory/categories/${item.id}`}
                    > */}
                      <button className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                        <CiEdit
                          size={
                            18
                          }
                        />
                      </button>
                    {/* </Link> */}

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
  const [isPending, startTransition] =
    useTransition();

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Delete this category?"
    );

    if (!confirmed) return;

    startTransition(async () => {
      const result =
        await deleteInventoryCategory(id);

      if (result?.errors) {
        alert(
          result.errors.general
        );
        return;
      }

      alert(
        "Category deleted successfully"
      );
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="h-9 w-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center"
    >
      <CiTrash size={18} />
    </button>
  );
}