// components/inventory/InventoryTabs.tsx
"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowDownFromLine, ChartColumn, PackageMinus, Undo2 } from "lucide-react";
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
  ShoppingCart,
  Receipt,
  BadgeDollarSign,
  HandCoins,
  Store,
  CreditCard,
  PackageCheck,
  CircleDollarSign,
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
  { name: "Sale", href: "/admin/distribution/truckdelivery-sale" },
  { name: "Adjust", href: "/admin/stock-finished/adjust-stock" },
  { name: "Transactions", href: "/admin/distribution/stock-movements" },
  { name: "Categories", href: "/admin/stock-finished/categories" },
  { name: "wholesaleCustomer", href: "/admin/stock-finished/customer/all" },
];

export default function InventoryTabs() {
  const pathname = usePathname();

  const isProduction =
    pathname ===
    "/admin/distribution/load-operator";

  const isSale = pathname.startsWith(
    "/admin/distribution/truckdelivery-sale"
  );

  const isCustomer = pathname.startsWith(
    "/admin/stock-finished/customer/all"
  );

  const isProducts =
    pathname === "/admin/stock-finished/" ||
    pathname === "/admin/stock-finished";

  const isTransactions = pathname.startsWith(
    "/admin/distribution/stock-movements"
  );

  const isAdjustStock = pathname.startsWith(
    "/admin/stock-finished/adjust-stock"
  );

  const isCustomerReturn = pathname.startsWith(
    "/admin/stock-finished/customer/return"
  );

  const isEstimate =
  pathname === "/admin/distribution/unload-operator";

  return (
    <div className="  p-2 pt-5 md:px-6">
      <div className="w-full mx-auto flex flex-col gap-6">

        {/* ===================================================== */}
        {/* QUICK ACTIONS */}
        {/* ===================================================== */}

        <div className="grid grid-cols-2 xl:grid-cols-8 gap-3">

          <Link
            href="/admin/distribution/load-operator"
            className={`group rounded-3xl border shadow-sm p-5 transition ${isProduction
                ? "bg-purple-50 border-purple-300 shadow-md"
                : "bg-white border-gray-100 hover:border-[#00897b]/30 hover:shadow-md"
              }`}
          >
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center ${isProduction
                  ? "bg-purple-600"
                  : "bg-purple-100"
                }`}
            > <PackagePlus
             
                size={22}
                className={
                  isProduction
                    ? "text-white"
                    : "text-purple-600"
                }
              />
            </div>

            <h3
              className={`font-semibold mt-4 ${isProduction
                  ? "text-purple-700"
                  : "text-gray-800"
                }`}
            >
              Load Vehicle
            </h3>

            <p
              className={`text-sm mt-1 ${isProduction
                  ? "text-purple-500"
                  : "text-gray-500"
                }`}
            >
              Transfer Products to Vehicle
            </p>
          </Link>



          <Link
            href="/admin/distribution/truckdelivery-sale"
            className={`group rounded-3xl border shadow-sm p-5 transition ${isSale
                ? "bg-orange-50 border-orange-300 shadow-md"
                : "bg-white border-gray-100 hover:border-[#00897b]/30 hover:shadow-md"
              }`}
          >
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center ${isSale
                  ? "bg-orange-500"
                  : "bg-orange-100"
                }`}
            >
              <PackageMinus
                size={22}
                className={
                  isSale
                    ? "text-white"
                    : "text-orange-600"
                }
              />
            </div>

            <h3
              className={`font-semibold mt-4 ${isSale
                  ? "text-orange-700"
                  : "text-gray-800"
                }`}
            >
              Truck Sale
            </h3>

            <p
              className={`text-sm mt-1 ${isSale
                  ? "text-orange-600"
                  : "text-gray-500"
                }`}
            >
              Delivery Truck Sale
            </p>
          </Link>

        


          {/* <Link
            href="/admin/stock-finished/"
            className={`group rounded-3xl border shadow-sm p-5 transition ${isProducts
                ? "bg-[#00897b]/10 border-[#00897b]/40 shadow-md"
                : "bg-white border-gray-100 hover:border-[#00897b]/30 hover:shadow-md"
              }`}
          >
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center ${isProducts
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
              className={`font-semibold mt-4 ${isProducts
                  ? "text-[#00897b]"
                  : "text-gray-800"
                }`}
            >
              Finished Products
            </h3>

            <p
              className={`text-sm mt-1 ${isProducts
                  ? "text-[#00897b]/80"
                  : "text-gray-500"
                }`}
            >
              View all products
            </p>
          </Link> */}





          <Link
            href="/admin/distribution/stock-movements"
            className={`group rounded-3xl border shadow-sm p-5 transition ${isTransactions
                ? "bg-amber-500/10 border-amber-500/40 shadow-md"
                : "bg-white border-gray-100 hover:border-amber-500/30 hover:shadow-md"
              }`}
          >
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center ${isTransactions
                  ? "bg-amber-500"
                  : "bg-amber-100"
                }`}
            >
              <BookOpen
                size={22}
                className={
                  isTransactions
                    ? "text-white"
                    : "text-amber-600"
                }
              />
            </div>

            <h3
              className={`font-semibold mt-4 ${isTransactions
                  ? "text-amber-600"
                  : "text-gray-800"
                }`}
            >
              Stock Movements
            </h3>

            <p
              className={`text-sm mt-1 ${isTransactions
                  ? "text-amber-600/80"
                  : "text-gray-500"
                }`}
            >
              View all stock movements.
            </p>
          </Link>
   
   
          {/* <Link
            href="/admin/stock-finished/adjust-stock"
            className={`group rounded-3xl border shadow-sm p-5 transition ${isAdjustStock
                ? "bg-blue-500/10 border-blue-500/40 shadow-md"
                : "bg-white border-gray-100 hover:border-blue-500/30 hover:shadow-md"
              }`}
          >
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center ${isAdjustStock
                  ? "bg-blue-500"
                  : "bg-blue-100"
                }`}
            >
               <BookOpen
                size={22}
                className={
                  isAdjustStock
                    ? "text-white"
                    : "text-blue-600"
                }
              />
            </div>

            <h3
              className={`font-semibold mt-4 ${isAdjustStock
                  ? "text-blue-600"
                  : "text-gray-800"
                }`}
            >
              Update Product Stock
            </h3>

            <p
              className={`text-sm mt-1 ${isAdjustStock
                  ? "text-blue-600/80"
                  : "text-gray-500"
                }`}
            >
              Add or remove finished items stock
            </p>
          </Link> */}



       <Link  href="/admin/distribution/vehicle"
            className={`group rounded-3xl border shadow-sm p-5 transition ${isCustomer
                ? "bg-yellow-50 border-yellow-300 shadow-md"
                : "bg-white border-gray-100 hover:border-yellow-400/30 hover:shadow-md"
              }`}
          >
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center ${isCustomer
                  ? "bg-yellow-500"
                  : "bg-yellow-100"
                }`}
            >
              <Truck
                size={22}
                className={
                  isCustomer
                    ? "text-white"
                    : "text-yellow-600"
                }
              />
            </div>

            <h3
              className={`font-semibold mt-4 ${isCustomer
                  ? "text-yellow-700"
                  : "text-gray-800"
                }`}
            >
          Vehicle
            </h3>

            <p
              className={`text-sm mt-1 ${isCustomer
                  ? "text-yellow-600"
                  : "text-gray-500"
                }`}
            >
              View /Add new Vehicles
            </p>
          </Link>


          <Link
            href=" "
            className={`group rounded-3xl border shadow-sm p-5 transition ${isCustomerReturn
                ? "bg-red-500/10 border-red-500/40 shadow-md"
                : "bg-white border-gray-100 hover:border-red-500/30 hover:shadow-md"
              }`}
          >
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center ${isCustomerReturn
                  ? "bg-red-500"
                  : "bg-red-100"
                }`}
            >
             <Undo2
                size={22}
                className={
                  isCustomerReturn
                    ? "text-white"
                    : "text-red-600"
                }
              />
            </div>

            <h3
              className={`font-semibold mt-4 ${isCustomerReturn
                  ? "text-red-600"
                  : "text-gray-800"
                }`}
            >
             Load Customer Return
            </h3>

            <p
              className={`text-sm mt-1 ${isCustomerReturn
                  ? "text-red-600/80"
                  : "text-gray-500"
                }`}
            >
              Add customer to vehicle
            </p>
          </Link>



<Link
  href="/admin/distribution/unload-operator"
  className={`group rounded-3xl border shadow-sm p-5 transition ${
    isEstimate
      ? "bg-cyan-50 border-cyan-300 shadow-md"
      : "bg-white border-gray-100 hover:border-cyan-300 hover:shadow-md"
  }`}
>
  <div
    className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
      isEstimate ? "bg-cyan-600" : "bg-cyan-100"
    }`}
  >
 <ArrowDownFromLine
  size={22}
  className={
    isEstimate
      ? "text-white"
      : "text-cyan-600"
  } 
/>
  </div>

  <h3
    className={`font-semibold mt-4 ${
      isEstimate
        ? "text-cyan-700"
        : "text-gray-800"
    }`}
  >
    Unload Vehicle
  </h3>

  <p
    className={`text-sm mt-1 ${
      isEstimate
        ? "text-cyan-600"
        : "text-gray-500"
    }`}
  >
    Transfer Product to Store
  </p>
</Link>


        </div>

      </div>
    </div>
  );
}