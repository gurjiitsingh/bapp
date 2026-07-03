"use client";

import { LogOut, Truck } from "lucide-react";
import { signOut } from "next-auth/react";

type Props = {
  userName: string;
};

export default function DriverHeader({
  userName,
}: Props) {
  return (
    <header className=" 
    sticky top-0 z-30
backdrop-blur-xl
bg-white/80
border-b border-white/40
shadow-sm
px-4 py-3
    ">
      <div className="max-w-md mx-auto h-16 px-4 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Truck className="w-5 h-5 text-blue-700" />
          </div>

          <div>
            <h1 className="font-semibold text-gray-800">
              {userName}
            </h1>

            <p className="text-xs text-gray-500">
              Driver
            </p>
          </div>

        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-red-600"
        >
          <LogOut size={18} />
        </button>

      </div>
    </header>
  );
}