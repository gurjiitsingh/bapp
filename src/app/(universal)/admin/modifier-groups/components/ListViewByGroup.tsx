"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useSearchParams, useRouter } from "next/navigation";
import TableRows from "./TableRowsByGroup";
import { deleteModifierItem } from "@/app/(universal)/action/modifiers/dbOperation";

export default function ListView({
  initialItems,
}: {
  initialItems: any[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get("search") || "";

  const [items, setItems] = useState<any[]>(initialItems);
  const [filtered, setFiltered] = useState<any[]>(initialItems);

  // ✅ DELETE HANDLER (MAIN ADDITION)
const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

async function handleDeleteLocal(id: string) {
  try {
    setDeleteLoading(id);

    const res = await deleteModifierItem(id);

    if (res?.errors) {
      alert(res.errors.general);
      return;
    }

    // ✅ remove from UI
    setItems((prev) => prev.filter((i) => i.id !== id));

  } catch (e) {
    alert("Delete failed");
  } finally {
    setDeleteLoading(null);
  }
}

  useEffect(() => {
    let list = [...items];

    // 🔍 Search
    if (urlSearch) {
      list = list.filter((i) =>
        i.name?.toLowerCase().includes(urlSearch.toLowerCase())
      );
    }

    // 🔢 Sort
    list = list.sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );

    setFiltered(list);
  }, [items, urlSearch]);

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
          placeholder="Search modifier item..."
          className="w-full md:w-1/2 p-2 border rounded"
        />
      </div>

      {/* 📊 Table */}
      <div className="bg-slate-50 rounded-lg p-1 overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sort</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  No items found
                </td>
              </TableRow>
            ) : (
              filtered.map((item) => (
               <TableRows
  key={item.id}
  item={item}
  onDelete={handleDeleteLocal}
  deleteLoading={deleteLoading}
/>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}