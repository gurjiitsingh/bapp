"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, JSX } from "react";
import { useLanguage } from "@/store/LanguageContext";
import { signOut } from "next-auth/react";
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
  MdOutlineInventory2,
  MdOutlineReceiptLong,
  MdOutlineRestaurant,
  MdStorefront,
} from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { BsCardList } from "react-icons/bs";
import { TbTruckDelivery } from "react-icons/tb";
import { IoIosLogOut } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { FaClipboardList } from "react-icons/fa6";
import { MdTableBar } from "react-icons/md";
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
  | "SHOW_INVENTORY_RAW"
  | "SHOW_DISTRIBUTION"
  | "SHOW_INVENTORY_FINISHED"
  | "SHOW_VARIANTS"
  | "SHOW_COUPON"
  | "SHOW_DELIVERY"
  | "SHOW_LOCATIONS"
  | "SHOW_USERS"
  | "SHOW_TIMMING"
  | "SHOW_SETTING"
  | "SHOW_DATA_BACKUP"
  | "SHOW_OUTLET"
  | "SHOW_TABLES"
  | "SHOW_MODIFIER"
  | "SHOW_MODIFIER_GROUPS"
  | "SHOW_INVENTORY"
  | "SHOW_INVENTORY_TRANSACTIONS"
  | "SHOW_PRODUCT_RECIPES"
  | "SHOW_MAINTENANCE"
   | "SHOW_PAYROLL"
  |  "SHOW_STORE_POS"; 

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
  SHOW_INVENTORY_RAW: flag(process.env.NEXT_PUBLIC_SHOW_RAW_INVENTORY),
   SHOW_DISTRIBUTION: flag(process.env.NEXT_PUBLIC_SHOW_DISTRIBUTION),
  SHOW_INVENTORY_FINISHED: flag(process.env.NEXT_PUBLIC_SHOW_FINISHED_INVENTORY), 
  SHOW_PAYROLL: flag(process.env.NEXT_PUBLIC_SHOW_PAYROLL),
  SHOW_VARIANTS: flag(process.env.NEXT_PUBLIC_SHOW_VARIANTS),
  SHOW_COUPON: flag(process.env.NEXT_PUBLIC_SHOW_COUPON),
  SHOW_DELIVERY: flag(process.env.NEXT_PUBLIC_SHOW_DELIVERY),
  SHOW_LOCATIONS: flag(process.env.NEXT_PUBLIC_SHOW_LOCATIONS),
  SHOW_USERS: flag(process.env.NEXT_PUBLIC_SHOW_USERS),
  SHOW_TIMMING: flag(process.env.NEXT_PUBLIC_SHOW_TIMMING),
  SHOW_SETTING: flag(process.env.NEXT_PUBLIC_SHOW_SETTING),
  SHOW_DATA_BACKUP: flag(process.env.NEXT_PUBLIC_SHOW_DATA_BACKUP),

  SHOW_OUTLET: flag(process.env.NEXT_PUBLIC_SHOW_OUTLET),   
  SHOW_TABLES: flag(process.env.NEXT_PUBLIC_SHOW_TABLES),
    SHOW_MODIFIER: flag(process.env.NEXT_PUBLIC_SHOW_MODIFIER),             
  SHOW_MODIFIER_GROUPS: flag(process.env.NEXT_PUBLIC_SHOW_MODIFIER_GROUPS),
  SHOW_INVENTORY: flag(process.env.NEXT_PUBLIC_SHOW_INVENTORY),

    SHOW_STORE_POS: flag(process.env.NEXT_PUBLIC_SHOW_STORE_POS),

SHOW_INVENTORY_TRANSACTIONS: flag(
  process.env.NEXT_PUBLIC_SHOW_INVENTORY_TRANSACTIONS
),

SHOW_PRODUCT_RECIPES: flag(
  process.env.NEXT_PUBLIC_SHOW_PRODUCT_RECIPES
),
  SHOW_MAINTENANCE: flag(
    process.env.NEXT_PUBLIC_SHOW_MAINTENANCE
  ),
};



