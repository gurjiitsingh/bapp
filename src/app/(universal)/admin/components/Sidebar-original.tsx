"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { GoHome } from "react-icons/go";
import { MdSpaceDashboard, MdOutlineProductionQuantityLimits } from "react-icons/md";
import { FaUserTie } from "react-icons/fa";
import { BsBorderStyle } from "react-icons/bs";
import { TbCategoryPlus } from "react-icons/tb";
import { IoIosLogOut, IoMdSettings } from "react-icons/io";
import { IoClose } from "react-icons/io5";

import { UseSiteContext } from "@/SiteContext/SiteContext";
import { usePathname } from "next/navigation";
import { JSX, useEffect, useState } from "react";

type Titem = {
  name: string;
  link: string;
  icon: JSX.Element;
};

const menuList: Titem[] = [
  { name: "Home", link: "/", icon: <GoHome /> },
  { name: "Orders", link: "/admin", icon: <MdSpaceDashboard /> },
   { name: "Reservations", link: "/admin/reservations", icon: <MdSpaceDashboard /> },
  { name: "Categories", link: "/admin/categories", icon: <TbCategoryPlus /> },
  { name: "Pickup Discount", link: "/admin/pickupdiscount/pickup-discount", icon: <TbCategoryPlus /> },
  { name: "Products", link: "/admin/productsbase", icon: <MdOutlineProductionQuantityLimits /> },
  { name: "Variants", link: "/admin/flavorsProductG", icon: <BsBorderStyle /> },
  { name: "Coupon", link: "/admin/coupon", icon: <TbCategoryPlus /> },
  { name: "Delivery", link: "/admin/delivery", icon: <TbCategoryPlus /> },
  { name: "Users", link: "/admin/users", icon: <FaUserTie /> },
  { name: "Setting", link: "/admin/setting", icon: <IoMdSettings /> },
];

const Sidebar = () => {
  const { setAdminSideBarToggleG } = UseSiteContext();

  return (
    <>
      {/* Close button for mobile */}
      <div className="flex items-center pt-4 px-4 justify-between lg:hidden">
        <div></div>
        <button
          onClick={() => setAdminSideBarToggleG(false)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition"
          aria-label="close sidebar"
        >
          <IoClose size={24} />
        </button>
      </div>

      {/* Sidebar container */}
      <div className="pt-8 h-screen w-[280px] flex flex-col justify-between px-4 py-6  bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 shadow-md">
        {/* Navigation */}
        <ul className="flex flex-col gap-2">
          {menuList.map((item) => (
            <Tab key={item.name} item={item} />
          ))}
        </ul>

        {/* Logout */}
        <div className="mt-6  pt-4">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 transition"
          >
            <IoIosLogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

function Tab({ item }: { item: Titem }) {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const isSelected = pathname === item.link;

  return (
    <Link href={item.link}>
      <li
        className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition 
        ${isSelected
          ? "bg-amber-500 text-white shadow-sm"
          : "hover:bg-amber-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200"}`}
      >
        <span className="text-lg">{item.icon}</span>
        <span>{item.name}</span>
      </li>
    </Link>
  );
}

export default Sidebar;
