"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { updateOrderMaster } from "@/app/(universal)/action/orders/dbOperations";
import { useLanguage } from "@/store/LanguageContext";

export default function OrderFail() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderMasterId");
  const router = useRouter();
  const { TEXT } = useLanguage();

  const id = orderId as string;

  async function updateOrderStatus(status: string) {
    await updateOrderMaster(id, status);
  }

  useEffect(() => {
    updateOrderStatus("Payment failed");
  }, []);

  return (
    <div className="container bg-slate-100 mp flex rounded-2xl my-9 flex-col w-[90%] lg:w-[50%] mx-auto">
      <div className="flex flex-col gap-6 items-center">
        <div className="text-2xl font-semibold text-center">
          {TEXT.orderFail?.title || "Payment failed."}
        </div>

        <div className="text-md text-center text-slate-500">
          {TEXT.orderFail?.message ||
            "Use another payment method or select cash on delivery"}
        </div>

        <div>
          <button
            onClick={() => {
              router.push("/");
            }}
            className="min-w-[200px] mt-5 py-1 text-center primary rounded-2xl text-slate-500 text-[1rem]"
          >
            {TEXT.orderFail?.retry || "Try again"}
          </button>
        </div>
      </div>
    </div>
  );
}
