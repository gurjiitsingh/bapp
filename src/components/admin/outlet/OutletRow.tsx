"use client";

import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MdDeleteForever } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { OutletType } from "@/lib/types/outletType";
import { deleteOutlet } from "@/app/(universal)/action/outlet/dbOperation";

function OutletRow({ outlet }: { outlet: OutletType }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!outlet.outletId) return;

    const confirmed = confirm(
      "Are you sure? This will permanently delete outlet data."
    );

    if (!confirmed) return;

    setLoading(true);
    const result = await deleteOutlet(outlet.outletId);
    setLoading(false);

    if (result?.success) {
      alert("Outlet deleted");
      location.reload();
    } else {
      alert("Delete failed");
      console.error(result?.errors);
    }
  }

  return (
    <TableRow className="whitespace-nowrap hover:bg-green-50 dark:hover:bg-zinc-800 transition rounded-xl">

      {/* NAME + TAX */}
      <TableCell className="font-medium">
        {outlet.outletName}
        <div className="text-xs opacity-70">
          {outlet.taxType && `${outlet.taxType}: `}
          {outlet.gstVatNumber || ""}
        </div>
      </TableCell>

      {/* ADDRESS */}
      <TableCell className="text-sm text-gray-700 dark:text-gray-300">
        <div>{outlet.addressLine1}</div>
        {outlet.addressLine2 && <div>{outlet.addressLine2}</div>}
        {outlet.addressLine3 && <div>{outlet.addressLine3}</div>}

        <div>
          {outlet.city}
          {outlet.zipcode && ` - ${outlet.zipcode}`}
        </div>

        <div className="text-xs opacity-70">
          {(outlet.state || "") + (outlet.country ? `, ${outlet.country}` : "")}
        </div>

        {outlet.footerNote && (
          <div className="text-xs opacity-70 mt-1">
            {outlet.footerNote}
          </div>
        )}
      </TableCell>

      {/* CONTACT */}
      <TableCell>
        <div>{outlet.phone || "—"}</div>

        {outlet.phone2 && (
          <div className="text-xs text-gray-500">{outlet.phone2}</div>
        )}

        {outlet.email && (
          <div className="text-xs text-blue-600">{outlet.email}</div>
        )}

        {outlet.web && (
          <div className="text-xs text-blue-500">
            <a href={outlet.web} target="_blank" rel="noreferrer">
              {outlet.web}
            </a>
          </div>
        )}
      </TableCell>

      {/* STATUS */}
      <TableCell>
        {outlet.isActive ? (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            Active
          </span>
        ) : (
          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
            Inactive
          </span>
        )}
      </TableCell>

      {/* PRINTER */}
      <TableCell>{outlet.printerWidth} mm</TableCell>

      {/* ACTIONS */}
      <TableCell>
        <div className="flex gap-2">
          <Link href={`/admin/outlet/form?outletId=${outlet.outletId}`}>
            <Button
              size="sm"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1"
            >
              <CiEdit size={18} />
            </Button>
          </Link>

          <Button
            onClick={handleDelete}
            size="sm"
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1"
          >
            {loading ? "…" : <MdDeleteForever size={18} />}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default OutletRow;
