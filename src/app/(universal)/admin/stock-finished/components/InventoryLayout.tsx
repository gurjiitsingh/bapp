// components/inventory/InventoryTabs.tsx
"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartColumn, PackageMinus, Undo2 } from "lucide-react";
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
  { name: "Sale", href: "/admin/stock-finished/sale/add" },
  { name: "Adjust", href: "/admin/stock-finished/adjust-stock" },
  { name: "Transactions", href: "/admin/stock-finished/transactions" },
  { name: "Categories", href: "/admin/stock-finished/categories" },
  { name: "wholesaleCustomer", href: "/admin/stock-finished/customer/all" },
];

export default function InventoryTabs() {
  const pathname = usePathname();
  const isNewProducts = pathname.startsWith(
  "/admin/stock-finished/products"
);

  const isAccount = pathname.startsWith(
  "/admin/stock-finished/account"
);
  const isProduction =
    pathname ===
    "/admin/stock-finished/batchs";

  const isSale = pathname.startsWith(
    "/admin/stock-finished/sale"
  );

  const isCustomer = pathname.startsWith(
    "/admin/stock-finished/customer/all"
  );

  const isProducts =
    pathname === "/admin/stock-finished/" ||
    pathname === "/admin/stock-finished";

  const isTransactions = pathname.startsWith(
    "/admin/stock-finished/transactions"
  );

  const isAdjustStock = pathname.startsWith(
    "/admin/stock-finished/adjust-stock"
  );

  const isCustomerReturn = pathname.startsWith(
    "/admin/stock-finished/customer/return"
  );

  const isEstimate =
  pathname === "/admin/stock-finished/department";

  return (
  <div className="grid grid-cols-2 mt-3 mx-2 xl:grid-cols-9 gap-3">

  <ActionCard
    href="/admin/stock-finished/batchs"
    active={isProduction}
    activeBg="bg-purple-50 border-purple-300 shadow-md"
    inactiveHover="hover:border-purple-300 hover:shadow-md"
    iconBg="bg-purple-100"
    activeIconBg="bg-purple-600"
    icon={
      <PackagePlus
        size={22}
        className={isProduction ? "text-white" : "text-purple-600"}
      />
    }
    title="Production"
    description="Batches & Cost"
    titleColor="text-gray-800"
    activeTitleColor="text-purple-700"
  />

  <ActionCard
    href="/admin/stock-finished/department"
    active={isEstimate}
    activeBg="bg-cyan-50 border-cyan-300 shadow-md"
    inactiveHover="hover:border-cyan-300 hover:shadow-md"
    iconBg="bg-cyan-100"
    activeIconBg="bg-cyan-600"
    icon={
      <ChartColumn
        size={22}
        className={isEstimate ? "text-white" : "text-cyan-600"}
      />
    }
    title="Departments"
    description="Track Stock & Employees"
    titleColor="text-gray-800"
    activeTitleColor="text-cyan-700"
  />

  <ActionCard
    href="/admin/stock-finished/sale/add"
    active={isSale}
    activeBg="bg-orange-50 border-orange-300 shadow-md"
    inactiveHover="hover:border-orange-300 hover:shadow-md"
    iconBg="bg-orange-100"
    activeIconBg="bg-orange-500"
    icon={
      <PackageMinus
        size={22}
        className={isSale ? "text-white" : "text-orange-600"}
      />
    }
    title="Sell Products"
    description="Sale Finished Products"
    titleColor="text-gray-800"
    activeTitleColor="text-orange-700"
  />

  <ActionCard
    href="/admin/stock-finished/"
    active={isProducts}
    activeBg="bg-[#00897b]/10 border-[#00897b]/40 shadow-md"
    inactiveHover="hover:border-[#00897b]/30 hover:shadow-md"
    iconBg="bg-[#00897b]/10"
    activeIconBg="bg-[#00897b]"
    icon={
      <ClipboardList
        size={22}
        className={isProducts ? "text-white" : "text-[#00897b]"}
      />
    }
    title="Products"
    description="View all products"
    titleColor="text-gray-800"
    activeTitleColor="text-[#00897b]"
  />

  <ActionCard
    href="/admin/stock-finished/transactions"
    active={isTransactions}
    activeBg="bg-amber-50 border-amber-300 shadow-md"
    inactiveHover="hover:border-amber-300 hover:shadow-md"
    iconBg="bg-amber-100"
    activeIconBg="bg-amber-500"
    icon={
      <BookOpen
        size={22}
        className={isTransactions ? "text-white" : "text-amber-600"}
      />
    }
    title="Transactions"
    description="View all stock movements"
    titleColor="text-gray-800"
    activeTitleColor="text-amber-700"
  />

  <ActionCard
    href="/admin/stock-finished/adjust-stock"
    active={isAdjustStock}
    activeBg="bg-blue-50 border-blue-300 shadow-md"
    inactiveHover="hover:border-blue-300 hover:shadow-md"
    iconBg="bg-blue-100"
    activeIconBg="bg-blue-500"
    icon={
      <BookOpen
        size={22}
        className={isAdjustStock ? "text-white" : "text-blue-600"}
      />
    }
    title="Update Stock"
    description="Add or remove finished stock"
    titleColor="text-gray-800"
    activeTitleColor="text-blue-700"
  />

  <ActionCard
    href="/admin/stock-finished/customer/all"
    active={isCustomer}
    activeBg="bg-yellow-50 border-yellow-300 shadow-md"
    inactiveHover="hover:border-yellow-300 hover:shadow-md"
    iconBg="bg-yellow-100"
    activeIconBg="bg-yellow-500"
    icon={
      <Truck
        size={22}
        className={isCustomer ? "text-white" : "text-yellow-600"}
      />
    }
    title="Customers"
    description="View customers & accounts"
    titleColor="text-gray-800"
    activeTitleColor="text-yellow-700"
  />

  <ActionCard
    href="/admin/stock-finished/customer/return"
    active={isCustomerReturn}
    activeBg="bg-red-50 border-red-300 shadow-md"
    inactiveHover="hover:border-red-300 hover:shadow-md"
    iconBg="bg-red-100"
    activeIconBg="bg-red-500"
    icon={
      <Undo2
        size={22}
        className={isCustomerReturn ? "text-white" : "text-red-600"}
      />
    }
    title="Customer Return"
    description="Finished goods return"
    titleColor="text-gray-800"
    activeTitleColor="text-red-700"
  />

  <ActionCard
    href="/admin/stock-finished/account"
    active={isAccount}
    activeBg="bg-emerald-50 border-emerald-300 shadow-md"
    inactiveHover="hover:border-emerald-300 hover:shadow-md"
    iconBg="bg-emerald-100"
    activeIconBg="bg-emerald-600"
    icon={
      <IndianRupee
        size={22}
        className={isAccount ? "text-white" : "text-emerald-600"}
      />
    }
    title="Accounts"
    description="Assets & liabilities"
    titleColor="text-gray-800"
    activeTitleColor="text-emerald-700"
  />

  {/* <ActionCard
    href="/admin/stock-finished/products"
    active={isNewProducts}
    activeBg="bg-indigo-50 border-indigo-300 shadow-md"
    inactiveHover="hover:border-indigo-300 hover:shadow-md"
    iconBg="bg-indigo-100"
    activeIconBg="bg-indigo-600"
    icon={
      <Boxes
        size={22}
        className={isNewProducts ? "text-white" : "text-indigo-600"}
      />
    }
    title="+ Products"
    description=" "
    titleColor="text-gray-800"
    activeTitleColor="text-indigo-700"
  /> */}

</div>
  );
}



