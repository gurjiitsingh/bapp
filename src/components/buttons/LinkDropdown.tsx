"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import the icon to avoid SSR mismatch
// let FaRegUser: any = null;
// if (typeof window !== "undefined") {
//   FaRegUser = require("react-icons/fa").FaRegUser;
// }

const FaRegUser = dynamic(() => import("react-icons/fa").then((mod) => mod.FaRegUser), {
  ssr: false,
});

const LinkDropdown = () => {
  const { data: session, status } = useSession();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted || status === "loading") return null;

  const role = session?.user?.role;

  return (<>
  {typeof window !== 'undefined' && <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center text-slate-400 hover:text-red-600 transition">
        {FaRegUser && <FaRegUser className="text-xl" />}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-[#64870d] text-white shadow-lg rounded-md min-w-[160px]">
        <DropdownMenuSeparator />

        {!session && (
          <>
            <DropdownMenuItem>
              <Link href="/auth/login" className="w-full block">
                Login
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/auth/register" className="w-full block">
                Register
              </Link>
            </DropdownMenuItem>
          </>
        )}

        {role === "admin" && (
          <DropdownMenuItem>
            <Link href="/admin/" className="w-full block">
              Admin Dashboard
            </Link>
          </DropdownMenuItem>
        )}

        {role === "user" && (
          <DropdownMenuItem>
            <Link href="/user/" className="w-full block">
              My Dashboard
            </Link>
          </DropdownMenuItem>
        )}

        {session && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <button
                onClick={() => signOut()}
                className="w-full text-left text-sm text-white hover:text-red-500"
              >
                Logout
              </button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>}
    </>
  );
};

export default LinkDropdown;
