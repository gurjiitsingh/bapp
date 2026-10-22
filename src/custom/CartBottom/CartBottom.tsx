"use client";

import { IoCartOutline } from "react-icons/io5";
import CartCount from "./CartCount";
import { UseSiteContext } from "@/SiteContext/SiteContext";

const CartBottom = () => {
  const { sideBarToggle } = UseSiteContext();

  return (
    <button
      type="button"
      onClick={() => sideBarToggle(true)}
      aria-label="Open shopping cart"
      className="
        cart-bg group flex items-center gap-2
        rounded-full p-3 text-white
        shadow-lg transition-all duration-300
        hover:scale-105 hover:bg-red-400 hover:shadow-xl
        active:scale-95
      "
    >
      <IoCartOutline
        size={28}
        className="transition-transform duration-300 group-hover:rotate-[-8deg]"
      />

      <CartCount />
    </button>
  );
};

export default CartBottom;