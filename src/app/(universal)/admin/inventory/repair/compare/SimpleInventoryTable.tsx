'use client';

type Item = {
  id: string;
  name: string;
  purchaseUnit: string;
  purchaseUnitCost: number;
  averageCost: number;
  stockValue: number;
};
import { fixItemAverageCost } from '@/app/(universal)/action/inventory/repair/fixItemAverageCost';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
export default function SimpleInventoryTable({
  items,
}: {
  items: Item[];
}) {
  if (!items.length) {
    return (
      <p className="text-gray-500">
        No inventory data found.
      </p>
    );
  }

  const [loadingId, setLoadingId] = useState<string | null>(null);
const router = useRouter();

const handleFix = async (id: string) => {
  setLoadingId(id);

  const res = await fixItemAverageCost(id);

  setLoadingId(null);

  if (res.success) {
    router.refresh(); // 🔄 reload data
  } else {
    alert(res.message);
  }
};

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">Name</th>
       
            <th className="p-3">AI Estimate Cost</th>
                 <th className="p-3">Unit</th>
            <th className="p-3">Avg Cost</th>
            <th className="p-3">Fix</th>
            <th className="p-3">Stock Value</th>
          </tr>
        </thead>

        <tbody>
     {items.map((item) => {
  const purchaseCost = item.purchaseUnitCost ?? 0;
  const avgCost = item.averageCost ?? 0;

  // ✅ Prevent divide by zero
  const percentDiff =
    purchaseCost > 0
      ? (Math.abs(avgCost - purchaseCost) / purchaseCost) * 100
      : 0;

  // 🎨 Color logic
  let colorClass = '';
  
  if (percentDiff <= 5) {
    colorClass = 'bg-green-100 text-green-700';
  } else if (percentDiff <= 10) {
    colorClass = 'bg-yellow-100 text-yellow-700';
  } else {
    colorClass = 'bg-red-100 text-red-700';
  }

  return (
    <tr
      key={item.id}
      className="border-t hover:bg-gray-50"
    >
      <td className="p-3 font-medium">
        {item.name}
      </td>

      {/* Unit */}
     

      {/* Purchase Cost */}
      <td className="p-3">
        ₹ {purchaseCost.toFixed(2)}
      </td>
       <td className="p-3">
        <span className="px-2 py-1 bg-gray-200 rounded text-xs">
          {item.purchaseUnit || '—'}
        </span>
      </td>

      {/* ✅ Avg Cost with % based color */}
      <td className="p-3">
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}
        >
          ₹ {avgCost.toFixed(2)}
        </span>

        {/* Optional % display */}
        <span className="ml-2 text-xs text-gray-500">
          ({percentDiff.toFixed(1)}%)
        </span>
      </td>

      {/* Fix Button */}
      <td className="p-3">
        <button
          onClick={() => handleFix(item.id)}
          disabled={loadingId === item.id}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          title="Fix Avg Cost"
        >
          {loadingId === item.id ? '⏳' : '🔄'}
        </button>
      </td>

      {/* Stock Value */}
      <td className="p-3 font-semibold">
        ₹ {(item.stockValue ?? 0).toFixed(2)}
      </td>
    </tr>
  );
})}
        </tbody>
      </table>
    </div>
  );
}