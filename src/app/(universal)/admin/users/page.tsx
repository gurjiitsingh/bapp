'use client';

import React from 'react';
import Link from 'next/link';
import ListView from './components/ListView';

export default function Page() {
  return (
    <div className='mt-10'>
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-slate-100/40 to-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500/10 selection:text-indigo-600">
      
      {/* Premium Dashboard Global Layout Wrapper */}
      <div className="w-full  px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col gap-8">
        
        {/* Header Hero Control Board Component */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6 transition-all duration-300 hover:shadow-xs">
          
          {/* Subtle Accent Radial Light Burst */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-linear-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Left Panel Typography Elements */}
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 tracking-wide uppercase">
              ✨ Access Control Hub
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
              Platform Registry
            </h1>
            
            <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
              Provision internal employee roles, monitor active stakeholder state, and manage your operational business framework intelligently through automated access policies.
            </p>
          </div>

          {/* Right Panel Fancy Action Trigger Button */}
          <div className="flex items-center shrink-0 relative z-10">
            <Link
              href="/admin/users/add"
              className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-linear-to-br from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:from-indigo-700 active:to-purple-700 shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 hover:-translate-y-0.5"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="2.5" 
                stroke="currentColor" 
                className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Add New User</span>
              
              {/* Dynamic hover bottom reflective sheen border */}
              <span className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />
            </Link>
          </div>
        </div>

        {/* Dynamic ListView Segment */}
        <div className="flex-1 flex flex-col">
          <ListView />
        </div>

      </div>
    </div></div>
  );
}