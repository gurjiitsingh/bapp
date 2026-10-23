
"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserRound,
  ChevronDown,
  UserCircle,
  LogOut,
  LoaderCircle,
  LogIn,
} from "lucide-react";
import { UseSiteContext } from "@/SiteContext/SiteContext";

export default function UserAccountMenu() {
  const { data: session, status } = useSession();
  const { emailFormToggle } = UseSiteContext();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = status === "authenticated";

  const customerName =
    session?.user?.name ||
    session?.user?.email?.split("@")[0] ||
    "My Account";

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent | TouchEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setIsOpen(false);

    try {
      await signOut({ redirect: false });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  }

  function handleLogin() {
    setIsOpen(false);
    emailFormToggle(true);
  }

  if (status === "loading") {
    return (
      <div className="flex h-8 w-8 items-center justify-center">
        <LoaderCircle
          size={14}
          className="animate-spin text-gray-400"
        />
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      {isLoggedIn ? (
        <>
          {/* Compact translucent account button */}
          <button
            type="button"
            onClick={() => setIsOpen((previous) => !previous)}
            aria-expanded={isOpen}
            aria-haspopup="menu"
            aria-label={`Account menu for ${customerName}`}
            className="
              group flex h-8 items-center gap-1.5
              rounded-full border border-gray-200/70
              bg-white/65 p-1 pr-2
              shadow-sm backdrop-blur-md
              transition-all duration-200
              hover:border-orange-300/80
              hover:bg-orange-50/75
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-orange-400
              sm:gap-1.5 sm:pr-2.5
            "
          >
            <span
              className="
                flex h-5 w-5 shrink-0 items-center
                justify-center rounded-full
                bg-orange-100/80 text-orange-700
                transition-colors
                group-hover:bg-orange-200/90
                sm:h-5 sm:w-5
              "
            >
              <UserRound size={11} strokeWidth={2} />
            </span>

            <span className="hidden max-w-28 truncate text-[11px] font-semibold text-gray-800 sm:block">
              {customerName}
            </span>

            <ChevronDown
              size={11}
              className={`shrink-0 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {/* Dropdown menu */}
          {isOpen && (
            <div
              role="menu"
              className="
                absolute right-0 top-full z-[100]
                mt-2 w-56 overflow-hidden
                rounded-xl border border-gray-200/80
                bg-white/95 p-1.5
                shadow-xl shadow-gray-900/10
                backdrop-blur-xl
                animate-in fade-in slide-in-from-top-1
                duration-150
                sm:w-60
              "
            >
              {/* Account details */}
              <div className="border-b border-gray-100 px-2.5 py-2">
                <p className="truncate text-xs font-semibold text-gray-900">
                  {customerName}
                </p>

                {session?.user?.email && (
                  <p className="mt-0.5 truncate text-[10px] text-gray-500">
                    {session.user.email}
                  </p>
                )}
              </div>

              {/* Profile */}
              <Link
                href="/user"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="
                  mt-1 flex items-center gap-2
                  rounded-lg px-2.5 py-2
                  text-[11px] font-medium text-gray-700
                  transition-colors
                  hover:bg-orange-50 hover:text-orange-700
                "
              >
                <UserCircle
                  size={14}
                  strokeWidth={1.8}
                  className="text-gray-500"
                />
                Customer Profile
              </Link>

              {/* Orders */}
              <Link
                href="/user/orders"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="
                  flex items-center gap-2
                  rounded-lg px-2.5 py-2
                  text-[11px] font-medium text-gray-700
                  transition-colors
                  hover:bg-orange-50 hover:text-orange-700
                "
              >
                <span className="flex h-3.5 w-3.5 items-center justify-center text-[12px]">
                  <span className="font-semibold">#</span>
                </span>
                My Orders
              </Link>

              <div className="my-1 border-t border-gray-100" />

              {/* Logout */}
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                disabled={loggingOut}
                className="
                  flex w-full items-center gap-2
                  rounded-lg px-2.5 py-2
                  text-left text-[11px] font-medium
                  text-red-600 transition-colors
                  hover:bg-red-50
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loggingOut ? (
                  <LoaderCircle
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  <LogOut size={14} strokeWidth={1.8} />
                )}

                {loggingOut ? "Signing out..." : "Logout"}
              </button>
            </div>
          )}
        </>
      ) : (
        /* Compact translucent login button */
        <button
          type="button"
          onClick={handleLogin}
          aria-label="Login or register"

          className="
  inline-flex h-8 items-center justify-center
  gap-1.5 rounded-full
  border border-orange-300/50
  bg-orange-500/15 px-2.5
  text-[11px] font-semibold text-orange-700
  shadow-sm backdrop-blur-md
  transition-all duration-200
  hover:border-orange-400/70
  hover:bg-orange-500/25
  active:scale-[0.98]
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-orange-400
  focus-visible:ring-offset-2
  sm:gap-1.5 sm:px-3
"

        >
          <LogIn size={13} strokeWidth={1.8} />
          <span>Login / Register</span>
        </button>
      )}
    </div>
  );
}
