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

  const isProduction =
  pathname ===
  "/admin/stock-finished/production";

  const isSale = pathname.startsWith(
  "/admin/stock-finished/sale"
);

const isCustomer = pathname.startsWith(
  "/admin/stock-finished/customer"
);

const isProducts =
  pathname === "/admin/stock-finished/" ||
  pathname === "/admin/stock-finished";

  return (
    <div className="  p-2 pt-5 md:px-6">
      <div className="w-full mx-auto flex flex-col gap-6">

        {/* ===================================================== */}
        {/* QUICK ACTIONS */}
        {/* ===================================================== */}

        <div className="grid grid-cols-2 xl:grid-cols-7 gap-3">

         <Link
  href="/admin/stock-finished/production"
  className={`group rounded-3xl border shadow-sm p-5 transition ${
    isProduction
      ? "bg-purple-50 border-purple-300 shadow-md"
      : "bg-white border-gray-100 hover:border-[#00897b]/30 hover:shadow-md"
  }`}
>
  <div
    className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
      isProduction
        ? "bg-purple-600"
        : "bg-purple-100"
    }`}
  >
    <BookOpen
      size={22}
      className={
        isProduction
          ? "text-white"
          : "text-purple-600"
      }
    />
  </div>

  <h3
    className={`font-semibold mt-4 ${
      isProduction
        ? "text-purple-700"
        : "text-gray-800"
    }`}
  >
    Production
  </h3>

  <p
    className={`text-sm mt-1 ${
      isProduction
        ? "text-purple-500"
        : "text-gray-500"
    }`}
  >
    Produce Finished Goods
  </p>
</Link>

        

      <Link
  href="/admin/stock-finished/sale/add"
  className={`group rounded-3xl border shadow-sm p-5 transition ${
    isSale
      ? "bg-orange-50 border-orange-300 shadow-md"
      : "bg-white border-gray-100 hover:border-[#00897b]/30 hover:shadow-md"
  }`}
>
  <div
    className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
      isSale
        ? "bg-orange-500"
        : "bg-orange-100"
    }`}
  >
    <PackagePlus
      size={22}
      className={
        isSale
          ? "text-white"
          : "text-orange-600"
      }
    />
  </div>

  <h3
    className={`font-semibold mt-4 ${
      isSale
        ? "text-orange-700"
        : "text-gray-800"
    }`}
  >
    Sell Products
  </h3>

  <p
    className={`text-sm mt-1 ${
      isSale
        ? "text-orange-600"
        : "text-gray-500"
    }`}
  >
    Sale Finished Products
  </p>
</Link>

   <Link
  href="/admin/stock-finished/customer"
  className={`group rounded-3xl border shadow-sm p-5 transition ${
    isCustomer
      ? "bg-violet-50 border-violet-300 shadow-md"
      : "bg-white border-gray-100 hover:border-[#00897b]/30 hover:shadow-md"
  }`}
>
  <div
    className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
      isCustomer
        ? "bg-violet-500"
        : "bg-purple-100"
    }`}
  >
    <Truck
      size={22}
      className={
        isCustomer
          ? "text-white"
          : "text-violet-600"
      }
    />
  </div>

  <h3
    className={`font-semibold mt-4 ${
      isCustomer
        ? "text-violet-700"
        : "text-gray-800"
    }`}
  >
    Customers
  </h3>

  <p
    className={`text-sm mt-1 ${
      isCustomer
        ? "text-violet-600"
        : "text-gray-500"
    }`}
  >
    View customers and manage accounts
  </p>
</Link>


   <Link
  href="/admin/stock-finished/"
  className={`group rounded-3xl border shadow-sm p-5 transition ${
    isProducts
      ? "bg-[#00897b]/10 border-[#00897b]/40 shadow-md"
      : "bg-white border-gray-100 hover:border-[#00897b]/30 hover:shadow-md"
  }`}
>
  <div
    className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
      isProducts
        ? "bg-[#00897b]"
        : "bg-[#00897b]/10"
    }`}
  >
    <ClipboardList
      size={22}
      className={
        isProducts
          ? "text-white"
          : "text-[#00897b]"
      }
    />
  </div>

  <h3
    className={`font-semibold mt-4 ${
      isProducts
        ? "text-[#00897b]"
        : "text-gray-800"
    }`}
  >
    Finished Products
  </h3>

  <p
    className={`text-sm mt-1 ${
      isProducts
        ? "text-[#00897b]/80"
        : "text-gray-500"
    }`}
  >
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