'use client';

import { useState, useTransition } from 'react';
import { Wrench, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { repairAllDepartmentStockValues } from '@/app/(universal)/action/production/departments/repair/repairAllDepartmentStockValues';
import { repairDepartmentStockValuesUsingOwnCost } from '@/app/(universal)/action/production/departments/repair/repairDepartmentStockValuesUsingOwnCost';


export default function RepairDepartmentStockValueButton() {
  const [isPending, startTransition] =
    useTransition();

  const [updated, setUpdated] =
    useState<number | null>(null);

  const handleRepair = () => {
    const ok = window.confirm(
      'Recalculate stock values for ALL department stock records?'
    );

    if (!ok) return;

    startTransition(async () => {
      const res =
       // await repairAllDepartmentStockValues();
await repairDepartmentStockValuesUsingOwnCost();
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      setUpdated(res.updated);
      toast.success(res.message);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleRepair}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? (
          <RefreshCw
            size={18}
            className="animate-spin"
          />
        ) : (
          <Wrench size={18} />
        )}

        {isPending
          ? 'Repairing...'
          : 'Repair Department Stock Values'}
      </button>

      {updated !== null && (
        <p className="text-sm text-gray-600">
          Updated records: <strong>{updated}</strong>
        </p>
      )}
    </div>
  );
}