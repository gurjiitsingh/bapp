import { UseSiteContext } from "@/SiteContext/SiteContext";
import Sidebar from "@/app/(universal)/admin/components/Sidebar";
import React, { useEffect, useRef } from "react";
//import { IoClose } from "react-icons/io5";
import { usePathname } from "next/navigation";

export default function SideBarBase() {
  const { adminSideBarToggle,setAdminSideBarToggleG } = UseSiteContext();
  
  const sidebarRef = useRef(null);
  const path = usePathname();
 

  useEffect(() => {
      setAdminSideBarToggleG(false);
  }, [path]);

  return (
    <div className="">

      <div className="hidden  lg:block">
        <Sidebar />
      </div>

      <div
        ref={sidebarRef}
        className={`fixed  lg:hidden z-30 bg-white
               ${adminSideBarToggle ? "translate-x-0 " : "-translate-x-[290px]"}
               `}
      >
        <Sidebar />
      </div>
    </div>
  );
}
