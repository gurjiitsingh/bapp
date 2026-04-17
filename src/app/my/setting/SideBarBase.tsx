"use client";

import { UseSiteContext } from "@/SiteContext/SiteContext";
import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { IoClose } from "react-icons/io5";
import { MdAdd, MdList, MdEdit } from "react-icons/md";

export default function SideBarBase() {
  const { adminSideBarToggle, setAdminSideBarToggleG } = UseSiteContext();

  const sidebarRef = useRef(null);
  const path = usePathname();

  useEffect(() => {
    setAdminSideBarToggleG(false);
  }, [path]);

  // ✅ Simple menu
  const menu = [

     {
      name: "All Clients",
      link: "/my/setting/",
      icon: <MdList />,
    },
    {
      name: "Add Client",
      link: "/my/setting/add",
      icon: <MdAdd />,
    },
   
    // {
    //   name: "Edit Client",
    //   link: "/my/setting/edit", // later dynamic
    //   icon: <MdEdit />,
    // },
  ];

 const SidebarContent = () => (
  <div className="pt-6 h-screen w-[260px] flex flex-col px-3 py-6 bg-gray-900 text-white shadow-md">
    
    {/* Mobile Close */}
    <div className="flex justify-end lg:hidden mb-4">
      <button
        onClick={() => setAdminSideBarToggleG(false)}
        className="p-2 rounded-full hover:bg-gray-700"
      >
        <IoClose size={22} className="text-white" />
      </button>
    </div>

    <ul className="flex flex-col gap-2">
      {menu.map((item) => {
  const isActive =
    item.link === "/my/setting/"
      ? path === "/my/setting" || path === "/my/setting/"
      : path.startsWith(item.link);

  return (
    <Link
      key={item.link}
      href={item.link}
      className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition
        ${
          isActive
            ? "bg-blue-600 text-white"
            : "text-gray-300 hover:bg-gray-800 hover:text-white"
        }`}
    >
      <span className="text-lg">{item.icon}</span>
      {item.name}
    </Link>
  );
})}
    </ul>
  </div>
);

  return (
    <div>
      {/* Desktop */}
      <div className="hidden lg:block">
        <SidebarContent />
      </div>

      {/* Mobile */}
      <div
        ref={sidebarRef}
        className={`fixed lg:hidden z-30
          ${adminSideBarToggle ? "translate-x-0" : "-translate-x-[290px]"}
          transition-transform`}
      >
        <SidebarContent />
      </div>
    </div>
  );
}