const Sidebar = () => { 
  const { BRANDING } = useLanguage() || {
    BRANDING: {
      sidebar: {
        home: "Home",
        orders: "Orders",
      //  orders_realtime: "Orders Realtime",
        sale: "Sale",
        reservations: "Reservations",
        categories: "Categories",
        pickup_discount: "Pickup Discount",
        products: "Products",
        variants: "Variants",


        
        coupon: "Coupon",
        delivery: "Delivery",
        users: "Userss",
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
    { key: "SHOW_ORDERS", name: BRANDING.sidebar.orders, link: "/admin/orders", icon: <MdDashboard /> },
    // {
    //   key: "SHOW_ORDERS_REALTIME",
    //   name: BRANDING.sidebar.orders_realtime,
    //   link: "/admin/order-realtime",
    //   icon: <MdOutlineCrisisAlert />,
    // },
    { key: "SHOW_CATEGORIES", name: BRANDING.sidebar.categories, link: "/admin/categories", icon: <MdCategory /> },
    // { key: "SHOW_PRODUCTS", name: BRANDING.sidebar.products, link: "/admin/products", icon: <MdInventory /> },

   {
  key: "SHOW_STORE_POS",
  name: "Store & POS",
  link: "/admin/store-pos/products",
  icon: <MdStorefront />,
},
{
  key: "SHOW_INVENTORY_RAW",
  name: "Products Stock",
  link: "/admin/stock-finished/sale/add",
  icon: <MdInventory />,
},
    {
  key: "SHOW_INVENTORY_RAW",
  name: "Raw Stock",
  link: "/admin/inventory",
  icon: <MdOutlineInventory2 />,
},
 {
  key: "SHOW_DISTRIBUTION",
  name: "Distribution",
  link: "/admin/distribution/load-operator",
  icon: <MdInventory />,
},
{
  key: "SHOW_PAYROLL",
  name: "Payroll",
  link: "/admin/payroll",
  icon: <FaUsers />,
},
{
  key: "SHOW_MAINTENANCE",
  name: "Maintenance",
  link: "/admin/maintenance/faults",
  icon: <MdOutlineCrisisAlert />,
},

      {
    key: "SHOW_MODIFIER_GROUPS",
    name: "Modifier Groups",
    link: "/admin/modifier-groups",
    icon: <MdRestaurantMenu />,
  },
  {
    key: "SHOW_MODIFIER",
    name: "Modifiers",
    link: "/admin/modifiers",
    icon: <MdRestaurantMenu />,
  },
    { key: "SHOW_RESERVATIONS", name: BRANDING.sidebar.reservations, link: "/admin/reservations", icon: <BsCardList /> },

    { key: "SHOW_SALE", name: BRANDING.sidebar.sale, link: "/admin/sale", icon: <FaClipboardList /> },

    {
      key: "SHOW_PICKUP_DISCOUNT",
      name: BRANDING.sidebar.pickup_discount,
      link: "/admin/pickupdiscount/pickup-discount",
      icon: <MdLocalOffer />,
    },

    { key: "SHOW_VARIANTS", name: BRANDING.sidebar.variants, link: "/admin/flavorsProductG", icon: <MdRestaurantMenu /> },


   


// {
//   key: "SHOW_INVENTORY_TRANSACTIONS",
//   name: "Stock Transactions",
//   link: "/admin/stock-finished/transactions",
//   icon: <MdOutlineReceiptLong />,
// },

// {
//   key: "SHOW_INVENTORY_TRANSACTIONS",
//   name: "Add Transaction",
//   link: "/admin/stock-finished/transactions/new",
//   icon: <MdOutlineReceiptLong />,
// },


// {
//   key: "SHOW_PRODUCT_RECIPES",
//   name: "Product Recipes",
//   link: "/admin/product-recipes/recipes",
//   icon: <MdOutlineRestaurant />,
// },

// {
//   key: "SHOW_PRODUCT_RECIPES",
//   name: "Product Formula",
//   link: "/admin/product-recipes/product-formula",
//   icon: <MdOutlineRestaurant />,
// },




// {
//   key: "SHOW_PRODUCT_RECIPES",
//   name: "Add Recipe",
//   link: "/admin/product-recipes/new",
//   icon: <MdRestaurantMenu />,
// },   
   
   
    { key: "SHOW_COUPON", name: BRANDING.sidebar.coupon, link: "/admin/coupon", icon: <MdLocalOffer /> },

    { key: "SHOW_DELIVERY", name: BRANDING.sidebar.delivery, link: "/admin/delivery", icon: <TbTruckDelivery /> },

    { key: "SHOW_LOCATIONS", name: "Locations", link: "/admin/locations", icon: <TbTruckDelivery /> },

    { key: "SHOW_USERS", name: "Users", link: "/admin/users", icon: <FaUsers /> },

    { key: "SHOW_TIMMING", name: "Opening Timing", link: "/admin/day-schedule/form", icon: <MdAccessTime /> },

    {
      key: "SHOW_OUTLET",
      name: "Outlet",
      link: "/admin/outlet",
      icon: <MdSettings />,
    },
    {
    key: "SHOW_TABLES",
    name: "Tables",
    link: "/admin/tables",
    icon: <MdTableBar />, // ⭐ or another icon
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
          className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
          aria-label="close sidebar"
        >
          <IoClose size={24} className="text-white" />
        </button>
      </div>

    
 
<div className="relative flex h-[100dvh] w-[260px] shrink-0 flex-col overflow-hidden border-r border-white/[0.08] bg-[#090e1b] text-slate-300">

  {/* Ambient background glow */}
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -left-28 top-20 h-64 w-64 rounded-full bg-blue-600/[0.12] blur-[90px]" />
    <div className="absolute -right-24 top-[42%] h-64 w-64 rounded-full bg-indigo-600/[0.10] blur-[100px]" />
  </div>

  {/* Brand header */}
  <div className="relative px-4 pb-5 pt-5">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/25 to-indigo-500/15 text-blue-300 shadow-lg shadow-blue-950/40">
        <MdStorefront size={25} />
      </div>

      <div className="min-w-0">
        <h2 className="text-sm font-bold tracking-wide text-white">
          ERP POS
        </h2>
        <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.17em] text-slate-500">
          Control Center
        </p>
      </div>
    </div>

    <div className="mt-5 h-px bg-gradient-to-r from-blue-400/30 via-white/[0.08] to-transparent" />
  </div>

  {/* Navigation menu */}
  <div className="relative flex min-h-0 flex-1 flex-col px-3">
    <div className="mb-3 flex items-center justify-between px-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
        Workspace
      </span>

      <span className="rounded-md border border-white/[0.07] bg-white/[0.03] px-1.5 py-0.5 text-[9px] text-slate-500">
        {filteredMenu.length}
      </span>
    </div>

    <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto pb-4 [scrollbar-width:thin] [scrollbar-color:#26344c_transparent]">
      {filteredMenu.map((item) => (
        <Tab key={item.link} item={item} />
      ))}
    </ul>
  </div>

  {/* Bottom section */}
  <div className="relative mt-2 px-3 pb-4 pt-3">
    <div className="mb-3 rounded-2xl border border-blue-400/[0.12] bg-gradient-to-br from-blue-500/[0.10] to-indigo-500/[0.04] p-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
          <MdSettings size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-200">
            System Control
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            Manage your operations
          </p>
        </div>

        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </div>
    </div>

    <button
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
      className="group flex w-full items-center gap-3 rounded-xl border hover:border-white/[0.07] hover:bg-white/[0.025] px-3 py-3 text-left transition-all duration-200 border-rose-400/20 bg-rose-500/[0.08]"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/[0.08] group-hover:text-rose-400 bg-rose-500/15">
        <IoIosLogOut size={22} />
      </span>

      <span className="flex-1">
        <span className="block text-xs font-semibold  text-rose-300 group-hover:text-slate-300">
          {BRANDING.sidebar.logout}
        </span>
        <span className="mt-1 block text-[10px] text-slate-600">
          Sign out of your account
        </span>
      </span>

      <span className="group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5 text-rose-400">
        →
      </span>
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
  // const baseClasses = isSelected ? "sb-tab-active" : "sb-tab";
  const baseClasses = isSelected ? "bg-blue-600" : "bg-slate-600";

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
