"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { decreaseProductStockFromOrder, updateOrderMaster } from "@/app/(universal)/action/orders/dbOperations";
import CartContext from "@/store/CartContext";
import { useContext } from "react";

const MAINTAIN_STOCK = process.env.NEXT_PUBLIC_MAINTAIN_STOCK === "true";

export default function POSOrderComplete() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderMasterId");
  const router = useRouter();
  const { emptyCart } = useContext(CartContext);

  useEffect(() => {
    async function finalize() {
      if (!orderId) return;

      // Mark order as Completed
      await updateOrderMaster(orderId, "COMPLETED");

      // Maintain stock if enabled
      if (MAINTAIN_STOCK) {
        await decreaseProductStockFromOrder(orderId);
      }

      // Empty cart immediately
      emptyCart();

      // Short delay then go back to POS home
      setTimeout(() => {
        router.push("/pos");
      }, 1200);
    }

    finalize();
  }, [orderId]);

  return (
    <div className="flex flex-col justify-center items-center w-full h-[70vh]">
      <div className="bg-white shadow-lg px-10 py-8 rounded-xl text-center">
        <h2 className="text-2xl font-semibold text-green-600">
          Order Completed ✔
        </h2>
        <p className="text-gray-500 mt-3">Saving order and updating stock...</p>
        <p className="text-gray-400 text-sm mt-2">Redirecting to POS...</p>
      </div>
    </div>
  );
}
