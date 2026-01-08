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
  | "SHOW_DATA_BACKUP";


type Titem = {
  key: SidebarFlagKey;
  name: string;
  link: string;
  icon: JSX.Element;
};

export const sidebarFlags: Record<SidebarFlagKey, boolean> = {
  SHOW_HOME: process.env.NEXT_PUBLIC_SHOW_HOME === "1",
  SHOW_ORDERS: process.env.NEXT_PUBLIC_SHOW_ORDERS === "1",
  SHOW_ORDERS_REALTIME: process.env.NEXT_PUBLIC_SHOW_ORDERS_REALTIME === "1",
  SHOW_SALE: process.env.NEXT_PUBLIC_SHOW_SALE === "1",
  SHOW_RESERVATIONS: process.env.NEXT_PUBLIC_SHOW_RESERVATIONS === "1",
  SHOW_CATEGORIES: process.env.NEXT_PUBLIC_SHOW_CATEGORIES === "1",
  SHOW_PICKUP_DISCOUNT: process.env.NEXT_PUBLIC_SHOW_PICKUP_DISCOUNT === "1",
  SHOW_PRODUCTS: process.env.NEXT_PUBLIC_SHOW_PRODUCTS === "1",
  SHOW_VARIANTS: process.env.NEXT_PUBLIC_SHOW_VARIANTS === "1",
  SHOW_COUPON: process.env.NEXT_PUBLIC_SHOW_COUPON === "1",
  SHOW_DELIVERY: process.env.NEXT_PUBLIC_SHOW_DELIVERY === "1",
  SHOW_LOCATIONS: process.env.NEXT_PUBLIC_SHOW_LOCATIONS === "1",
  SHOW_USERS: process.env.NEXT_PUBLIC_SHOW_USERS === "1",

  // 👇 FIXED — give it its own flag
  SHOW_TIMMING: process.env.NEXT_PUBLIC_SHOW_TIMMING === "1",

  SHOW_SETTING: process.env.NEXT_PUBLIC_SHOW_SETTING === "1",
  SHOW_DATA_BACKUP: process.env.NEXT_PUBLIC_SHOW_DATA_BACKUP === "1",
};

console.log("process.env.NEXT_PUBLIC_SHOW_DATA_BACKUP", process.env.NEXT_PUBLIC_SHOW_TIMMING)

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
        dayschedule: "Opening Timing",   // 👈 UPDATED LABEL
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

    {
      key: "SHOW_RESERVATIONS",
      name: BRANDING.sidebar.reservations,
      link: "/admin/reservations",
      icon: <BsCardList />,
    },

    { key: "SHOW_SALE", name: BRANDING.sidebar.sale, link: "/admin/sale", icon: <FaClipboardList /> },

    {
      key: "SHOW_PICKUP_DISCOUNT",
      name: BRANDING.sidebar.pickup_discount,
      link: "/admin/pickupdiscount/pickup-discount",
      icon: <MdLocalOffer />,
    },

    {
      key: "SHOW_VARIANTS",
      name: BRANDING.sidebar.variants,
      link: "/admin/flavorsProductG",
      icon: <MdRestaurantMenu />,
    },

    { key: "SHOW_COUPON", name: BRANDING.sidebar.coupon, link: "/admin/coupon", icon: <MdLocalOffer /> },

    { key: "SHOW_DELIVERY", name: BRANDING.sidebar.delivery, link: "/admin/delivery", icon: <TbTruckDelivery /> },

    { key: "SHOW_LOCATIONS", name: "Locations", link: "/admin/locations", icon: <TbTruckDelivery /> }, // 👈 NEW LINK

    { key: "SHOW_USERS", name: BRANDING.sidebar.users, link: "/admin/users", icon: <FaUsers /> },

    { key: "SHOW_TIMMING", name: "Opening Timing", link: "/admin/day-schedule/form",   icon: <MdAccessTime />  },

    { key: "SHOW_SETTING", name: BRANDING.sidebar.setting, link: "/admin/setting", icon: <MdSettings /> },

    { key: "SHOW_DATA_BACKUP", name: BRANDING.sidebar.data_backup, link: "/admin/data-backup", icon: <MdOutlineBackup /> },
  ];

  const filteredMenu = menuList.filter((item) => sidebarFlags[item.key]);

  return (
    <>
      {/* Mobile close button */}
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

      {/* Sidebar container */}
      <div className="pt-6 h-screen w-[260px] flex flex-col justify-between px-3 py-6 sb-bg shadow-md">
        {/* Navigation */}
        <ul className="flex flex-col gap-1">
          {filteredMenu.map((item) => (
            <Tab key={item.link} item={item} />
          ))}
        </ul>

        {/* Logout */}
        <div className="mt-6 pt-4">
          <button
            className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium rounded-md bg-amber-600 text-white hover:bg-rose-700 transition"
          >
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
