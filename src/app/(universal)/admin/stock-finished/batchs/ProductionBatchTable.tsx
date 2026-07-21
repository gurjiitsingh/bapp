"use client";

import { useState } from "react";
import { Eye, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteProductionBatch } from "@/app/(universal)/action/production/batch/deleteProductionBatch";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

type Props = {
  batches: any[];
  hasNext: boolean;
  hasPrev: boolean;
  firstDocId: string | null;
  lastDocId: string | null;
  selectedDate: string;
};

export default function ProductionBatchTable({
  batches,
  hasNext,
  hasPrev,
  firstDocId,
  lastDocId,
  selectedDate,
}: Props) {
  const router = useRouter();

  const [date, setDate] = useState(selectedDate);

  function searchByDate() {
    const params = new URLSearchParams();

    if (date) {
      params.set("date", date);
    }

    router.push(`?${params.toString()}`);
  }

  function clearSearch() {
    setDate("");
    router.push("?");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this batch?")) return;

    const res = await deleteProductionBatch(id);

    if (res.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  function nextPage() {
    const params = new URLSearchParams();

    if (date) params.set("date", date);

    if (lastDocId) {
      params.set("lastDocId", lastDocId);
      params.set("direction", "next");
    }

    router.push(`?${params.toString()}`);
  }

  function previousPage() {
    const params = new URLSearchParams();

    if (date) params.set("date", date);

    if (firstDocId) {
      params.set("firstDocId", firstDocId);
      params.set("direction", "prev");
    }

    router.push(`?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        {/* Left */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

          <div>
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
              Production Batches
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Track and manage production records
            </p>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 lg:ml-8">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 px-4 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-red-200"
            />

            <button
              onClick={searchByDate}
              className="h-11 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Search size={18} />
              Search
            </button>

            <button
              onClick={clearSearch}
              className="h-11 px-4 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
            >
              Clear
            </button>
          </div>

        </div>

        {/* Right */}
        <div className="flex flex-wrap items-center gap-3">

          <Link
            href="/admin/stock-finished/production"
            className="h-11 px-5 flex items-center justify-center rounded-xl bg-red-600 text-white font-medium shadow-sm hover:bg-red-700 transition"
          >
            + Automatic Production
          </Link>

          <Link
            href="/admin/stock-finished/batchs/create-departmentstock"
            className="h-11 px-5 flex items-center justify-center rounded-xl bg-slate-500 text-white font-medium shadow-sm hover:bg-slate-600 transition"
          >
            Manual Production
          </Link>

        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-slate-100">
          <div>Batch</div>
          <div>Department</div>
           <div>Product Name</div>
          <div>Qty</div>

          <div>Date</div>
          <div>Status</div>
          <div className="text-right">
            Action
          </div>
        </div>

        {batches.map((batch: any) => (
          <div
            key={batch.id}
            className="grid grid-cols-7 items-center px-6 py-4 hover:bg-gray-50 transition"
          >
            <div className="font-medium">
              <Link

                href={`/admin/stock-finished/batchs/batches/${batch.id}`}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                <Eye size={16} />
                View  {" "} #{batch.id.slice(-6)}
              </Link>
            </div>

            <div>{batch.departmentName}</div>
             <div>{batch.productName}</div>
             <div>{batch.outputQty}{" "}{batch.productUnit}</div>
             

            <div className="text-sm text-gray-500">
              {new Date(
                batch.createdAt
              ).toLocaleDateString()}

              <div className="text-xs text-gray-400">
                {new Date(
                  batch.createdAt
                ).toLocaleTimeString()}
              </div>
            </div>

            <div>
              {batch.isClosed ? (
                <span className="px-3 py-1 rounded-full text-xs bg-red-50 text-red-600">
                  Closed
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs bg-green-50 text-green-600">
                  Open
                </span>
              )}
            </div>

            <div className="flex justify-end gap-3">


              <button
                onClick={() => handleDelete(batch.id)}
                className="flex items-center gap-1 text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}

        {!batches.length && (
          <div className="text-center py-10 text-gray-400">
            No batches found
          </div>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between">
        <button
          disabled={!hasPrev}
          onClick={previousPage}
          className="px-5 py-2 rounded-xl border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          ← Previous
        </button>

        <button
          disabled={!hasNext}
          onClick={nextPage}
          className="px-5 py-2 rounded-xl bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700"
        >
          Next →
        </button>
      </div>
    </div>
  );
}