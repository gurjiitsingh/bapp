"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MdDeleteForever } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import Link from "next/link";
import { useState } from "react";

export default function TableRows({
  item,
  onDelete,
  deleteLoading,
}: any) {
  if (!item) return null;

  const [status, setStatus] = useState(item.status || "draft");
  const [loading, setLoading] = useState(false);

  const statusStyles: any = {
    published: "bg-green-100 text-green-800",
    draft: "bg-yellow-100 text-yellow-800",
  };

  async function toggleStatus() {
    const prevStatus = status;
    const newStatus = status === "published" ? "draft" : "published";

    setStatus(newStatus);
    setLoading(true);

    try {
      const res = await fetch("/api/modifier-items/toggle-status", {
        method: "POST",
        body: JSON.stringify({
          id: item.id,
          status: newStatus,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setStatus(prevStatus);
        alert("Failed to update status");
      }
    } catch (e) {
      setStatus(prevStatus);
      alert("Error updating status");
    }

    setLoading(false);
  }

  // ✅ FIXED DELETE
  function handleDelete() {
    if (!confirm("Delete this modifier item?")) return;

    onDelete(item.id); // ✅ call parent
  }

  return (
    <TableRow className="hover:bg-green-50 transition">

      <TableCell className="font-medium text-slate-700">
      
        
            {item.name}
        
       
      </TableCell>

      <TableCell className="text-slate-600">
         {item.price}
      </TableCell>

      <TableCell className="text-slate-600">
        {item.isDefault ? "Yes" : "No"}
      </TableCell>

      <TableCell>
        <button
          onClick={toggleStatus}
          disabled={loading}
          className={`text-xs px-2 py-1 rounded-full font-semibold capitalize ${
            statusStyles[status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {loading ? "..." : status}
        </button>
      </TableCell>

      <TableCell className="text-slate-600">
        {item.sortOrder}
      </TableCell>

      <TableCell>
        <div className="flex gap-2">

          <Link href={`/admin/modifiers/edit?id=${item.id}`}>
            <Button size="sm" className="bg-emerald-600 text-white">
              <CiEdit size={18} />
            </Button>
          </Link>

          <Button
            onClick={handleDelete}
            size="sm"
            disabled={deleteLoading === item.id}
            className="bg-rose-600 text-white"
          >
            {deleteLoading === item.id ? "..." : <MdDeleteForever size={18} />}
          </Button>

        </div>
      </TableCell>

    </TableRow>
  );
}