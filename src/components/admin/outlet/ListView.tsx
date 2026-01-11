"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


import { OutletType } from "@/lib/types/outletType";
import OutletRow from "./OutletRow";
import Link from "next/link";


const OutletListView = () => {
  const [outlet, setOutlet] = useState<OutletType | null>(null);

  useEffect(() => {
    async function loadOutlet() {
      try {
        const res = await fetch("/api/outlet", { cache: "no-store" });
        const data = await res.json();

        // single outlet → store as object
        setOutlet(data ?? null);
      } catch (error) {
        console.error("Failed to fetch outlet:", error);
        setOutlet(null);
      }
    }

    loadOutlet();
  }, []);



  return (
    <div className="mt-6">
      <h3 className="flex gap-3 items-center text-3xl font-bold text-gray-800 dark:text-white mb-6">
     <span>Outlet</span>      <Link href='/admin/outlet/form'><button className="bg-[#313131] text-sm text-white px-4 py-2 rounded-lg">Create</button></Link>
 
      </h3>
      <div className="rounded-2xl shadow-md border border-gray-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-900">
        <Table>
         <TableHeader className="bg-gray-100 dark:bg-zinc-800">
  <TableRow>
    <TableHead>Name</TableHead>
    <TableHead>Full Address</TableHead>
    <TableHead>Phone</TableHead>
    <TableHead>Status</TableHead>
    <TableHead>Printer</TableHead>
    <TableHead>Action</TableHead>
  </TableRow>
</TableHeader>

          <TableBody>
            {outlet ? (
              <OutletRow outlet={outlet} />
            ) : (
              <TableRow>
                <td
                  colSpan={6}
                  className="text-center py-6 text-gray-500"
                >
                  No outlet found
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OutletListView;
