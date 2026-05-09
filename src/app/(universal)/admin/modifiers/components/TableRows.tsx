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

  const [price, setPrice] = useState(item.price);

  function handleDelete() {
    if (!confirm("Delete this modifier item?")) return;

    onDelete(item.id); // ✅ CALL PARENT
  }

  return (
    <TableRow className="hover:bg-green-50">

      <TableCell>
         {item.name}
      </TableCell>

      <TableCell>
        {item.groupName}
      </TableCell>

      <TableCell>
        <input
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          onBlur={async () => {
            await fetch("/api/modifier-items/update", {
              method: "POST",
              body: JSON.stringify({
                id: item.id,
                price,
              }),
            });
          }}
        />
      </TableCell>

      <TableCell>
        {item.isDefault ? "Yes" : "No"}
      </TableCell>

      <TableCell>
        <span className={`px-2 py-1 text-xs rounded-full ${
          item.status === "published"
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"
        }`}>
          {item.status}
        </span>
      </TableCell>

      <TableCell>
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