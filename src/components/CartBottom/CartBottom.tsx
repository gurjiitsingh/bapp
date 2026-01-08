'use client'

import { IoCartOutline } from "react-icons/io5";
import CartCount from './CartCount';
import { UseSiteContext } from '@/SiteContext/SiteContext';

const CartBottom = () => {
  const { sideBarToggle } = UseSiteContext();

  return (
    <button 
      onClick={() => sideBarToggle(false)} 
      className="cart-bg hover:bg-red-400 text-white rounded-full shadow-lg transition duration-300 p-3 cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <IoCartOutline size={28} />
        <CartCount /> 
      </div>
    </button>
  );
};

export default CartBottom;
