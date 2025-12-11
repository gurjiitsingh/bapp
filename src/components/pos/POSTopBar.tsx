"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function POSTopBar() {
  const pathname = usePathname();

  const navItems = [
    { name: "POS", path: "/pos" },
    { name: "Orders", path: "/pos/orders" },
    // { name: "Dashboard", path: "/pos/dashboard" },
    // { name: "Settings", path: "/pos/settings" },
  ];

  return (
    <div className="w-full bg-slate-50  px-6 py-3 flex justify-between items-center">
      <div className="text-xl font-bold text-green-600">

         <img
                src="/logo-10.png"
                alt="Logo"
                className="w-20 h-20 md:w-24 md:h-24 object-contain"
              />


      </div>

      <div className="flex items-center gap-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`text-[1.1rem] font-medium ${
              pathname === item.path
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-600 hover:text-black"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>

      <div className="text-gray-500 text-sm">
        Cashier: <span className="font-semibold">POS User</span>
      </div>
    </div>
  );
}
