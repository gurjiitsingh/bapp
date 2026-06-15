import React from "react";
import Link from "next/link";

import { getMasterCategories } from "@/app/(universal)/action/master-category/getMasterCategories";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import { FiEdit, FiPlus } from "react-icons/fi";

import DeleteButton from "./components/delete";

const Page = async () => {
  const masterCategories =
    await getMasterCategories();

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      {/* <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Master Categories
          </h1>

          <p className="text-muted-foreground mt-1">
            Manage reusable master categories like
            Veg, Non Veg, Vegan, Men, Women and Children.
          </p>
        </div>

        <Link href="/admin/master-category/add">
          <Button className="gap-2">
            <FiPlus size={18} />
            Add Master Category
          </Button>
        </Link>
      </div> */}

         <div className="mb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white rounded-2xl p-4 shadow-sm">

          {/* Left Side */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              {/* Right Side */}
              <Link href="/admin/categories">
                <Button
                  className="
          h-10
          rounded-xl
          bg-slate-400
          hover:bg-[#00796b]
          text-white
          shadow-none
        "
                >
                  Categories
                </Button>
              </Link>


            </div>

          </div>
          <div className="flex gap-2">
            {/* Right Side */}
            {/* <Link href="/admin/categories/display-category">
              <Button
                className="
          h-10
          rounded-xl
          bg-slate-400
          hover:bg-[#00796b]
          text-white
          shadow-none
        "
              >
                All Categories
              </Button>
            </Link> */}

            <Link href="/admin/master-category/add">
              <Button
                className="
          h-10
          rounded-xl
          bg-slate-400
          hover:bg-[#00796b]
          text-white
          shadow-none
        "
              >
                + Add Master Category
              </Button>
            </Link>
          </div>

        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-800   mb-6">
       Master Categories
      </h3>

      {/* Summary Card */}
      <div
        className="
          rounded-2xl
          bg-gradient-to-r
          from-teal-50
          to-cyan-50
          p-6
          shadow-sm
        "
      >
        <div>
          <p className="text-sm text-gray-600">
            Total Master Categories
          </p>

          <h2 className="text-4xl font-bold text-gray-800 mt-2">
            {masterCategories.length}
          </h2>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead>Name</TableHead>

              <TableHead>
                Description
              </TableHead>

              <TableHead>
                Sort Order
              </TableHead>

              <TableHead>
                Status
              </TableHead>

              <TableHead className="text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {masterCategories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-muted-foreground"
                >
                  No master categories found
                </TableCell>
              </TableRow>
            ) : (
              masterCategories.map(
                (
                  item: any,
                  index: number
                ) => (
                  <TableRow
                    key={item.id}
                    className={`
                      whitespace-nowrap
                      hover:bg-green-50
                      transition
                      ${
                        index % 2 === 0
                          ? "bg-white"
                          : "bg-slate-50"
                      }
                    `}
                  >
                    <TableCell className="font-medium">
                      {item.name}
                    </TableCell>

                    <TableCell className="max-w-xs truncate">
                      {item.description || "-"}
                    </TableCell>

                    <TableCell>
                      {item.sortOrder || 0}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`
                          px-3
                          py-1
                          rounded-full
                          text-xs
                          font-medium
                          ${
                            item.isActive ===
                            "yes"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }
                        `}
                      >
                        {item.isActive === "yes"
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/master-category/edit/${item.id}`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="
                              hover:bg-green-50
                            "
                          >
                            <FiEdit size={18} />
                          </Button>
                        </Link>

                        <DeleteButton
                          id={item.id}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Page;