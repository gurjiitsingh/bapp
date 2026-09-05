 
'use client';

import React from 'react';
import Link from 'next/link';
import ListView from './components/ListView';

export default function Page() {
  return (
    <div className="mt-10">
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-slate-100/40 to-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500/10 selection:text-indigo-600">

        <div className="w-full px-4 sm:px-6 lg:px-8 py-5 flex-1 flex flex-col gap-5">

          {/* =====================================================
              COMPACT HEADER
          ===================================================== */}
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-md border border-slate-200/80 px-5 py-4 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            {/* Subtle background accent */}
            <div className="absolute -top-20 -right-20 w-56 h-56 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Left */}
            <div className="relative z-10 min-w-0">

              <div className="flex items-center gap-2 mb-1">

                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[10px] font-semibold text-indigo-700 uppercase tracking-wide">
                  POS Access
                </span>

                <span className="text-xs text-slate-400">
                  User Management
                </span>

              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                POS Users
              </h1>

              <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
                Manage POS users, access, status and permissions.
              </p>

            </div>

            {/* Right */}
            <div className="relative z-10 flex items-center shrink-0">

              <Link
                href="/admin/store-pos/pos-users/add"
                className="group inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-linear-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:from-indigo-700 active:to-purple-700 shadow-sm shadow-indigo-500/20 hover:shadow-md transition-all duration-200"
              >

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>

                <span>Add POS User</span>

              </Link>

            </div>

          </div>

          {/* =====================================================
              USERS LIST
          ===================================================== */}
          <div className="flex-1 flex flex-col">
            <ListView />
          </div>

        </div>
      </div>
    </div>
  );
}
 
