// components/product/CartButtonWrapper.tsx

import CartButton from "@/components/AddToCart/CartButton";
import React from "react";
import toast from "react-hot-toast";

export default function CartButtonWrapper({
  isCartDisabled,
  cartProduct,
  toastMessage,
  icon,
}: {
  isCartDisabled: boolean;
  cartProduct: any;
  toastMessage: string;
  icon: React.ReactNode;
}) {
  if (!isCartDisabled) {
    return (
      <div className="cart-btn-wrapper">
        <CartButton cartProduct={cartProduct} />
      </div>
    );
  }

  return (
    <div className="relative group">
      <button
        onClick={() => {
          toast(toastMessage);
        }}
        className="disabled-cart-btn"
      >
        {icon}
      </button>
      <div className="disabled-cart-tooltip">
        {toastMessage}
      </div>
    </div>
  );
}
