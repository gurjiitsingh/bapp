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
  | "SHOW_VARIANTS"
  | "SHOW_COUPON"
  | "SHOW_DELIVERY"
  | "SHOW_LOCATIONS"
  | "SHOW_USERS"
  | "SHOW_TIMMING"
  | "SHOW_SETTING"
  | "SHOW_DATA_BACKUP"
  | "SHOW_OUTLET"   // ⭐ NEW
   | "SHOW_TABLES" 
   | "SHOW_MODIFIER"     
  | "SHOW_MODIFIER_GROUPS"
  | "SHOW_INVENTORY"
| "SHOW_INVENTORY_TRANSACTIONS"
| "SHOW_PRODUCT_RECIPES"; 

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

  SHOW_OUTLET: flag(process.env.NEXT_PUBLIC_SHOW_OUTLET),   
  SHOW_TABLES: flag(process.env.NEXT_PUBLIC_SHOW_TABLES),
    SHOW_MODIFIER: flag(process.env.NEXT_PUBLIC_SHOW_MODIFIER),             
  SHOW_MODIFIER_GROUPS: flag(process.env.NEXT_PUBLIC_SHOW_MODIFIER_GROUPS),
  SHOW_INVENTORY: flag(process.env.NEXT_PUBLIC_SHOW_INVENTORY),

SHOW_INVENTORY_TRANSACTIONS: flag(
  process.env.NEXT_PUBLIC_SHOW_INVENTORY_TRANSACTIONS
),

SHOW_PRODUCT_RECIPES: flag(
  process.env.NEXT_PUBLIC_SHOW_PRODUCT_RECIPES
),
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

   
   
{
  key: "SHOW_INVENTORY",
  name: "Inventory",
  link: "/admin/stock-finished/dashboard",
  icon: <MdOutlineInventory2 />,
},

{
  key: "SHOW_INVENTORY",
  name: "Finished Stock",
  link: "/admin/stock-finished/sale/add",
  icon: <MdInventory />,
},

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


{
  key: "SHOW_PRODUCT_RECIPES",
  name: "Product Recipes",
  link: "/admin/product-recipes/recipes",
  icon: <MdOutlineRestaurant />,
},

{
  key: "SHOW_PRODUCT_RECIPES",
  name: "Product Formula",
  link: "/admin/product-recipes/product-formula",
  icon: <MdOutlineRestaurant />,
},




// {
//   key: "SHOW_PRODUCT_RECIPES",
//   name: "Add Recipe",
//   link: "/admin/product-recipes/new",
//   icon: <MdRestaurantMenu />,
// },   
   
   
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

        {/* <div className="mt-6 pt-4">
          <button className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium rounded-md bg-amber-600 text-white hover:bg-rose-700 transition">
            <IoIosLogOut size={20} />
            {BRANDING.sidebar.logout}
          </button>
        </div> */}

<button
  onClick={() => signOut({ callbackUrl: "/auth/login" })}
  className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium rounded-md bg-amber-600 text-white hover:bg-rose-700 transition"
>
  <IoIosLogOut size={20} />
  {BRANDING.sidebar.logout}
</button>

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
