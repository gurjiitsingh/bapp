"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import Link from "next/link";

export default function ProductionBatchTable({ batches }: any) {
  const [search, setSearch] = useState("");

  const filtered = batches.filter((b: any) =>
    b.departmentName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Production Batches
        </h1>

        <input
          placeholder="Search department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg w-64"
        />
      </div>

      {/* TABLE */}
      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">

        <div className="grid grid-cols-5 bg-gray-100 px-4 py-3 text-sm font-medium text-gray-600">
          <div>Batch ID</div>
          <div>Department</div>
          <div>Date</div>
          <div>Status</div>
          <div>Action</div>
        </div>

        {filtered.map((batch: any) => (
          <div
            key={batch.id}
            className="grid grid-cols-5 px-4 py-3 border-t items-center hover:bg-gray-50 transition"
          >
            <div className="font-medium text-gray-800">
              {batch.id}
            </div>

            <div>{batch.departmentName}</div>

            <div>
              {new Date(batch.createdAt).toLocaleString()}
            </div>

            <div>
              {batch.isClosed ? (
                <span className="text-red-600 text-sm font-medium">
                  Closed
                </span>
              ) : (
                <span className="text-green-600 text-sm font-medium">
                  Open
                </span>
              )}
            </div>

            <div>
             <Link
  href={`/admin/stock-finished/issue/batches/${batch.id}`}
  className="text-blue-600 hover:underline"
>
  View
</Link>
            </div>
          </div>
        ))}

        {!filtered.length && (
          <div className="text-center py-6 text-gray-400">
            No batches found
          </div>
        )}
      </div>
    </div>
  );
}