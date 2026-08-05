'use client';

import Link from 'next/link';
import {
Wrench,
Calculator,
DollarSign,
RefreshCw,
ArrowLeft,
Receipt,
} from 'lucide-react';
import { repairAllInventoryStockValues } from '@/app/(universal)/action/inventory/repair/repairAllInventoryStockValues';

export default function Page() {
return ( <div className="min-h-screen bg-gray-50 p-6"> <div className="mx-auto max-w-4xl space-y-6">
 
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Repair Utilities
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Inventory and department maintenance tools.
        </p>
      </div>

      <Link
        href="/admin"
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        <ArrowLeft size={16} />
        Back
      </Link>
    </div>

    {/* Tools */}
    <div className="grid gap-4 md:grid-cols-2">


         {/*  Updating ALL department AvageCost with inventory AvageCost */}
   

      {/* Repair department stock values */}
      <Link
        href="/admin/inventory/repair/all-dp-stockvalue"
        className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
      >
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-blue-100 p-3">
            <Calculator
              className="text-blue-700"
              size={24}
            />
          </div>

          <div>
            <h2 className="font-semibold text-gray-800">
              Repair Department Stock Values
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Recalculate stockValue for all department stock records.
            </p>
          </div>
        </div>
      </Link>

      <Link
        href="/admin/inventory/repair/dpprice"
        className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
      >
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-emerald-100 p-3">
            <DollarSign
              className="text-emerald-700"
              size={24}
            />
          </div>

          <div>
            <h2 className="font-semibold text-gray-800">
              Update Department Prices
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Sync department average costs with inventory prices.
            </p>
          </div>
        </div>
      </Link>

      
      {/* NEW: Update inventory Stock Value */}
<button
  onClick={async () => {
    if (!confirm('Repair all inventory stock values?')) return;

    try {
      const res = await repairAllInventoryStockValues();
      alert(res.message);
    } catch (err: any) {
      alert(err.message);
    }
  }}
  className="w-full text-left rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
>
  <div className="flex items-start gap-4">
    <div className="rounded-xl bg-purple-100 p-3">
      <Receipt className="text-purple-700" size={24} />
    </div>

    <div>
      <h2 className="font-semibold text-gray-800">
        Update Inventory Stock value
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Edit inventory and recalculate stock value.
      </p>
    </div>
  </div>
</button>

            {/* Sync average cost */}
        {/* Copy inventory purchaseUnitCost into averageCost  */}
      <Link
        href="/admin/inventory/repair/copyavg"
        className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
      >
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-amber-100 p-3">
            <RefreshCw
              className="text-amber-700"
              size={24}
            />
          </div>
   
          <div>
            <h2 className="font-semibold text-gray-800">
              Sync Inventory Average Cost
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Inventory Average cost/price repair  using AI.
            </p>
          </div>
        </div>
      </Link>


      {/* Placeholder */}
      {/* <Link
        href="/admin/repair"
        className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md md:col-span-2"
      >
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-rose-100 p-3">
            <Wrench
              className="text-rose-700"
              size={24}
            />
          </div>

          <div>
            <h2 className="font-semibold text-gray-800">
              More Repair Tools
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Open additional maintenance utilities.
            </p>
          </div>
        </div>
      </Link> */}

    </div>
  </div>
</div>


);
}
