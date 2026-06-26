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
  { name: "Dashboard", href: "/admin/stock-finished/" },
  { name: "Items", href: "/admin/stock-finished/" },
  { name: "New Item", href: "/admin/stock-finished/new" },
  { name: "Sale", href: "/admin/stock-finished/sale/add" },
  { name: "Adjust", href: "/admin/stock-finished/adjust-stock" },
  { name: "Transactions", href: "/admin/stock-finished/transactions" },
  { name: "Categories", href: "/admin/stock-finished/categories" },
  { name: "wholesaleCustomer", href: "/admin/stock-finished/customer" },
];

export default function InventoryTabs() {
  const pathname = usePathname();

  return (
    <div className="  p-2 pt-5 md:px-6">
      <div className="w-full mx-auto flex flex-col gap-6">

        {/* ===================================================== */}
        {/* QUICK ACTIONS */}
        {/* ===================================================== */}

        <div className="grid grid-cols-2 xl:grid-cols-7 gap-3">

          <Link
            href="/admin/stock-finished/production"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:border-[#00897b]/30 hover:shadow-md transition"
          >
            <div className="h-12 w-12 rounded-2xl bg-purple-100 flex items-center justify-center">
              <BookOpen
                size={22}
                className="text-purple-600"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              Production
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Produce Finished Goods
            </p>
          </Link>

          {/* <Link
            href="/admin/stock-finished/purchase"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:border-[#00897b]/30 hover:shadow-md transition"
          >
            <div className="h-12 w-12 rounded-2xl bg-purple-100 flex items-center justify-center">
              <BookOpen
                size={22}
                className="text-purple-600"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              Purcahse
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Purchase Finished Goods
            </p>
          </Link> */}

          <Link
            href="/admin/stock-finished/sale/add"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:border-[#00897b]/30 hover:shadow-md transition"
          >
            <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center">
              <PackagePlus
                size={22}
                className="text-orange-600"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              Stock Sell
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Sale items
            </p>
          </Link>

          <Link
            href="/admin/stock-finished/customer"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:border-[#00897b]/30 hover:shadow-md transition"
          >
            <div className="h-12 w-12 rounded-2xl bg-purple-100 flex items-center justify-center">
              <Truck
                size={22}
                className="text-violet-600"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              Customers
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              View
            </p>
          </Link>


          <Link
            href="/admin/stock-finished/"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:border-[#00897b]/30 hover:shadow-md transition"
          >
            <div className="h-12 w-12 rounded-2xl bg-[#00897b]/10 flex items-center justify-center">
              <ClipboardList
                size={22}
                className="text-[#00897b]"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              Finished Products
            </h3>

            <p className="text-sm text-gray-500 mt-1">
             View all products
            </p>
          </Link>

          {/* <Link
            href="/admin/stock-finished/new"
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
          </Link> */}





          <Link
            href="/admin/stock-finished/transactions"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:border-[#00897b]/30 hover:shadow-md transition"
          >
            <div className="h-12 w-12 rounded-2xl bg-purple-100 flex items-center justify-center">
              <BookOpen
                size={22}
                className="text-purple-600"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
             Product Transactions
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              View all stock movements/transactions.
            </p>
          </Link>

          <Link
            href="/admin/stock-finished/adjust-stock"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:border-[#00897b]/30 hover:shadow-md transition"
          >
            <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center">
              <PackagePlus
                size={22}
                className="text-orange-600"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              Update Product Stock
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Add or remove finished items stock
            </p>
          </Link>
             <Link
            href="/admin/stock-finished/customer/return"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:border-[#00897b]/30 hover:shadow-md transition"
          >
            <div className="h-12 w-12 rounded-2xl bg-purple-100 flex items-center justify-center">
              <BookOpen
                size={22}
                className="text-purple-600"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              Cutomer Return
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Extra Finished Goods Return
            </p>
          </Link>

        </div>

      </div>
    </div>
  );
}