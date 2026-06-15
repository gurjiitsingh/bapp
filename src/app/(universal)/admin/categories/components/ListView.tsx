"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import TableRows from "./TableRows";
import { categoryType } from "@/lib/types/categoryType";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ListView = () => {
  const [categoryData, setCategoryData] = useState<categoryType[]>([]);



  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        const data = await res.json();

        // Ensure we ALWAYS set an array
        setCategoryData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategoryData([]); // Fallback to safe empty array
      }
    }

    loadCategories();
  }, []);

  //  <div className="flex justify-start gap-3">

  //       <Link href='/admin/categories/form'><button className="bg-[#313131] text-sm text-white px-4 py-2 rounded-lg">Create</button></Link>
  //      <Link href='/admin/categories/display-category'><button className="bg-[#313131] text-sm text-white px-4 py-2 rounded-lg">Display catgory</button></Link>
  //       </div>


  return (
    <div className="mt-6">

      <div className="mb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white rounded-2xl p-4 shadow-sm">

          {/* Left Side */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              {/* Right Side */}
              <Link href="/admin/master-category">
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
                  Master Category
                </Button>
              </Link>


            </div>

          </div>
          <div className="flex gap-2">
            {/* Right Side */}
            <Link href="/admin/categories/display-category">
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
                Display Category
              </Button>
            </Link>

            <Link href="/admin/categories/form">
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
                + Add Category
              </Button>
            </Link>
          </div>

        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        Categories
      </h3>

      <div className="rounded-2xl shadow-md border border-gray-200 dark:border-zinc-200 overflow-hidden bg-white dark:border-zinc-200">
        <Table>
          <TableHeader className="bg-gray-100 dark:border-zinc-200">
            <TableRow>
              <TableHead className="hidden md:table-cell text-sm text-gray-700 dark:text-gray-300">
                Image
              </TableHead>
              <TableHead className="hidden md:table-cell text-sm text-gray-700 dark:text-gray-300">
                Name
              </TableHead>
              <TableHead className="hidden md:table-cell text-sm text-gray-700 dark:text-gray-300">
                Active
              </TableHead>
              <TableHead className="text-sm text-gray-700 dark:text-gray-300">
                Description
              </TableHead>
              <TableHead>Tax</TableHead>
              <TableHead className="hidden md:table-cell text-sm text-gray-700 dark:text-gray-300">
                Action
              </TableHead>
              <TableHead className="text-sm text-gray-700 dark:text-gray-300">
                Related Products
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {categoryData.map((category) => (
              <TableRows key={category.name} category={category} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ListView;
