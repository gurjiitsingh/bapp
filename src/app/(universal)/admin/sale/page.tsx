'use client';

import { useState } from 'react';
import MonthlySalesTable from './components/MonthlySalesTable';
import DailySalesTable from './components/DailySalesTable';


export default function SalesPage() {
  
const [view, setView] = useState<'monthly' | 'daily'>('daily');
  return (
    <div className="p-4">
      {/* Toggle Buttons */}
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

      {/* Render component */}
      {view === 'monthly' ? <MonthlySalesTable /> : <DailySalesTable />}
    </div>
  );
}
