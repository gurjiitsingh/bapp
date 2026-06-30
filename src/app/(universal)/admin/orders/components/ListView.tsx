'use client';

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TableRows from './TableRows';
import { orderMasterDataT } from '@/lib/types/orderMasterType';
import { fetchOrdersPaginated } from '@/app/(universal)/action/orders/dbOperations';

const ORDERS_PER_PAGE = 10;

// Upgraded Colorful Modern Empty State Component
const EmptyState = () => {
  const businessFeatures = [
    { text: 'Inventory Management', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/60' },
    { text: 'Billing & Sales', color: 'bg-blue-50 text-blue-700 border-blue-200/60' },
    { text: 'Business Analytics', color: 'bg-indigo-50 text-indigo-700 border-indigo-200/60' },
    { text: '🍮 Recipe Management', color: 'bg-amber-50 text-amber-700 border-amber-200/60' },
    { text: '🧾 Production Planning', color: 'bg-purple-50 text-purple-700 border-purple-200/60' },
    { text: '🏭 Manufacturing Tracking', color: 'bg-zinc-100 text-zinc-700 border-zinc-300/60' },
    { text: '📦 Raw Material Management', color: 'bg-orange-50 text-orange-700 border-orange-200/60' },
    { text: '🛒 Purchase Management', color: 'bg-sky-50 text-sky-700 border-sky-200/60' },
    { text: '🚚 Supplier Management', color: 'bg-cyan-50 text-cyan-700 border-cyan-200/60' },
    { text: '👨‍🍳 Production Costing', color: 'bg-teal-50 text-teal-700 border-teal-200/60' },
    { text: '👥 Staff Management', color: 'bg-violet-50 text-violet-700 border-violet-200/60' },
    { text: '💰 Expense Tracking', color: 'bg-rose-50 text-rose-700 border-rose-200/60' },
    { text: '📈 Profit & Loss Reports', color: 'bg-green-50 text-green-700 border-green-200/60' },
    { text: '💳 GST & Tax Management', color: 'bg-slate-50 text-slate-700 border-slate-200/60' },
    { text: '📱 POS Integration', color: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/60' },
    { text: '🎁 Customer Loyalty Program', color: 'bg-pink-50 text-pink-700 border-pink-200/60' },
    { text: '📲 WhatsApp Notifications', color: 'bg-emerald-100 text-emerald-800 border-emerald-300/60' },
    { text: '🔐 Role Based Access Control', color: 'bg-lime-50 text-lime-800 border-lime-200/60' },
  ];

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden my-4">
      {/* Decorative colored top accent strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      
      <div className="p-8 md:p-14 max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Subtle dynamic pulse ping icon */}
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-6 shadow-xs">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-2xl bg-indigo-400/20 opacity-75" />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
        </div>

        {/* Large Highlighted Modern Text Headers */}
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950">
          No New Orders Right Now
        </h2>
        <h3 className="text-xl md:text-2xl font-bold text-indigo-600 mt-2 tracking-tight">
          Manage Your Business Smarter
        </h3>
        
        <p className="text-slate-500 text-sm md:text-base max-w-2xl mt-4 leading-relaxed">
          Manage inventory, production, billing, purchases, accounting, staff and branch operations with one powerful ERP platform built for scaling businesses.
        </p>

        {/* Dynamic Colorful Feature Badges/Chips */}
        <div className="w-full border-t border-slate-100 mt-10 pt-8">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">
            Explore Built-in Core Modules
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {businessFeatures.map((feature, idx) => (
              <span
                key={idx}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 hover:scale-[1.03] shadow-3xs cursor-default ${feature.color}`}
              >
                {feature.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Loading Skeleton 
const LoadingSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <TableRow key={i} className="animate-pulse border-b border-slate-100">
        <TableCell colSpan={14} className="py-4.5">
          <div className="h-4 bg-slate-100 rounded-md w-full" />
        </TableCell>
      </TableRow>
    ))}
  </>
);

const ListView = () => {
  const [orderData, setOrderData] = useState<orderMasterDataT[]>([]);
  const [lastId, setLastId] = useState<string | null>(null);
  const [afterStack, setAfterStack] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async (next = false, back = false) => {
    setLoading(true);
    let afterId: string | undefined = undefined;
    let newStack = [...afterStack];

    if (next && lastId) {
      newStack.push(lastId);
      afterId = lastId;
      setPageIndex((prev) => prev + 1);
    } else if (back && newStack.length > 0) {
      newStack.pop(); 
      afterId = newStack[newStack.length - 1]; 
      setPageIndex((prev) => prev - 1);
    } else {
      setPageIndex(0);
    }

    setAfterStack(newStack);

    const { orders, lastId: newLastId } = await fetchOrdersPaginated({ afterId, pageSize: ORDERS_PER_PAGE });
    setOrderData(orders);
    setLastId(newLastId);
    setLoading(false);
  };

  if (!loading && orderData.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden bg-white border border-slate-200 shadow-xs rounded-2xl">
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px] text-sm text-left text-slate-600">
            <TableHeader className="bg-slate-50/70 border-b border-slate-200">
              <TableRow>
                <TableHead className="font-semibold text-slate-700 py-3.5">Order No.</TableHead>
                <TableHead className="font-semibold text-slate-700">Name</TableHead>
                <TableHead className="font-semibold text-slate-700">Submitted</TableHead>
                <TableHead className="font-semibold text-slate-700">Delivery/Pickup</TableHead>
                <TableHead className="font-semibold text-slate-700">Order Type</TableHead>
                <TableHead className="font-semibold text-slate-700">Table No.</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Total</TableHead>
                <TableHead className="font-semibold text-slate-700">Payment</TableHead>
                <TableHead className="font-semibold text-slate-700">Coupon</TableHead>
                <TableHead className="font-semibold text-slate-700">Discount %</TableHead>
                <TableHead className="font-semibold text-slate-700">Flat Discount</TableHead>
                <TableHead className="font-semibold text-slate-700">Printed</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <LoadingSkeleton />
              ) : (
                orderData.map((order) => <TableRows key={order.id} order={order} />)
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Panel */}
      <div className="flex items-center justify-between bg-white border border-slate-200 px-5 py-3.5 rounded-xl shadow-xs">
        <div className="text-xs font-medium text-slate-500">
          Page <span className="text-slate-800 font-semibold">{pageIndex + 1}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadOrders(false, true)}
            disabled={pageIndex === 0 || loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg shadow-3xs hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Newer Orders
          </button>
          
          <button
            onClick={() => loadOrders(true, false)}
            disabled={orderData.length < ORDERS_PER_PAGE || loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg shadow-3xs hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Older Orders
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListView;