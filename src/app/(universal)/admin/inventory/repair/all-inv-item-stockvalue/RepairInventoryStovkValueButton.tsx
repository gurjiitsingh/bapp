'use client';

import { repairAllInventoryStockValues } from '@/app/(universal)/action/inventory/repair/repairAllInventoryStockValues';
import { useState } from 'react';
 

export default function RepairInventoryStockValueButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleRepair = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await repairAllInventoryStockValues();

      if (res.success) {
        setResult(`✅ ${res.message}`);
      } else {
        setResult(`❌ ${res.message}`);
      }
    } catch (err: any) {
      setResult(`❌ ${err.message}`);
    }

    setLoading(false);
  };

  return (
  <div className="flex items-center gap-2">
  <button
    onClick={handleRepair}
    disabled={loading}
    title="Repair Inventory Stock"
    className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
  >
    {loading ? (
      // 🔄 spinning loader
      <svg
        className="w-5 h-5 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        />
      </svg>
    ) : (
      // 🔁 refresh icon
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 4v6h6M20 20v-6h-6M5.636 18.364A9 9 0 103.5 12m17 0a9 9 0 01-2.136 6.364"
        />
      </svg>
    )}
  </button>

  {result && (
    <p className="text-sm text-gray-700">{result}</p>
  )}
</div>
  );
}