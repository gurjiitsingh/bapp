'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';

import { db } from '@/lib/firebaseConfig';
import { formatCurrencyNumber } from '@/utils/formatCurrency';
import { UseSiteContext } from '@/SiteContext/SiteContext';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

import {
  TrendingUp,
  ShoppingBag,
  Wallet,
  CreditCard,
  Smartphone,
  Banknote,
  CalendarDays,
} from 'lucide-react';

type MonthlySales = {
  month: string;
  totalSales: number;
  orderCount: number;

  cashCollection: number;
  cardCollection: number;
  upiCollection: number;
  walletCollection: number;

  totalTax: number;
  totalDiscount: number;
  totalCredit: number;
};

// =========================================================
// CURRENT YEAR
// =========================================================

function getCurrentYear() {
  return new Date().getFullYear().toString();
}

// =========================================================
// FORMAT MONTH
// =========================================================

function formatMonth(month: string) {
  if (!month) return '-';

  const [year, monthNumber] = month.split('-');

  const date = new Date(
    Number(year),
    Number(monthNumber) - 1,
    1
  );

  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

// =========================================================
// FORMAT SHORT MONTH
// =========================================================

function formatShortMonth(month: string) {
  if (!month) return '-';

  const [year, monthNumber] = month.split('-');

  const date = new Date(
    Number(year),
    Number(monthNumber) - 1,
    1
  );

  return date.toLocaleDateString('en-US', {
    month: 'short',
  });
}

export default function MonthlySalesTable() {
  const { settings } = UseSiteContext();

  // =======================================================
  // CURRENT YEAR BY DEFAULT
  // =======================================================

  const [selectedYear, setSelectedYear] =
    useState(getCurrentYear());

  const [monthlySales, setMonthlySales] =
    useState<MonthlySales[]>([]);

  const [loading, setLoading] =
    useState(true);

  // =======================================================
  // FETCH WHEN YEAR CHANGES
  // =======================================================

  useEffect(() => {
    fetchMonthlySales();
  }, [selectedYear]);

  // =======================================================
  // FETCH MONTHLY REPORTS FOR SELECTED YEAR
  // =======================================================

  const fetchMonthlySales = async () => {
    setLoading(true);

    try {
      const ref = collection(
        db,
        'monthlyReports'
      );

      const startMonth =
        `${selectedYear}-01`;

      const endMonth =
        `${selectedYear}-12`;

      const q = query(
        ref,
        where(
          'month',
          '>=',
          startMonth
        ),
        where(
          'month',
          '<=',
          endMonth
        ),
        orderBy('month', 'desc')
      );

      const snapshot = await getDocs(q);

      const sales: MonthlySales[] =
        snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            month:
              data.month ||
              doc.id,

            totalSales: Number(
              data.totalSales ?? 0
            ),

            orderCount: Number(
              data.orderCount ?? 0
            ),

            cashCollection: Number(
              data.cashCollection ?? 0
            ),

            cardCollection: Number(
              data.cardCollection ?? 0
            ),

            upiCollection: Number(
              data.upiCollection ?? 0
            ),

            walletCollection: Number(
              data.walletCollection ?? 0
            ),

            totalTax: Number(
              data.totalTax ?? 0
            ),

            totalDiscount: Number(
              data.totalDiscount ?? 0
            ),

            totalCredit: Number(
              data.totalCredit ?? 0
            ),
          };
        });

      setMonthlySales(sales);
    } catch (error) {
      console.error(
        'Error fetching monthly sales:',
        error
      );

      setMonthlySales([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SUMMARY
  // =========================================================

  const summary = useMemo(() => {
    const totalSales =
      monthlySales.reduce(
        (sum, item) =>
          sum + item.totalSales,
        0
      );

    const totalOrders =
      monthlySales.reduce(
        (sum, item) =>
          sum + item.orderCount,
        0
      );

    const averageMonthlySale =
      monthlySales.length > 0
        ? totalSales /
          monthlySales.length
        : 0;

    const cash =
      monthlySales.reduce(
        (sum, item) =>
          sum + item.cashCollection,
        0
      );

    const card =
      monthlySales.reduce(
        (sum, item) =>
          sum + item.cardCollection,
        0
      );

    const upi =
      monthlySales.reduce(
        (sum, item) =>
          sum + item.upiCollection,
        0
      );

    const wallet =
      monthlySales.reduce(
        (sum, item) =>
          sum + item.walletCollection,
        0
      );

    return {
      totalSales,
      totalOrders,
      averageMonthlySale,
      cash,
      card,
      upi,
      wallet,
    };
  }, [monthlySales]);

  // =========================================================
  // CURRENCY
  // =========================================================

  const currency = (value: number) =>
    formatCurrencyNumber(
      Number(value ?? 0),
      settings.currency as string,
      settings.locale as string
    );

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="w-full p-6">

        <div className="animate-pulse space-y-6">

          <div className="flex justify-between">
            <div className="h-10 w-64 rounded-lg bg-slate-100" />

            <div className="h-10 w-36 rounded-xl bg-slate-100" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            <div className="h-28 rounded-2xl bg-slate-100" />

            <div className="h-28 rounded-2xl bg-slate-100" />

            <div className="h-28 rounded-2xl bg-slate-100" />

          </div>

          <div className="h-80 rounded-2xl bg-slate-100" />

          <div className="h-72 rounded-2xl bg-slate-100" />

        </div>

      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="w-full space-y-6 p-4 md:p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
            <TrendingUp className="h-5 w-5 text-orange-500" />
          </div>

          <div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
              Monthly Sales
            </h1>

            <p className="text-sm text-slate-500">
              Monthly revenue and payment collections
            </p>

          </div>

        </div>

        {/* =================================================
            YEAR SELECTOR
        ================================================= */}

        <div className="flex items-center gap-2">

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">

            <CalendarDays className="h-4 w-4 text-slate-500" />

            <select
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(
                  e.target.value
                )
              }
              className="border-0 bg-transparent text-sm font-medium text-slate-700 outline-none focus:ring-0"
            >

              {Array.from(
                {
                  length: 10,
                },
                (_, index) =>
                  new Date().getFullYear() -
                  index
              ).map((year) => (

                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>

              ))}

            </select>

          </div>

        </div>

      </div>

      {/* =====================================================
          SELECTED YEAR
      ===================================================== */}

      <div className="rounded-xl border border-orange-100 bg-orange-50/60 px-4 py-3">

        <p className="text-sm text-orange-700">

          Showing monthly sales for{' '}

          <span className="font-semibold">
            {selectedYear}
          </span>

        </p>

      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

        {/* Total Sales */}

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Total Sales
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-slate-800">
                {currency(
                  summary.totalSales
                )}
              </h2>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>

          </div>

          <p className="mt-3 text-xs text-slate-400">
            Total sales in {selectedYear}
          </p>

        </div>

        {/* Orders */}

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Total Orders
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-slate-800">
                {summary.totalOrders.toLocaleString()}
              </h2>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>

          </div>

          <p className="mt-3 text-xs text-slate-400">
            Recorded orders in {selectedYear}
          </p>

        </div>

        {/* Average */}

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Average Monthly Sale
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-slate-800">
                {currency(
                  summary.averageMonthlySale
                )}
              </h2>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <Wallet className="h-5 w-5 text-purple-600" />
            </div>

          </div>

          <p className="mt-3 text-xs text-slate-400">
            Based on available reports
          </p>

        </div>

      </div>

      {/* =====================================================
          SALES CHART
      ===================================================== */}

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">

        <div className="mb-6">

          <h2 className="text-lg font-semibold text-slate-800">
            Sales Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Monthly sales performance for{' '}
            {selectedYear}
          </p>

        </div>

        <div className="h-80 w-full">

          {monthlySales.length > 0 ? (

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={[
                  ...monthlySales,
                ].reverse()}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#eef2f7"
                />

                <XAxis
                  dataKey="month"
                  tickFormatter={formatShortMonth}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748b',
                    fontSize: 12,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748b',
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  cursor={{
                    fill: '#f8fafc',
                  }}
                  formatter={(value) =>
                    currency(
                      Number(value ?? 0)
                    )
                  }
                  labelFormatter={(label) =>
                    formatMonth(
                      String(label)
                    )
                  }
                  contentStyle={{
                    borderRadius:
                      '12px',
                    border:
                      '1px solid #e2e8f0',
                    boxShadow:
                      '0 8px 30px rgba(15, 23, 42, 0.08)',
                  }}
                />

                <Bar
                  dataKey="totalSales"
                  name="Sales"
                  fill="#f59e0b"
                  radius={[
                    6,
                    6,
                    0,
                    0,
                  ]}
                  barSize={36}
                />

              </BarChart>

            </ResponsiveContainer>

          ) : (

            <div className="flex h-full items-center justify-center">

              <div className="text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50">

                  <TrendingUp className="h-5 w-5 text-slate-400" />

                </div>

                <p className="mt-3 font-medium text-slate-700">
                  No sales data
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  No monthly reports found for{' '}
                  {selectedYear}.
                </p>

              </div>

            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          PAYMENT COLLECTIONS
      ===================================================== */}

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">

        <div className="mb-5">

          <h2 className="text-lg font-semibold text-slate-800">
            Payment Collections
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Collection breakdown for{' '}
            {selectedYear}
          </p>

        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          {/* Cash */}

          <div className="rounded-xl bg-slate-50 p-4">

            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
              <Banknote className="h-4 w-4 text-emerald-600" />
            </div>

            <p className="text-xs font-medium text-slate-500">
              Cash
            </p>

            <p className="mt-1 text-lg font-semibold text-slate-800">
              {currency(
                summary.cash
              )}
            </p>

          </div>

          {/* Card */}

          <div className="rounded-xl bg-slate-50 p-4">

            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>

            <p className="text-xs font-medium text-slate-500">
              Card
            </p>

            <p className="mt-1 text-lg font-semibold text-slate-800">
              {currency(
                summary.card
              )}
            </p>

          </div>

          {/* UPI */}

          <div className="rounded-xl bg-slate-50 p-4">

            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
              <Smartphone className="h-4 w-4 text-purple-600" />
            </div>

            <p className="text-xs font-medium text-slate-500">
              UPI
            </p>

            <p className="mt-1 text-lg font-semibold text-slate-800">
              {currency(
                summary.upi
              )}
            </p>

          </div>

          {/* Wallet */}

          <div className="rounded-xl bg-slate-50 p-4">

            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
              <Wallet className="h-4 w-4 text-orange-600" />
            </div>

            <p className="text-xs font-medium text-slate-500">
              Wallet
            </p>

            <p className="mt-1 text-lg font-semibold text-slate-800">
              {currency(
                summary.wallet
              )}
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          MONTHLY TABLE
      ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-5 md:px-6">

          <h2 className="text-lg font-semibold text-slate-800">
            Monthly Breakdown
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Detailed sales information for{' '}
            {selectedYear}
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[700px] text-sm">

            <thead>

              <tr className="bg-slate-50 text-left">

                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Month
                </th>

                <th className="px-6 py-3.5 text-right font-medium text-slate-500">
                  Orders
                </th>

                <th className="px-6 py-3.5 text-right font-medium text-slate-500">
                  Sales
                </th>

                <th className="px-6 py-3.5 text-right font-medium text-slate-500">
                  Cash
                </th>

                <th className="px-6 py-3.5 text-right font-medium text-slate-500">
                  Card
                </th>

                <th className="px-6 py-3.5 text-right font-medium text-slate-500">
                  UPI
                </th>

                <th className="px-6 py-3.5 text-right font-medium text-slate-500">
                  Wallet
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {monthlySales.map(
                (row) => (

                  <tr
                    key={row.month}
                    className="transition-colors hover:bg-slate-50/70"
                  >

                    <td className="px-6 py-4">

                      <div className="font-medium text-slate-800">
                        {formatMonth(
                          row.month
                        )}
                      </div>

                      <div className="mt-0.5 text-xs text-slate-400">
                        {row.month}
                      </div>

                    </td>

                    <td className="px-6 py-4 text-right font-medium text-slate-700">
                      {row.orderCount.toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-right">

                      <span className="font-semibold text-slate-800">
                        {currency(
                          row.totalSales
                        )}
                      </span>

                    </td>

                    <td className="px-6 py-4 text-right text-slate-600">
                      {currency(
                        row.cashCollection
                      )}
                    </td>

                    <td className="px-6 py-4 text-right text-slate-600">
                      {currency(
                        row.cardCollection
                      )}
                    </td>

                    <td className="px-6 py-4 text-right text-slate-600">
                      {currency(
                        row.upiCollection
                      )}
                    </td>

                    <td className="px-6 py-4 text-right text-slate-600">
                      {currency(
                        row.walletCollection
                      )}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

        {monthlySales.length === 0 && (

          <div className="px-6 py-12 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50">

              <CalendarDays className="h-5 w-5 text-slate-400" />

            </div>

            <p className="mt-3 font-medium text-slate-700">
              No monthly reports found
            </p>

            <p className="mt-1 text-sm text-slate-400">
              There are no reports for{' '}
              {selectedYear}.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}
 