const ActionCard = ({
  href,
  active,
  activeBg,
  inactiveHover,
  iconBg,
  activeIconBg,
  icon,
  title,
  description,
  titleColor,
  activeTitleColor,
}: {
  href: string;
  active: boolean;
  activeBg: string;
  inactiveHover: string;
  iconBg: string;
  activeIconBg: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  titleColor: string;
  activeTitleColor: string;
}) => (
 <Link
  href={href}
  className={`group relative rounded-3xl border shadow-sm p-5 transition-all duration-300 ${
    active
      ? activeBg
      : `bg-white border-gray-100 ${inactiveHover}`
  }`}
>
  <div className="flex items-center gap-2">
  <div
    className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
      active ? activeIconBg : iconBg
    }`}
  >
    {icon}
  </div>

  <h5
    className={`font-normal text-sm mt-4 ${
      active ? activeTitleColor : titleColor
    }`}
  >
    {title}
  </h5>
</div>
  {/* Floating Tooltip */}
  {!active && (
    <div
      className="
        pointer-events-none
        absolute
        left-1/2
        top-full
        z-50
        mt-3
        -translate-x-1/2
        rounded-xl
        bg-gray-900
        px-3
        py-2
        text-xs
        text-white
        whitespace-nowrap
        opacity-0
        shadow-xl
        transition-all
        duration-200
        group-hover:opacity-100
        group-hover:translate-y-1
      "
    >
      {description}

      {/* Arrow */}
      <div
        className="
          absolute
          -top-1.5
          left-1/2
          h-3
          w-3
          -translate-x-1/2
          rotate-45
          bg-gray-900
        "
      />
    </div>
  )}
</Link>
);