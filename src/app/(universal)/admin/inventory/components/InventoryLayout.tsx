// components/inventory/InventoryTabs.tsx
"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
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
  { name: "New Item", href: "/admin/inventory/add" },
  { name: "Purchase", href: "/admin/inventory/purchase/add" },
  { name: "Adjust", href: "/admin/inventory/adjust-stock" },
  { name: "Transactions", href: "/admin/inventory/transactions" },
  { name: "Categories", href: "/admin/inventory/categories" },
  { name: "Suppliers", href: "/admin/inventory/supplier" },
];

export default function InventoryTabs() {
  const pathname = usePathname();

  return (
    <div className="bg-[#f6f8fb] p-2 pt-5 md:px-3">
      <div className="w-full mx-auto flex flex-col gap-2">

        {/* ===================================================== */}
        {/* QUICK ACTIONS */}
        {/* ===================================================== */}

        <div className="grid grid-cols-3 md:grid-cols-5 xl:grid-cols-9 gap-3">

          <Link
            href="/admin/inventory/purchase/add"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-2 hover:border-[#00897b]/30 hover:shadow-md transition"
          >
            <div className="h-12 w-8 rounded-2xl bg-orange-100 flex items-center justify-center">
              <PackagePlus
                size={22}
                className="text-orange-600"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              Purchase
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Add Raw stock
            </p>
          </Link>

          <Link
            href="/admin/inventory/supplier"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-2 hover:border-[#00897b]/30 hover:shadow-md transition"
          >
            <div className="h-12 w-8 rounded-2xl bg-purple-100 flex items-center justify-center">
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


          <Link
            href="/admin/inventory"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-2 hover:border-[#00897b]/30 hover:shadow-md transition"
          >
            <div className="h-12 w-8 rounded-2xl bg-[#00897b]/10 flex items-center justify-center">
              <ClipboardList
                size={22}
                className="text-[#00897b]"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              Raw Stock
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              View all inventory
            </p>
          </Link>

          <Link
            href="/admin/inventory/add"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-2 hover:border-[#00897b]/30 hover:shadow-md transition"
          >
            <div className="h-12 w-8 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Plus
                size={22}
                className="text-blue-600"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              Add Item
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              New stock item
            </p>
          </Link>



          <Link
            href="/admin/inventory/adjust-stock"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-2 hover:border-[#00897b]/30 hover:shadow-md transition"
          >
            <div className="h-12 w-8 rounded-2xl bg-orange-100 flex items-center justify-center">
              <PackagePlus
                size={22}
                className="text-orange-600"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              Adjustment
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Add or remove stock
            </p>
          </Link>

          <Link
            href="/admin/inventory/transactions"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-2 hover:border-[#00897b]/30 hover:shadow-md transition"
          >
            <div className="h-12 w-8 rounded-2xl bg-purple-100 flex items-center justify-center">
              <BookOpen
                size={22}
                className="text-purple-600"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              Transactions
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              View stock history
            </p>
          </Link>

          <Link
            href="/admin/inventory/categories"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-2 hover:border-[#00897b]/30 hover:shadow-md transition"
          >
            <div className="h-12 w-8 rounded-2xl bg-purple-100 flex items-center justify-center">
              <Tags
                size={22}
                className="text-violet-600"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              Categories
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Stock Categories
            </p>
          </Link>

          <Link
            href="/admin/inventory/product-recipes/recipes"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-2 hover:border-[#00897b]/30 hover:shadow-md transition"
          >
            <div className="h-12 w-8 rounded-2xl bg-purple-100 flex items-center justify-center">
              <Tags
                size={22}
                className="text-violet-600"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              Recipes
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              View
            </p>
          </Link>

          <div className="relative group">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-2 cursor-pointer hover:border-[#00897b]/30 hover:shadow-md transition">

              <div className="h-12 w-8 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Settings size={22} className="text-gray-600" />
              </div>

              <h3 className="font-semibold text-gray-800 mt-4">
                More
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Advanced tools
              </p>
            </div>

            {/* DROPDOWN */}
            <div className="absolute hidden group-hover:block bg-white border rounded-xl shadow-md mt-2 w-56 z-50">

              <Link
                href="/admin/inventory/init"
                className="block px-4 py-5  -mt-5 text-sm hover:bg-gray-100"
              >
                Product Stock Setup
              </Link>

              {/* future rare tools */}
              {/* <Link
      href="/admin/inventory/import"
      className="block px-4 py-2 text-sm hover:bg-gray-100"
    >
      Import Data
    </Link> */}

            </div>
          </div>


        </div>



      </div>
    </div>
  );
}