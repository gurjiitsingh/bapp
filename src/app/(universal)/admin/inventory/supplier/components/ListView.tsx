"use client";

import Link from "next/link";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  CiEdit,
  CiTrash,
  CiWallet,
} from "react-icons/ci";

import {
  Search,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { deleteInventoryItemSupplier } from "@/app/(universal)/action/inventoryItemSupplier/deleteInventoryItemSupplier";

import { SupplierType } from "@/lib/types/SupplierType";

type Props = {
  suppliers?: SupplierType[];
};

export default function ListView({
  suppliers = [],
}: Props) {

  const [search, setSearch] =
    useState("");

  // =====================================================
  // SEARCH FILTER
  // =====================================================

  const filteredSuppliers =
    useMemo(() => {

      const query =
        search.toLowerCase().trim();

      if (!query)
        return suppliers;

      return suppliers.filter(
        (item) => {

          return (
            item.companyName
              ?.toLowerCase()
              .includes(query) ||

            item.contactPerson
              ?.toLowerCase()
              .includes(query) ||

            item.phone
              ?.toLowerCase()
              .includes(query) ||

            item.city
              ?.toLowerCase()
              .includes(query) ||

            item.gstNumber
              ?.toLowerCase()
              .includes(query) ||

            item.type
              ?.toLowerCase()
              .includes(query)
          );
        }
      );
    }, [suppliers, search]);

  // =====================================================
  // EMPTY STATE
  // =====================================================

  if (suppliers.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
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
    <div className="space-y-4">

      {/* ===================================================== */}
      {/* SEARCH */}
      {/* ===================================================== */}

      <div className="rounded-2xl border border-gray-100 bg-white p-4">

        <div className="relative max-w-md">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <Input
            placeholder="Search supplier..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="pl-10 h-11 rounded-xl"
          />

        </div>

        <p className="text-xs text-gray-500 mt-2">
          Showing{" "}
          {filteredSuppliers.length}{" "}
          of {suppliers.length} suppliers
        </p>

      </div>

      {/* ===================================================== */}
      {/* TABLE */}
      {/* ===================================================== */}

      <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white">

        <Table className="text-sm">

          {/* ===================================================== */}
          {/* HEADER */}
          {/* ===================================================== */}

          <TableHeader className="bg-zinc-200">

            <TableRow>

              <TableHead>
                Company
              </TableHead>

              <TableHead>
                Contact
              </TableHead>

              <TableHead>
                Phone
              </TableHead>

              <TableHead>
                City
              </TableHead>

              <TableHead>
                GST No.
              </TableHead>

              <TableHead>
                Type
              </TableHead>

              <TableHead>
                Status
              </TableHead>

              <TableHead className="text-center">
                Action
              </TableHead>

            </TableRow>

          </TableHeader>

          {/* ===================================================== */}
          {/* BODY */}
          {/* ===================================================== */}

          <TableBody>

            {filteredSuppliers.length >
            0 ? (

              filteredSuppliers.map(
                (item) => (

                  <TableRow
                    key={item.id}
                    className="
                      whitespace-nowrap
                      transition-colors
                      odd:bg-zinc-50
                      even:bg-zinc-100
                      hover:bg-blue-50
                      border-b border-zinc-200
                    "
                  >

                    {/* COMPANY */}

                    <TableCell className="font-medium text-gray-800">
                      {
                        item.companyName
                      }
                    </TableCell>

                    {/* CONTACT */}

                    <TableCell className="text-gray-600">
                      {item.contactPerson ||
                        "-"}
                    </TableCell>

                    {/* PHONE */}

                    <TableCell>
                      {item.phone ||
                        "-"}
                    </TableCell>

                    {/* CITY */}

                    <TableCell>
                      {item.city ||
                        "-"}
                    </TableCell>

                    {/* GST */}

                    <TableCell>
                      {item.gstNumber ||
                        "-"}
                    </TableCell>

                    {/* TYPE */}

                    <TableCell>

                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 capitalize">
                        {item.type}
                      </span>

                    </TableCell>

                    {/* STATUS */}

                    <TableCell>

                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </TableCell>

                    {/* ACTIONS */}

                    <TableCell>

                      <div className="flex items-center justify-center gap-2">

                        {/* ACCOUNT */}

                        <Link
                          href={`/admin/inventory/supplier/${item.id}`}
                        >
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="h-9 w-9 rounded-xl border-slate-200 hover:bg-slate-100"
                          >
                            <CiWallet size={18} />
                          </Button>
                        </Link>

                        {/* EDIT */}

                        <Link
                          href={`/admin/inventory/supplier/edit/${item.id}`}
                        >
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="h-9 w-9 rounded-xl border-emerald-200 hover:bg-emerald-50"
                          >
                            <CiEdit size={18} />
                          </Button>
                        </Link>

                        {/* DELETE */}

                        <DeleteButton
                          id={item.id}
                        />

                      </div>

                    </TableCell>

                  </TableRow>
                )
              )

            ) : (

              <TableRow>

                <TableCell
                  colSpan={8}
                  className="py-16 text-center"
                >

                  <div className="flex flex-col items-center gap-2">

                    <div className="h-14 w-14 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                      <Search size={24} />
                    </div>

                    <p className="font-medium text-gray-600">
                      No suppliers found
                    </p>

                    <p className="text-sm text-gray-400">
                      Try different search keywords
                    </p>

                  </div>

                </TableCell>

              </TableRow>
            )}

          </TableBody>

        </Table>

      </div>
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

  function handleDelete() {

    const confirmed =
      window.confirm(
        "Delete this supplier?"
      );

    if (!confirmed) return;

    startTransition(async () => {

      const result =
        await deleteInventoryItemSupplier(
          id
        );

      if (result?.errors) {

        alert(
          result.errors.general
        );

        return;
      }

      alert(
        "Supplier deleted successfully"
      );
    });
  }

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      disabled={isPending}
      onClick={handleDelete}
      className="h-9 w-9 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
    >
      <CiTrash size={18} />
    </Button>
  );
}