"use client";

import { useEffect, useState } from "react";
import CartBottom from "@/components/CartBottom/CartBottom";

export default function CartBottomWrapper() {
  const [cartBottomEnabled, setCartBottomEnabled] = useState(false);

  useEffect(() => {
    // Check the environment variable and set the state accordingly
    if (process.env.NEXT_PUBLIC_CART_BOTTOM_ENABLED === "true") {
      setCartBottomEnabled(true);
    }
  }, []);

  if (!cartBottomEnabled) {
    return null; // Do not render CartBottom if the flag is false
  }

  return (
    <div className="fixed bottom-8 right-4 z-50 w-fit">
      <CartBottom />
    </div>
  );
}
