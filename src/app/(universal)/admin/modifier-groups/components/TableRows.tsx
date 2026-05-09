"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MdDeleteForever } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import Link from "next/link";
import { useState } from "react";
import { deleteModifierGroup } from "@/app/(universal)/action/modifierGroups/dbOperation";
import { useRouter } from "next/navigation";



export default function TableRows({ group }: any) {


  const [status, setStatus] = useState(group.status);

// ✅ separate loading states (IMPORTANT)
const [statusLoading, setStatusLoading] = useState(false);
const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [loading, setLoading] = useState(false);

  const isSingle = group.maxSelection === 1;

// const group = group.group;
  const statusStyles = {
    published: "bg-green-100 text-green-800",
    draft: "bg-yellow-100 text-yellow-800",
  };



const router = useRouter();

  async function toggleStatus() {
    const newStatus = status === "published" ? "draft" : "published";

    setStatus(newStatus);
    setLoading(true);

    try {
      const res = await fetch("/api/modifier-groups/toggle-status", {
        method: "POST",
        body: JSON.stringify({
          id: group.id,
          status: newStatus,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setStatus(status);
        alert("Failed to update status");
      }
    } catch (e) {
      setStatus(status);
      alert("Error updating");
    }

    setLoading(false);
  }

async function handleDelete() {
  if (!confirm("Delete this modifier group?")) return;

  setDeleteLoading(true);

  const res = await deleteModifierGroup(group.id);

  setDeleteLoading(false);

  if (res?.errors) {
    alert(res.errors.general);
    return;
  }

  router.refresh(); // ✅ best
}

  return (
    <TableRow className="hover:bg-green-50 transition">

      {/* Name */}
      
      <Link href={`/admin/modifier-groups/${group.id}`}>
  <span className="text-blue-600 underline cursor-pointer">
 {group.name}
  </span>
</Link>

      {/* Type */}
      <TableCell className="text-slate-600">
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            isSingle
              ? "bg-blue-100 text-blue-700"
              : "bg-purple-100 text-purple-700"
          }`}
        >
          {isSingle ? "Single Choice" : "Multiple Choice"}
        </span>
      </TableCell>

      {/* Min */}
      <TableCell className="text-slate-600">
        {group.minSelection}
      </TableCell>

      {/* Max */}
      <TableCell className="text-slate-600">
        {group.maxSelection}
      </TableCell>

      {/* Usage */}
      <TableCell className="text-slate-700 font-semibold">
        {group.usageCount ?? 0}
      </TableCell>

      {/* Status */}
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

      {/* Sort */}
      <TableCell className="text-slate-600">
        {group.sortOrder}
      </TableCell>

      {/* Actions */}
      <TableCell>
        <div className="flex gap-2">

          <Link
            href={{
              pathname: "/admin/modifier-groups/edit",
              query: { id: group.id },
            }}
          >
            <Button size="sm" className="bg-emerald-600 text-white">
              <CiEdit size={18} />
            </Button>
          </Link>

          <Button
            onClick={handleDelete}
            size="sm"
            className="bg-rose-600 text-white"
          >
            <MdDeleteForever size={18} />
          </Button>

        </div>
      </TableCell>
    </TableRow>
  );
}