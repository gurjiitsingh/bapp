'use client';

import { useState } from 'react';
import DailySalesTable from './DailySalesTable';
import MonthlySalesTable from './MonthlySalesTable';

export default function SalesClient({
  dailySales,
}: {
  dailySales: any[];
}) {
  const [view, setView] = useState<'monthly' | 'daily'>('daily');

  return (
    <div className="p-4">
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setView('daily')}
          className={`px-4 py-2 rounded-lg font-semibold ${
            view === 'daily'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Daily Sales
        </button>

        <button
          onClick={() => setView('monthly')}
          className={`px-4 py-2 rounded-lg font-semibold ${
            view === 'monthly'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Monthly Sales
        </button>
      </div>

      {view === 'daily' ? (
        <DailySalesTable dailySales={dailySales} />
      ) : (
        <MonthlySalesTable />
      )}
    </div>
  );
}