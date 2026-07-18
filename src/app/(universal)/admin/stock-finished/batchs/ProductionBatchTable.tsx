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
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        {/* TITLE */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Production Batches
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage production records
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap items-center gap-3">

          <input
            placeholder="Search department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              h-11 px-4 rounded-xl
              bg-gray-50
              outline-none
              focus:ring-2 focus:ring-red-200
              transition
              w-64
            "
          />

        

           <Link
            href="/admin/stock-finished/production"
            className="
              h-11 px-5 flex items-center justify-center
              rounded-xl
              bg-red-600 text-white font-medium
              shadow-sm
              hover:bg-red-700 transition
            "
          >
            + Automatic Production
          </Link>

            <Link
            href="/admin/stock-finished/batchs/create-departmentstock"
            className="
              h-11 px-5 flex items-center justify-center
              rounded-xl
              bg-slate-500 text-white font-medium
              shadow-sm
              hover:bg-slate-600 transition
            "
          >
             Manual Production
          </Link>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm overflow-hidden">

        {/* TABLE HEADER */}
        <div className="
          grid grid-cols-5
          px-6 py-3
          text-xs font-semibold
          text-gray-500 uppercase tracking-wider
          bg-slate-100
        ">
          <div>Batch</div>
          <div>Department</div>
          <div>Date</div>
          <div>Status</div>
          <div className="text-right">Action</div>
        </div>

        {/* ROWS */}
        {filtered.map((batch: any) => (
          <div
            key={batch.id}
            className="
              grid grid-cols-5 items-center
              px-6 py-4
              hover:bg-gray-50/70
              transition
            "
          >
            {/* ID */}
            <div className="font-medium text-gray-900">
              #{batch.id.slice(-6)}
            </div>

            {/* DEPARTMENT */}
            <div className="text-gray-600">
              {batch.departmentName}
            </div>

            {/* DATE */}
            <div className="text-gray-500 text-sm">
              {new Date(batch.createdAt).toLocaleDateString()}
              <div className="text-xs text-gray-400">
                {new Date(batch.createdAt).toLocaleTimeString()}
              </div>
            </div>

            {/* STATUS */}
            <div>
              {batch.isClosed ? (
                <span className="
                  px-3 py-1 text-xs font-medium
                  rounded-full
                  bg-red-50 text-red-600
                ">
                  Closed
                </span>
              ) : (
                <span className="
                  px-3 py-1 text-xs font-medium
                  rounded-full
                  bg-green-50 text-green-600
                ">
                  Open
                </span>
              )}
            </div>

            {/* ACTION */}
            <div className="flex justify-end">
              <Link
                href={`/admin/stock-finished/batchs/batches/${batch.id}`}
                className="
                  flex items-center gap-1
                  text-sm font-medium
                  text-blue-600
                  hover:text-blue-800
                  transition
                "
              >
                <Eye size={16} />
                View
              </Link>
            </div>
          </div>
        ))}

        {/* EMPTY */}
        {!filtered.length && (
          <div className="text-center py-10 text-gray-400 text-sm">
            No batches found
          </div>
        )}
      </div>
    </div>
  );
}