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

type DailySales = {
  date: string;
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

function getCurrentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}`;
}

function formatDate(dateString: string) {
  if (!dateString) return '-';

  const [year, month, day] = dateString
    .split('-')
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatMonth(monthString: string) {
  if (!monthString) return '';

  const [year, month] = monthString
    .split('-')
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    1
  );

  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function getMonthRange(monthString: string) {
  const [year, month] = monthString
    .split('-')
    .map(Number);

  const startDate = `${year}-${String(month).padStart(
    2,
    '0'
  )}-01`;

  const lastDay = new Date(
    year,
    month,
    0
  ).getDate();

  const endDate = `${year}-${String(month).padStart(
    2,
    '0'
  )}-${String(lastDay).padStart(2, '0')}`;

  return {
    startDate,
    endDate,
  };
}

export default function DailySalesTable() {
  const { settings } = UseSiteContext();

  const [selectedMonth, setSelectedMonth] =
    useState(getCurrentMonth());

  const [dailySales, setDailySales] = useState<
    DailySales[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  // =========================================================
  // FETCH DAILY REPORTS FOR SELECTED MONTH
  // =========================================================

  useEffect(() => {
    fetchDailySales();
  }, [selectedMonth]);

  const fetchDailySales = async () => {
    setLoading(true);

    try {
      const {
        startDate,
        endDate,
      } = getMonthRange(selectedMonth);

      const ref = collection(
        db,
        'dailyReports'
      );

      const q = query(
        ref,
        where(
          'date',
          '>=',
          startDate
        ),
        where(
          'date',
          '<=',
          endDate
        ),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);

      const sales: DailySales[] =
        snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            date:
              data.date ||
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

      setDailySales(sales);
    } catch (error) {
      console.error(
        'Error fetching daily sales:',
        error
      );

      setDailySales([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SUMMARY
  // =========================================================

  const summary = useMemo(() => {
    const totalSales =
      dailySales.reduce(
        (sum, item) =>
          sum + item.totalSales,
        0
      );

    const totalOrders =
      dailySales.reduce(
        (sum, item) =>
          sum + item.orderCount,
        0
      );

    const averageDailySale =
      dailySales.length > 0
        ? totalSales / dailySales.length
        : 0;

    const cash =
      dailySales.reduce(
        (sum, item) =>
          sum + item.cashCollection,
        0
      );

    const card =
      dailySales.reduce(
        (sum, item) =>
          sum + item.cardCollection,
        0
      );

    const upi =
      dailySales.reduce(
        (sum, item) =>
          sum + item.upiCollection,
        0
      );

    const wallet =
      dailySales.reduce(
        (sum, item) =>
          sum + item.walletCollection,
        0
      );

    return {
      totalSales,
      totalOrders,
      averageDailySale,
      cash,
      card,
      upi,
      wallet,
    };
  }, [dailySales]);

  const currency = (value: number) =>
    formatCurrencyNumber(
      Number(value ?? 0),
      settings.currency as string,
      settings.locale as string
    );

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
              Daily Sales
            </h1>

            <p className="text-sm text-slate-500">
              Daily revenue and payment collections
            </p>

          </div>

        </div>

        {/* ===================================================
            MONTH SELECTOR
        =================================================== */}

        <div className="flex items-center gap-2">

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">

            <CalendarDays className="h-4 w-4 text-slate-500" />

            <input
              type="month"
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(
                  e.target.value
                )
              }
              className="border-0 bg-transparent text-sm font-medium text-slate-700 outline-none focus:ring-0"
            />

          </div>

        </div>

      </div>

      {/* =====================================================
          SELECTED MONTH
      ===================================================== */}

      <div className="rounded-xl border border-orange-100 bg-orange-50/60 px-4 py-3">

        <p className="text-sm text-orange-700">

          Showing daily sales for{' '}

          <span className="font-semibold">
            {formatMonth(selectedMonth)}
          </span>

        </p>

      </div>

      {loading ? (

        /* ===================================================
            LOADING
        =================================================== */

        <div className="animate-pulse space-y-6">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            <div className="h-28 rounded-2xl bg-slate-100" />

            <div className="h-28 rounded-2xl bg-slate-100" />

            <div className="h-28 rounded-2xl bg-slate-100" />

          </div>

          <div className="h-80 rounded-2xl bg-slate-100" />

          <div className="h-72 rounded-2xl bg-slate-100" />

        </div>

      ) : (

        <>

          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

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
                {formatMonth(
                  selectedMonth
                )}
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
                Recorded orders
              </p>

            </div>

            {/* Average */}

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Average Daily Sale
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-slate-800">
                    {currency(
                      summary.averageDailySale
                    )}
                  </h2>

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                  <Wallet className="h-5 w-5 text-purple-600" />
                </div>

              </div>

              <p className="mt-3 text-xs text-slate-400">
                Average per report
              </p>

            </div>

          </div>

          {/* =================================================
              SALES CHART
          ================================================= */}

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">

            <div className="mb-6">

              <h2 className="text-lg font-semibold text-slate-800">
                Daily Sales Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Sales performance for{' '}
                {formatMonth(
                  selectedMonth
                )}
              </p>

            </div>

            <div className="h-80 w-full">

              {dailySales.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={[
                      ...dailySales,
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
                      dataKey="date"
                      tickFormatter={(value) =>
                        value.substring(
                          8,
                          10
                        )
                      }
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
                          Number(
                            value ?? 0
                          )
                        )
                      }
                      labelFormatter={(label) =>
                        formatDate(
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
                      barSize={24}
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
                      No daily reports found for this month.
                    </p>

                  </div>

                </div>

              )}

            </div>

          </div>

          {/* =================================================
              PAYMENT COLLECTIONS
          ================================================= */}

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-slate-800">
                Payment Collections
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Collection breakdown for{' '}
                {formatMonth(
                  selectedMonth
                )}
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

          {/* =================================================
              DAILY TABLE
          ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-5 py-5 md:px-6">

              <h2 className="text-lg font-semibold text-slate-800">
                Daily Breakdown
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Detailed sales information for{' '}
                {formatMonth(
                  selectedMonth
                )}
              </p>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[750px] text-sm">

                <thead>

                  <tr className="bg-slate-50 text-left">

                    <th className="px-6 py-3.5 font-medium text-slate-500">
                      Date
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

                  {dailySales.map(
                    (row) => (

                      <tr
                        key={row.date}
                        className="transition-colors hover:bg-slate-50/70"
                      >

                        <td className="px-6 py-4">

                          <div className="font-medium text-slate-800">
                            {formatDate(
                              row.date
                            )}
                          </div>

                          <div className="mt-0.5 text-xs text-slate-400">
                            {row.date}
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

            {dailySales.length === 0 && (

              <div className="px-6 py-12 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50">
                  <CalendarDays className="h-5 w-5 text-slate-400" />
                </div>

                <p className="mt-3 font-medium text-slate-700">
                  No daily reports found
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  There are no reports for{' '}
                  {formatMonth(
                    selectedMonth
                  )}.
                </p>

              </div>

            )}

          </div>

        </>

      )}

    </div>
  );
}
 
