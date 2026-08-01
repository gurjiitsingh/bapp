'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Building2, ArrowLeft } from 'lucide-react';

import { displayStock } from '@/utils/inventory/displayStock';

type Row = {
id: string;
departmentId: string;
departmentName: string;

inventoryItemId: string;
inventoryItemName: string;

currentStock: number;
averageCost: number;
stockValue: number;

purchaseUnit: string;
consumptionUnit: string;
conversionFactor: number;

updatedAt: any;
};

type MainStore = {
  id: string;
  name: string;
  currentStock: number;
  averageCost: number;
  stockValue: number;
  purchaseUnit: string;
  consumptionUnit: string;
  conversionFactor: number;
};

type Props = {
  itemName: string;
  data: Row[];
  mainStore: MainStore | null;
};

export default function DepartmentItemStockTable({
  itemName,
  data,
  mainStore,
}: Props) {

const [search, setSearch] = useState('');

const filtered = useMemo(() => {
return data.filter((item) =>
item.departmentName
.toLowerCase()
.includes(search.toLowerCase())
);
}, [data, search]);

const totals = useMemo(() => {
return filtered.reduce(
(acc, row) => {
acc.currentStock += Number(row.currentStock || 0);
acc.stockValue += Number(row.stockValue || 0);
return acc;
},
{ currentStock: 0, stockValue: 0 }
);
}, [filtered]);

const grandTotalStock =
  Number(mainStore?.currentStock || 0) +
  Number(totals.currentStock || 0);

const grandTotalValue =
  Number(mainStore?.stockValue || 0) +
  Number(totals.stockValue || 0);

return ( <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
  {/* Header */}
  <div className="m-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

    <div className="flex flex-col gap-3 md:flex-row md:items-center">

      <h2 className=" text-gray-800">
       
        <span className="text-amber-600 text-2xl">
          {itemName}{" "}
        </span>
         <span className="text-sm"> stock in all  Departments</span>
      
      </h2>

      <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
        <Search size={16} className="text-gray-400" />

        <input
          placeholder="Search department..."
          className="text-sm outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>

    <Link
      href="/admin/inventory"
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600"
    >
      <ArrowLeft size={16} />
      Back
    </Link>
  </div>

  {/* Summary */}
  <div className="grid grid-cols-1 gap-4 border-y border-gray-100 bg-gray-50 p-4 md:grid-cols-2">

    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-500">
        Total Stock Value
      </p>

      <p className="mt-1 text-xl font-bold text-green-700">
        ₹{totals.stockValue.toFixed(2)}
      </p>
    </div>

    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-500">
        Departments
      </p>

      <p className="mt-1 text-xl font-bold text-gray-800">
        {filtered.length}
      </p>
    </div>
  </div>

  {mainStore && (
  <div className="m-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">

    <div className="mb-4 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-blue-900">
          Main Store Inventory
        </h3>

        <p className="text-sm text-blue-700">
          Current stock available in main store
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-xs text-gray-500">
          Quantity
        </p>

        <p className="mt-1 text-lg font-bold text-gray-800">
          {displayStock(
            mainStore.currentStock,
            mainStore.purchaseUnit,
            mainStore.consumptionUnit,
            mainStore.conversionFactor
          )}
        </p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-xs text-gray-500">
          Average Cost
        </p>

        <p className="mt-1 text-lg font-bold text-gray-800">
          ₹{Number(mainStore.averageCost).toFixed(2)}
        </p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-xs text-gray-500">
          Stock Value
        </p>

        <p className="mt-1 text-lg font-bold text-green-700">
          ₹{Number(mainStore.stockValue).toFixed(2)}
        </p>
      </div>

    </div>
  </div>
)}

{mainStore && (
  <div className="mx-5 mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

    <div className="mb-4 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-emerald-900">
          Grand Total (Main Store + Departments)
        </h3>

        <p className="text-sm text-emerald-700">
          Combined stock available across the entire business
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-xs text-gray-500">
          Total Quantity
        </p>

        <p className="mt-1 text-xl font-bold text-gray-900">
          {displayStock(
            grandTotalStock,
            mainStore.purchaseUnit,
            mainStore.consumptionUnit,
            mainStore.conversionFactor
          )}
        </p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-xs text-gray-500">
          Total Stock Value
        </p>

        <p className="mt-1 text-xl font-bold text-emerald-700">
          ₹{grandTotalValue.toFixed(2)}
        </p>
      </div>

    </div>

    <div className="mt-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-2">

      <div className="rounded-lg border border-emerald-100 bg-white px-4 py-3">
        <p className="text-gray-500">Main Store Value</p>
        <p className="font-semibold text-gray-900">
          ₹{Number(mainStore.stockValue).toFixed(2)}
        </p>
      </div>

      <div className="rounded-lg border border-emerald-100 bg-white px-4 py-3">
        <p className="text-gray-500">Departments Value</p>
        <p className="font-semibold text-gray-900">
          ₹{Number(totals.stockValue).toFixed(2)}
        </p>
      </div>

    </div>
  </div>
)}

  {/* Table */}
  <div className="overflow-x-auto">
    <table className="w-full text-sm">

      <thead className="bg-gray-50">
        <tr className="text-left text-gray-600">

          <th className="px-4 py-3 font-medium">
            Department
          </th>

          <th className="px-4 py-3 font-medium text-right">
            Quantity
          </th>

          <th className="px-4 py-3 font-medium text-right">
            Avg Cost
          </th>

          <th className="px-4 py-3 font-medium text-right">
            Stock Value
          </th>

          <th className="px-4 py-3 font-medium text-right">
            Updated
          </th>
        </tr>
      </thead>

      <tbody>

        {filtered.length === 0 && (
          <tr>
            <td
              colSpan={5}
              className="p-8 text-center text-gray-500"
            >
              No department stock found
            </td>
          </tr>
        )}

     {filtered.map((item) => {

  // Compare department avg cost with main-store avg cost
  const inventoryAvg =
    Number(mainStore?.averageCost || 0);

  const departmentAvg =
    Number(item.averageCost || 0);

  let variancePercent = 0;

  if (inventoryAvg > 0 && departmentAvg > 0) {
    variancePercent =
      Math.abs(departmentAvg - inventoryAvg) /
      inventoryAvg *
      100;
  }

  const avgCostClass =
    variancePercent >= 12
      ? 'bg-red-100 text-red-700 border border-red-200'
      : variancePercent >= 6
      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      : 'text-gray-800';

  return (

    <tr
      key={item.id}
      className="border-t border-gray-100 hover:bg-gray-50"
    >

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">

          <div className="rounded-lg bg-amber-100 p-2">
            <Building2
              size={18}
              className="text-amber-700"
            />
          </div>

          <div>
            <p className="font-medium text-gray-800">
              {item.departmentName}
            </p>

            <p className="text-xs text-gray-500">
              {item.departmentId}
            </p>
          </div>

        </div>
      </td>

      <td className="px-4 py-3 text-right font-medium">
        {displayStock(
          item.currentStock,
          item.purchaseUnit,
          item.consumptionUnit,
          item.conversionFactor
        )}
      </td>

      <td className="px-4 py-3 text-right">
        <div className="flex flex-col items-end gap-1">

          <span
            className={`inline-flex items-center rounded-lg px-2.5 py-1 text-sm font-semibold ${avgCostClass}`}
          >
            ₹{departmentAvg.toFixed(2)}
          </span>

          {variancePercent >= 10 && (
            <span className="text-xs font-medium text-gray-500">
              {variancePercent.toFixed(1)}% diff
            </span>
          )}

        </div>
      </td>

      <td className="px-4 py-3 text-right font-semibold text-green-700">
        ₹{Number(item.stockValue).toFixed(2)}
      </td>

      <td className="px-4 py-3 text-right text-xs text-gray-500">
        {item.updatedAt
          ? new Date(item.updatedAt).toLocaleString('en-IN')
          : '-'}
      </td>

    </tr>

  );
})}
      </tbody>

      {/* Footer totals */}
      {filtered.length > 0 && (
        <tfoot className="border-t border-gray-200 bg-gray-50">
          <tr className="font-semibold text-gray-800">

            <td className="px-4 py-3">
              Total
            </td>

            <td className="px-4 py-3 text-right">
              {displayStock(
                totals.currentStock,
                filtered[0].purchaseUnit,
                filtered[0].consumptionUnit,
                filtered[0].conversionFactor
              )}
            </td>

            <td className="px-4 py-3 text-right">
              -
            </td>

            <td className="px-4 py-3 text-right text-green-700">
              ₹{totals.stockValue.toFixed(2)}
            </td>

            <td className="px-4 py-3"></td>
          </tr>
        </tfoot>
      )}
    </table>
  </div>
</div>


);
}
