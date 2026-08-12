// components/inventory/InventoryTabs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Settings,
  Undo2,
  Tags,
  Truck,
  Plus,
  ClipboardList,
  PackagePlus,
  BookOpen,
} from "lucide-react";

export default function InventoryTabs() {
  const pathname = usePathname();

  // =====================================================
  // ACTIVE STATES
  // =====================================================

  const isPurchase = pathname.startsWith(
    "/admin/inventory/purchase"
  );

  const isSuppliers = pathname.startsWith(
    "/admin/inventory/supplier"
  );

  const isInventory =
    pathname === "/admin/inventory" ||
    pathname === "/admin/inventory/";

  const isTransactions = pathname.startsWith(
    "/admin/inventory/transactions"
  );

  const isCategories = pathname.startsWith(
    "/admin/inventory/categories"
  );

  const isRecipes = pathname.startsWith(
    "/admin/inventory/product-recipes"
  );

  const isAdjustment = pathname.startsWith(
    "/admin/inventory/adjust-stock"
  );

  const isReturn = pathname.startsWith(
    "/admin/inventory/supplier/stock-return"
  );

  const isMore = pathname.startsWith(
    "/admin/inventory/init"
  );

  return (
    <div className="grid grid-cols-3 md:grid-cols-5 xl:grid-cols-9 gap-3 mt-3 mx-2">

      {/* =====================================================
          PURCHASE
      ===================================================== */}

      <ActionCard
        href="/admin/inventory/purchase/add"
        active={isPurchase}
        activeBg="bg-orange-50 border-orange-300 shadow-md"
        inactiveHover="hover:border-orange-300 hover:shadow-md"
        iconBg="bg-orange-100"
        activeIconBg="bg-orange-500"
        icon={
          <Plus
            size={22}
            className={
              isPurchase
                ? "text-white"
                : "text-orange-600"
            }
          />
        }
        title="Purchase"
        description="Add Raw Stock"
        titleColor="text-gray-800"
        activeTitleColor="text-orange-700"
      />

      {/* =====================================================
          SUPPLIERS
      ===================================================== */}

      <ActionCard
        href="/admin/inventory/supplier"
        active={isSuppliers}
        activeBg="bg-violet-50 border-violet-300 shadow-md"
        inactiveHover="hover:border-violet-300 hover:shadow-md"
        iconBg="bg-violet-100"
        activeIconBg="bg-violet-600"
        icon={
          <Truck
            size={22}
            className={
              isSuppliers
                ? "text-white"
                : "text-violet-600"
            }
          />
        }
        title="Suppliers"
        description="View Suppliers"
        titleColor="text-gray-800"
        activeTitleColor="text-violet-700"
      />

      {/* =====================================================
          RAW STOCK
      ===================================================== */}

      <ActionCard
        href="/admin/inventory"
        active={isInventory}
        activeBg="bg-[#00897b]/10 border-[#00897b]/40 shadow-md"
        inactiveHover="hover:border-[#00897b]/30 hover:shadow-md"
        iconBg="bg-[#00897b]/10"
        activeIconBg="bg-[#00897b]"
        icon={
          <PackagePlus
            size={22}
            className={
              isInventory
                ? "text-white"
                : "text-[#00897b]"
            }
          />
        }
        title="Raw Stock"
        description="View all inventory"
        titleColor="text-gray-800"
        activeTitleColor="text-[#00897b]"
      />

      {/* =====================================================
          TRANSACTIONS
      ===================================================== */}

      <ActionCard
        href="/admin/inventory/transactions"
        active={isTransactions}
        activeBg="bg-purple-50 border-purple-300 shadow-md"
        inactiveHover="hover:border-purple-300 hover:shadow-md"
        iconBg="bg-purple-100"
        activeIconBg="bg-purple-600"
        icon={
          <BookOpen
            size={22}
            className={
              isTransactions
                ? "text-white"
                : "text-purple-600"
            }
          />
        }
        title="Transactions"
        description="View Stock History"
        titleColor="text-gray-800"
        activeTitleColor="text-purple-700"
      />

      {/* =====================================================
          CATEGORIES
      ===================================================== */}

      <ActionCard
        href="/admin/inventory/categories"
        active={isCategories}
        activeBg="bg-pink-50 border-pink-300 shadow-md"
        inactiveHover="hover:border-pink-300 hover:shadow-md"
        iconBg="bg-pink-100"
        activeIconBg="bg-pink-600"
        icon={
          <Tags
            size={22}
            className={
              isCategories
                ? "text-white"
                : "text-pink-600"
            }
          />
        }
        title="Categories"
        description="Stock Categories"
        titleColor="text-gray-800"
        activeTitleColor="text-pink-700"
      />

      {/* =====================================================
          RECIPES
      ===================================================== */}

      <ActionCard
        href="/admin/inventory/product-recipes/recipes"
        active={isRecipes}
        activeBg="bg-indigo-50 border-indigo-300 shadow-md"
        inactiveHover="hover:border-indigo-300 hover:shadow-md"
        iconBg="bg-indigo-100"
        activeIconBg="bg-indigo-600"
        icon={
          <PackagePlus
            size={22}
            className={
              isRecipes
                ? "text-white"
                : "text-indigo-600"
            }
          />
        }
        title="Recipes"
        description="View Recipes"
        titleColor="text-gray-800"
        activeTitleColor="text-indigo-700"
      />

      {/* =====================================================
          ADJUSTMENT
      ===================================================== */}

      <ActionCard
        href="/admin/inventory/adjust-stock"
        active={isAdjustment}
        activeBg="bg-amber-50 border-amber-300 shadow-md"
        inactiveHover="hover:border-amber-300 hover:shadow-md"
        iconBg="bg-amber-100"
        activeIconBg="bg-amber-500"
        icon={
          <ClipboardList
            size={22}
            className={
              isAdjustment
                ? "text-white"
                : "text-amber-600"
            }
          />
        }
        title="Adjustment"
        description="Add or Remove Stock"
        titleColor="text-gray-800"
        activeTitleColor="text-amber-700"
      />

      {/* =====================================================
          STOCK RETURN
      ===================================================== */}

      <ActionCard
        href="/admin/inventory/supplier/stock-return"
        active={isReturn}
        activeBg="bg-blue-50 border-blue-300 shadow-md"
        inactiveHover="hover:border-blue-300 hover:shadow-md"
        iconBg="bg-blue-100"
        activeIconBg="bg-blue-600"
        icon={
          <Undo2
            size={22}
            className={
              isReturn
                ? "text-white"
                : "text-blue-600"
            }
          />
        }
        title="Stock Return"
        description="Return to Supplier"
        titleColor="text-gray-800"
        activeTitleColor="text-blue-700"
      />

      {/* =====================================================
          MORE
      ===================================================== */}

      <ActionCard
        href="/admin/inventory/init"
        active={isMore}
        activeBg="bg-gray-100 border-gray-300 shadow-md"
        inactiveHover="hover:border-gray-300 hover:shadow-md"
        iconBg="bg-gray-100"
        activeIconBg="bg-gray-700"
        icon={
          <Settings
            size={22}
            className={
              isMore
                ? "text-white"
                : "text-gray-600"
            }
          />
        }
        title="More"
        description="Advanced Tools"
        titleColor="text-gray-800"
        activeTitleColor="text-gray-700"
      />

    </div>
  );
}


// =========================================================
// REUSABLE ACTION CARD
// =========================================================

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
    className={`group relative rounded-2xl border shadow-sm p-1 transition-all duration-300 ${
      active
        ? activeBg
        : `bg-white border-gray-100 ${inactiveHover}`
    }`}
  >
    <div className="flex items-center gap-1">

      {/* ICON */}
      <div
        className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
          active
            ? activeIconBg
            : iconBg
        }`}
      >
        {icon}
      </div>

      {/* TITLE */}
      <h5
        className={`font-normal text-sm ${
          active
            ? activeTitleColor
            : titleColor
        }`}
      >
        {title}
      </h5>

    </div>

    {/* =====================================================
        FLOATING TOOLTIP
    ===================================================== */}

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
          py-0
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

        {/* TOOLTIP ARROW */}
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