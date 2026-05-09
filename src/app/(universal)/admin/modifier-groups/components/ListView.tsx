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
import { useSearchParams, useRouter } from "next/navigation";

export default function ListView({ initialGroups }: { initialGroups: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get("search") || "";

  // ✅ Use server data directly
  const [groups, setGroups] = useState<any[]>(initialGroups);
  const [filtered, setFiltered] = useState<any[]>(initialGroups);

  useEffect(() => {
    let list = [...groups];

    // 🔍 Search
    if (urlSearch) {
      list = list.filter((g) =>
        g.name?.toLowerCase().includes(urlSearch.toLowerCase())
      );
    }

    // 🔢 Sort
    list = list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    setFiltered(list);
  }, [groups, urlSearch]);

  function updateURL(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set("search", value);
    else params.delete("search");

    router.push("?" + params.toString());
  }

  return (
    <div className="mt-2">

      {/* 🔍 Search */}
      <div className="mb-4">
        <input
          value={urlSearch}
          onChange={(e) => updateURL(e.target.value)}
          placeholder="Search modifier group..."
          className="w-full md:w-1/2 p-2 border rounded"
        />
      </div>

      <div className="bg-slate-50 rounded-lg p-1 overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Min</TableHead>
              <TableHead>Max</TableHead>
              <TableHead>Used In</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sort</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  No modifier groups found
                </td>
              </TableRow>
            ) : (
              filtered.map((group) => (
                <TableRows key={group.id} group={group} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}