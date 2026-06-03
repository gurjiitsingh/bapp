// components/inventory/InventoryTabs.tsx
"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  AlertTriangle,
  Boxes,
  IndianRupee,
  TrendingDown,
  Clock3,
  Tags,
  Truck,
} from "lucide-react";


import {
  Plus,
  ClipboardList,
  PackagePlus,
  BookOpen,
} from "lucide-react";

const tabs = [
  { name: "Dashboard", href: "/admin/inventory" },
  { name: "Items", href: "/admin/inventory" },
  { name: "New Item", href: "/admin/inventory/new" },
  { name: "Purchase", href: "/admin/inventory/purchase/add" },
  { name: "Adjust", href: "/admin/inventory/adjust-stock" },
  { name: "Transactions", href: "/admin/inventory/transactions" },
  { name: "Categories", href: "/admin/inventory/categories" },
  { name: "Suppliers", href: "/admin/inventory/supplier" },
];

export default function InventoryTabs() {
  const pathname = usePathname();

  return (
   <div className="bg-[#f6f8fb] p-2 pt-0 md:px-6">
      <div className="w-full mx-auto flex flex-col gap-6">
    
        {/* ===================================================== */}
        {/* QUICK ACTIONS */}
        {/* ===================================================== */}

        <div className="grid grid-cols-2 xl:grid-cols-7 gap-3">

          <Link
            href="/admin/inventory"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:border-[#00897b]/30 hover:shadow-md transition"
          >
            <div className="h-12 w-12 rounded-2xl bg-[#00897b]/10 flex items-center justify-center">
              <ClipboardList
                size={22}
                className="text-[#00897b]"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              Inventory Items
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              View all inventory
            </p>
          </Link>

          <Link
            href="/admin/inventory/new"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:border-[#00897b]/30 hover:shadow-md transition"
          >
            <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Plus
                size={22}
                className="text-blue-600"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              New Item
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Create inventory item
            </p>
          </Link>

              <Link
            href="/admin/inventory/purchase/add"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:border-[#00897b]/30 hover:shadow-md transition"
          >
            <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center">
              <PackagePlus
                size={22}
                className="text-orange-600"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              Stock Purchase
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Add stock
            </p>
          </Link>

          <Link
            href="/admin/inventory/adjust-stock"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:border-[#00897b]/30 hover:shadow-md transition"
          >
            <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center">
              <PackagePlus
                size={22}
                className="text-orange-600"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              Stock Adjustment
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Add or remove stock
            </p>
          </Link>

          <Link
            href="/admin/inventory/transactions"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:border-[#00897b]/30 hover:shadow-md transition"
          >
            <div className="h-12 w-12 rounded-2xl bg-purple-100 flex items-center justify-center">
              <BookOpen
                size={22}
                className="text-purple-600"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              Stock Transactions
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              View stock history
            </p>
          </Link>

          <Link
            href="/admin/inventory/categories"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:border-[#00897b]/30 hover:shadow-md transition"
          >
            <div className="h-12 w-12 rounded-2xl bg-purple-100 flex items-center justify-center">
              <Tags
                size={22}
                className="text-violet-600"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              Inventory Category
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              View
            </p>
          </Link>
          <Link
            href="/admin/inventory/supplier"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:border-[#00897b]/30 hover:shadow-md transition"
          >
            <div className="h-12 w-12 rounded-2xl bg-purple-100 flex items-center justify-center">
              <Truck
                size={22}
                className="text-violet-600"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              Suppliers
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              View
            </p>
          </Link>
        </div>

    </div>
    </div>
  );
}