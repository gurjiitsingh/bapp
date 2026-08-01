'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Wrench } from 'lucide-react';
import { recalculateAllDepartmentStockValues } from '@/app/(universal)/action/inventory/repair/recalculateAllDepartmentStockValues';

 
export default function RepairDepartmentStockPage() {
const [isPending, startTransition] = useTransition();

function handleRepair() {
startTransition(async () => {
const result =
await recalculateAllDepartmentStockValues();

 
  if (result.success) {
    toast.success(result.message);
  } else {
    toast.error(result.message);
  }
});


}

return ( <div className="min-h-screen bg-gray-50 p-6"> <div className="mx-auto max-w-2xl space-y-6">


    {/* Header */}
    <div className="flex items-center justify-between">

      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Repair Department Stock Values
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Recalculate stock value for all department stock items.
        </p>
      </div>

      <Link
        href="/admin/stock-finished/department"
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        <ArrowLeft size={16} />
        Back
      </Link>
    </div>

    {/* Card */}
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">

      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        This will update the <strong>stockValue</strong> of every document in
        <strong> departmentStock</strong> using:
        <div className="mt-2 font-mono text-xs bg-white border rounded p-2">
          qtyInPurchaseUnit = currentStock / conversionFactor
          <br />
          stockValue = qtyInPurchaseUnit × averageCost
        </div>
      </div>

      <button
        onClick={handleRepair}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Wrench size={18} />
        {isPending
          ? 'Repairing...'
          : 'Repair All Department Stock Values'}
      </button>

      <p className="text-xs text-gray-500">
        Depending on the number of records, this may take a few seconds.
      </p>
    </div>
  </div>
</div>


);
}
