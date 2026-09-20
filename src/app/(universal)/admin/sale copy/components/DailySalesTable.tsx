'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

import TableRows from './TableRows';

type DailySales = {
  date: string;
  totalSales: number;
  orderCount: number;
};

export default function DailySalesTable({
  dailySales,
}: {
  dailySales: DailySales[];
}) {
  return (
    <div className="p-4 w-full mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Daily Sales Summary
      </h1>

      {/* Chart */}
      <div className="w-full h-80 mb-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalSales" fill="#4CAF50" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">Date</th>
            <th className="border px-4 py-2 text-left">Total Orders</th>
            <th className="border px-4 py-2 text-left">Total Sales</th>
          </tr>
        </thead>
        <tbody>
          {dailySales.map((row, i) => (
            <TableRows
              key={i}
              row={{
                label: row.date,
                orderCount: row.orderCount,
                totalSales: row.totalSales,
              }}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}