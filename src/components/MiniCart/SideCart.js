"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useClickAway } from "react-use";
import { IoClose } from "react-icons/io5";
import { useSession } from "next-auth/react";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import MiniCartContent from "./MiniCartcontent";
import { MiniCartSubtotal } from "./MiniSubtotal";
import ProccedWithEmail from "./components/ProccedWithEmail";
import { useCartContext } from "@/store/CartContext";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/store/LanguageContext";
import CartToMargin from "../../../custom/margin/cartToMargin";

const framerSidebarBackground = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, transition: { delay: 0.2 } },
  transition: { duration: 0.3 },
};

const framerSidebarPanel = {
  initial: { x: "-100%" },
  animate: { x: 0 },
  exit: { x: "-100%" },
  transition: { duration: 0.3 },
};

export const SideCart = () => {
  const { TEXT } = useLanguage();

  const {
    open,
    sideBarToggle,
    openEmailForm,
    emailFormToggle,
  } = UseSiteContext();

  const { cartData } = useCartContext();
  const { status } = useSession();

  const ref = useRef < HTMLDivElement | null > (null);
  const router = useRouter();

  useClickAway(ref, () => sideBarToggle());

  // An authenticated customer should never see the login/register popup.
  useEffect(() => {
    if (status === "authenticated" && openEmailForm) {
      emailFormToggle(false);
    }
  }, [status, openEmailForm, emailFormToggle]);

  function pickUpHandle() {
    // Wait until Auth.js has finished checking the session.
    if (status === "loading") return;

    sideBarToggle();

    if (status === "authenticated") {
      emailFormToggle(false);
      router.push("/checkout");
      return;
    }

    // Only unauthenticated customers need to log in or register.
    emailFormToggle(true);
  }

  function shopMoreHandle() {
    sideBarToggle();
    router.push("/");
  }

  return (
    <div translate="no" className="z-50">
      {
        !openEmailForm && (
          <AnimatePresence mode="wait" initial={false}>
            {open && (
              <>
                {/* Background blur */}
                <motion.div
                  {...framerSidebarBackground}
                  aria-hidden="true"
                  className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                />

                {/* Sidebar panel */}
                <motion.div
                  {...framerSidebarPanel}
                  ref={ref}
                  className="fixed inset-y-0 left-0 z-50 flex w-full max-w-md flex-col border-r border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-2xl"
                  aria-label="Sidebar"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
                    <span className="text-lg font-semibold text-gray-800">
                      {TEXT.cart_sidebar_title}
                    </span>

                    <button
                      type="button"
                      onClick={sideBarToggle}
                      className="rounded-lg p-2 transition-colors hover:bg-gray-200"
                      aria-label="Close sidebar"
                    >
                      <IoClose size={26} />
                    </button>
                  </div>

                  {/* Cart content */}
                  <div className="flex-1 overflow-y-auto p-3">
                    <CartToMargin />
                    <MiniCartContent />
                  </div>

                  {/* Subtotal and actions */}
                  <div
                    className="border-t border-gray-100 bg-white px-4 pt-4"
                    style={{
                      paddingBottom:
                        "calc(1rem + env(safe-area-inset-bottom))",
                    }}
                  >
                    <MiniCartSubtotal />

                    <div className="mt-4 flex flex-col items-center justify-center gap-3">
                      {cartData.length > 0 ? (
                        <button
                          type="button"
                          onClick={pickUpHandle}
                          disabled={status === "loading"}
                          className="w-full rounded-xl bg-slate-800 py-2 font-semibold text-white shadow-sm transition-all hover:bg-slate-700 hover:shadow-md disabled:cursor-wait disabled:opacity-60"
                        >
                          {status === "loading"
                            ? "Please wait..."
                            : TEXT.checkout_button}
                        </button>
                      ) : (
                        <div className="text-center font-medium text-gray-500">
                          {TEXT.empty_cart_message}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={shopMoreHandle}
                        className="w-full rounded-xl bg-gray-200 py-2 font-semibold text-gray-800 transition-all hover:bg-gray-300"
                      >
                        {TEXT.shop_more_button}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        )
      }

      {/* Show login/register only to unauthenticated customers */}
      {status === "unauthenticated" && openEmailForm && (
        <ProccedWithEmail />
      )}
    </div>
  );
};
