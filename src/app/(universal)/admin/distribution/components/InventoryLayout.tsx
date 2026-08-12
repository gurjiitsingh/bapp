// components/inventory/InventoryTabs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ArrowDownFromLine,
  BookOpen,
  ClipboardList,
  PackageMinus,
  PackagePlus,
  RouteIcon,
  Truck,
  Undo2,
} from "lucide-react";

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
      <div
        className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
          active ? activeIconBg : iconBg
        }`}
      >
        {icon}
      </div>

      <h5
        className={`font-normal text-sm ${
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
          py-1
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

export default function InventoryTabs() {
  const pathname = usePathname();

  // =====================================================
  // ACTIVE STATES
  // =====================================================

  const isProduction =
    pathname === "/admin/distribution/load-operator";

  const isSale =
    pathname.startsWith(
      "/admin/distribution/truckdelivery-sale"
    );

  const isTransactions =
    pathname.startsWith(
      "/admin/distribution/stock-movements"
    );

  const isTrip =
    pathname.startsWith(
      "/admin/distribution/trips"
    );

  const isSaleman =
    pathname.startsWith(
      "/admin/distribution/saleman-settlements"
    );

  const isReports =
    pathname.startsWith(
      "/admin/distribution/sales"
    );

  const isVehicle =
    pathname.startsWith(
      "/admin/distribution/vehicle"
    );

  const isRoute =
    pathname.startsWith(
      "/admin/distribution/sale-route"
    );

  const isCustomerReturn =
    pathname.startsWith(
      "/admin/distribution/truckdelivery-return"
    );

  const isUnload =
    pathname ===
    "/admin/distribution/unload-operator";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="p-2 pt-5 md:px-6">
      <div className="w-full mx-auto flex flex-col gap-6">

        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <div className="grid grid-cols-3 gap-3 xl:grid-cols-10">

          {/* =====================================================
              LOAD VEHICLE
          ===================================================== */}

          <ActionCard
            href="/admin/distribution/load-operator"
            active={isProduction}
            activeBg="bg-purple-50 border-purple-300 shadow-md"
            inactiveHover="hover:border-purple-300 hover:shadow-md"
            iconBg="bg-purple-100"
            activeIconBg="bg-purple-600"
            icon={
              <PackagePlus
                size={22}
                className={
                  isProduction
                    ? "text-white"
                    : "text-purple-600"
                }
              />
            }
            title="Load Vehicle"
            description="Transfer Products to Vehicle"
            titleColor="text-gray-800"
            activeTitleColor="text-purple-700"
          />

          {/* =====================================================
              TRUCK SALE
          ===================================================== */}

          <ActionCard
            href="/admin/distribution/truckdelivery-sale"
            active={isSale}
            activeBg="bg-orange-50 border-orange-300 shadow-md"
            inactiveHover="hover:border-orange-300 hover:shadow-md"
            iconBg="bg-orange-100"
            activeIconBg="bg-orange-500"
            icon={
              <PackageMinus
                size={22}
                className={
                  isSale
                    ? "text-white"
                    : "text-orange-600"
                }
              />
            }
            title="Truck Sale"
            description="Delivery Truck Sale"
            titleColor="text-gray-800"
            activeTitleColor="text-orange-700"
          />

          {/* =====================================================
              STOCK MOVEMENTS
          ===================================================== */}

          <ActionCard
            href="/admin/distribution/stock-movements"
            active={isTransactions}
            activeBg="bg-amber-500/10 border-amber-500/40 shadow-md"
            inactiveHover="hover:border-amber-500/30 hover:shadow-md"
            iconBg="bg-amber-100"
            activeIconBg="bg-amber-500"
            icon={
              <BookOpen
                size={22}
                className={
                  isTransactions
                    ? "text-white"
                    : "text-amber-600"
                }
              />
            }
            title="Movements"
            description="View all stock movements"
            titleColor="text-gray-800"
            activeTitleColor="text-amber-600"
          />

          {/* =====================================================
              TRIPS
          ===================================================== */}

          <ActionCard
            href="/admin/distribution/trips"
            active={isTrip}
            activeBg="bg-sky-500/10 border-sky-500/40 shadow-md"
            inactiveHover="hover:border-sky-500/30 hover:shadow-md"
            iconBg="bg-sky-100"
            activeIconBg="bg-sky-500"
            icon={
              <Truck
                size={22}
                className={
                  isTrip
                    ? "text-white"
                    : "text-sky-600"
                }
              />
            }
            title="Trip"
            description="View distribution trips"
            titleColor="text-gray-800"
            activeTitleColor="text-sky-600"
          />

          {/* =====================================================
              SALESMAN
          ===================================================== */}

          <ActionCard
            href="/admin/distribution/saleman-settlements"
            active={isSaleman}
            activeBg="bg-[#00897b]/10 border-[#00897b]/40 shadow-md"
            inactiveHover="hover:border-[#00897b]/30 hover:shadow-md"
            iconBg="bg-[#00897b]/10"
            activeIconBg="bg-[#00897b]"
            icon={
              <ClipboardList
                size={22}
                className={
                  isSaleman
                    ? "text-white"
                    : "text-[#00897b]"
                }
              />
            }
            title="Saleman"
            description="View salesman settlements"
            titleColor="text-gray-800"
            activeTitleColor="text-[#00897b]"
          />

          {/* =====================================================
              REPORTS
          ===================================================== */}

          <ActionCard
            href="/admin/distribution/sales"
            active={isReports}
            activeBg="bg-blue-500/10 border-blue-500/40 shadow-md"
            inactiveHover="hover:border-blue-500/30 hover:shadow-md"
            iconBg="bg-blue-100"
            activeIconBg="bg-blue-500"
            icon={
              <BookOpen
                size={22}
                className={
                  isReports
                    ? "text-white"
                    : "text-blue-600"
                }
              />
            }
            title="Reports"
            description="View distribution reports"
            titleColor="text-gray-800"
            activeTitleColor="text-blue-600"
          />

          {/* =====================================================
              VEHICLE
          ===================================================== */}

          <ActionCard
            href="/admin/distribution/vehicle"
            active={isVehicle}
            activeBg="bg-yellow-50 border-yellow-300 shadow-md"
            inactiveHover="hover:border-yellow-400/30 hover:shadow-md"
            iconBg="bg-yellow-100"
            activeIconBg="bg-yellow-500"
            icon={
              <Truck
                size={22}
                className={
                  isVehicle
                    ? "text-white"
                    : "text-yellow-600"
                }
              />
            }
            title="Vehicle"
            description="View / Add new Vehicles"
            titleColor="text-gray-800"
            activeTitleColor="text-yellow-700"
          />

          {/* =====================================================
              ROUTE
          ===================================================== */}

          <ActionCard
            href="/admin/distribution/sale-route"
            active={isRoute}
            activeBg="bg-indigo-50 border-indigo-300 shadow-md"
            inactiveHover="hover:border-indigo-400/30 hover:shadow-md"
            iconBg="bg-indigo-100"
            activeIconBg="bg-indigo-500"
            icon={
              <RouteIcon
                size={22}
                className={
                  isRoute
                    ? "text-white"
                    : "text-indigo-600"
                }
              />
            }
            title="Route"
            description="Manage delivery routes"
            titleColor="text-gray-800"
            activeTitleColor="text-indigo-700"
          />

          {/* =====================================================
              RETURN
          ===================================================== */}

          <ActionCard
            href="/admin/distribution/truckdelivery-return/add"
            active={isCustomerReturn}
            activeBg="bg-red-500/10 border-red-500/40 shadow-md"
            inactiveHover="hover:border-red-500/30 hover:shadow-md"
            iconBg="bg-red-100"
            activeIconBg="bg-red-500"
            icon={
              <Undo2
                size={22}
                className={
                  isCustomerReturn
                    ? "text-white"
                    : "text-red-600"
                }
              />
            }
            title="Return"
            description="Return products from customer"
            titleColor="text-gray-800"
            activeTitleColor="text-red-600"
          />

          {/* =====================================================
              UNLOAD VEHICLE
          ===================================================== */}

          <ActionCard
            href="/admin/distribution/unload-operator"
            active={isUnload}
            activeBg="bg-cyan-50 border-cyan-300 shadow-md"
            inactiveHover="hover:border-cyan-300 hover:shadow-md"
            iconBg="bg-cyan-100"
            activeIconBg="bg-cyan-600"
            icon={
              <ArrowDownFromLine
                size={22}
                className={
                  isUnload
                    ? "text-white"
                    : "text-cyan-600"
                }
              />
            }
            title="Unload Vehicle"
            description="Transfer Product to Store"
            titleColor="text-gray-800"
            activeTitleColor="text-cyan-700"
          />

        </div>
      </div>
    </div>
  );
}