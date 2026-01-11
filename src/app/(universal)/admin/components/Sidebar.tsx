"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, JSX } from "react";
import { useLanguage } from "@/store/LanguageContext";

import { GoHome } from "react-icons/go";
import {
  MdDashboard,
  MdCategory,
  MdLocalOffer,
  MdInventory,
  MdRestaurantMenu,
  MdSettings,
  MdOutlineCrisisAlert,
  MdOutlineBackup,
  MdAccessTime,
} from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { BsCardList } from "react-icons/bs";
import { TbTruckDelivery } from "react-icons/tb";
import { IoIosLogOut } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { FaClipboardList } from "react-icons/fa6";

import { UseSiteContext } from "@/SiteContext/SiteContext";

type SidebarFlagKey =
  | "SHOW_HOME"
  | "SHOW_ORDERS"
  | "SHOW_ORDERS_REALTIME"
  | "SHOW_SALE"
  | "SHOW_RESERVATIONS"
  | "SHOW_CATEGORIES"
  | "SHOW_PICKUP_DISCOUNT"
  | "SHOW_PRODUCTS"
  | "SHOW_VARIANTS"
  | "SHOW_COUPON"
  | "SHOW_DELIVERY"
  | "SHOW_LOCATIONS"
  | "SHOW_USERS"
  | "SHOW_TIMMING"
  | "SHOW_SETTING"
  | "SHOW_DATA_BACKUP"
  | "SHOW_OUTLET";   // ⭐ NEW

type Titem = {
  key: SidebarFlagKey;
  name: string;
  link: string;
  icon: JSX.Element;
};

// ⭐ DEFAULT TRUE — ONLY HIDE IF env = "0"
function flag(env?: string) {
  return env !== "0";
}

export const sidebarFlags: Record<SidebarFlagKey, boolean> = {
  SHOW_HOME: flag(process.env.NEXT_PUBLIC_SHOW_HOME),
  SHOW_ORDERS: flag(process.env.NEXT_PUBLIC_SHOW_ORDERS),
  SHOW_ORDERS_REALTIME: flag(process.env.NEXT_PUBLIC_SHOW_ORDERS_REALTIME),
  SHOW_SALE: flag(process.env.NEXT_PUBLIC_SHOW_SALE),
  SHOW_RESERVATIONS: flag(process.env.NEXT_PUBLIC_SHOW_RESERVATIONS),
  SHOW_CATEGORIES: flag(process.env.NEXT_PUBLIC_SHOW_CATEGORIES),
  SHOW_PICKUP_DISCOUNT: flag(process.env.NEXT_PUBLIC_SHOW_PICKUP_DISCOUNT),
  SHOW_PRODUCTS: flag(process.env.NEXT_PUBLIC_SHOW_PRODUCTS),
  SHOW_VARIANTS: flag(process.env.NEXT_PUBLIC_SHOW_VARIANTS),
  SHOW_COUPON: flag(process.env.NEXT_PUBLIC_SHOW_COUPON),
  SHOW_DELIVERY: flag(process.env.NEXT_PUBLIC_SHOW_DELIVERY),
  SHOW_LOCATIONS: flag(process.env.NEXT_PUBLIC_SHOW_LOCATIONS),
  SHOW_USERS: flag(process.env.NEXT_PUBLIC_SHOW_USERS),
  SHOW_TIMMING: flag(process.env.NEXT_PUBLIC_SHOW_TIMMING),
  SHOW_SETTING: flag(process.env.NEXT_PUBLIC_SHOW_SETTING),
  SHOW_DATA_BACKUP: flag(process.env.NEXT_PUBLIC_SHOW_DATA_BACKUP),

  SHOW_OUTLET: flag(process.env.NEXT_PUBLIC_SHOW_OUTLET),   // ⭐ NEW
};

const Sidebar = () => {
  const { BRANDING } = useLanguage() || {
    BRANDING: {
      sidebar: {
        home: "Home",
        orders: "Orders",
        orders_realtime: "Orders Realtime",
        sale: "Sale",
        reservations: "Reservations",
        categories: "Categories",
        pickup_discount: "Pickup Discount",
        products: "Products",
        variants: "Variants",
        coupon: "Coupon",
        delivery: "Delivery",
        users: "Users",
        dayschedule: "Opening Timing",
        setting: "Setting",
        data_backup: "Data Backup",
        logout: "Logout",
      },
    },
  };

  const { setAdminSideBarToggleG } = UseSiteContext();

  const menuList: Titem[] = [
    { key: "SHOW_HOME", name: BRANDING.sidebar.home, link: "/", icon: <GoHome /> },
    { key: "SHOW_ORDERS", name: BRANDING.sidebar.orders, link: "/admin", icon: <MdDashboard /> },
    {
      key: "SHOW_ORDERS_REALTIME",
      name: BRANDING.sidebar.orders_realtime,
      link: "/admin/order-realtime",
      icon: <MdOutlineCrisisAlert />,
    },
    { key: "SHOW_CATEGORIES", name: BRANDING.sidebar.categories, link: "/admin/categories", icon: <MdCategory /> },
    { key: "SHOW_PRODUCTS", name: BRANDING.sidebar.products, link: "/admin/products", icon: <MdInventory /> },

    { key: "SHOW_RESERVATIONS", name: BRANDING.sidebar.reservations, link: "/admin/reservations", icon: <BsCardList /> },

    { key: "SHOW_SALE", name: BRANDING.sidebar.sale, link: "/admin/sale", icon: <FaClipboardList /> },

    {
      key: "SHOW_PICKUP_DISCOUNT",
      name: BRANDING.sidebar.pickup_discount,
      link: "/admin/pickupdiscount/pickup-discount",
      icon: <MdLocalOffer />,
    },

    { key: "SHOW_VARIANTS", name: BRANDING.sidebar.variants, link: "/admin/flavorsProductG", icon: <MdRestaurantMenu /> },

    { key: "SHOW_COUPON", name: BRANDING.sidebar.coupon, link: "/admin/coupon", icon: <MdLocalOffer /> },

    { key: "SHOW_DELIVERY", name: BRANDING.sidebar.delivery, link: "/admin/delivery", icon: <TbTruckDelivery /> },

    { key: "SHOW_LOCATIONS", name: "Locations", link: "/admin/locations", icon: <TbTruckDelivery /> },

    { key: "SHOW_USERS", name: BRANDING.sidebar.users, link: "/admin/users", icon: <FaUsers /> },

    { key: "SHOW_TIMMING", name: "Opening Timing", link: "/admin/day-schedule/form", icon: <MdAccessTime /> },

    {
      key: "SHOW_OUTLET",
      name: "Outlet",
      link: "/admin/outlet",
      icon: <MdSettings />,
    },

    { key: "SHOW_SETTING", name: BRANDING.sidebar.setting, link: "/admin/setting", icon: <MdSettings /> },

    { key: "SHOW_DATA_BACKUP", name: BRANDING.sidebar.data_backup, link: "/admin/data-backup", icon: <MdOutlineBackup /> },
  ];

  const filteredMenu = menuList.filter((item) => sidebarFlags[item.key]);

  return (
    <>
      <div className="flex items-center pt-4 px-4 justify-between lg:hidden">
        <div></div>
        <button
          onClick={() => setAdminSideBarToggleG(false)}
          className="p-2 rounded-full hover:bg-gray-700 transition"
          aria-label="close sidebar"
        >
          <IoClose size={24} className="text-white" />
        </button>
      </div>

      <div className="pt-6 h-screen w-[260px] flex flex-col justify-between px-3 py-6 sb-bg shadow-md">
        <ul className="flex flex-col gap-1">
          {filteredMenu.map((item) => (
            <Tab key={item.link} item={item} />
          ))}
        </ul>

        <div className="mt-6 pt-4">
          <button className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium rounded-md bg-amber-600 text-white hover:bg-rose-700 transition">
            <IoIosLogOut size={20} />
            {BRANDING.sidebar.logout}
          </button>
        </div>
      </div>
    </>
  );
};

function Tab({ item }: { item: Titem }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  const isSelected = pathname === item.link;
  const baseClasses = isSelected ? "sb-tab-active" : "sb-tab";

  return (
    <Link
      href={item.link}
      className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-all ${baseClasses}`}
    >
      <span className="text-lg">{item.icon}</span>
      <span>{item.name}</span>
    </Link>
  );
}

export default Sidebar;
