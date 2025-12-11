"use client";

import { useState } from "react";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { useLanguage } from "@/store/LanguageContext";

const PaymentSelector = () => {
  const { TEXT } = useLanguage();
  const { setPaymentType } = UseSiteContext();
  const [selected, setSelected] = useState<string>("");

  // Read available payment methods from env
  const showStripe = process.env.NEXT_PUBLIC_PAYMENT_STRIPE === "true";
  const showPayPal = process.env.NEXT_PUBLIC_PAYMENT_PAYPAL === "true";
  const showCOD = process.env.NEXT_PUBLIC_PAYMENT_COD === "true";


  const handleSelect = (value: string) => {
    setSelected(value);
    setPaymentType(value);
  };

  return (
    <div className="flex flex-col p-5 rounded-2xl border border-slate-300 bg-white">
      <h3 className="text-xl font-semibold text-slate-600 pt-3 pb-4 uppercase">
        {TEXT.payment_method_title || "Select Payment Method"}
      </h3>

      <div className="flex flex-col gap-4">
        {/* Stripe */}
        {showStripe && (
          <div
            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition
            ${selected === "stripe" ? "border-amber-400 bg-amber-50" : "border-slate-300 hover:border-amber-300"}`}
            onClick={() => handleSelect("stripe")}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${selected === "stripe" ? "border-amber-400" : "border-gray-400"}`}
            >
              {selected === "stripe" && (
                <div className="w-2.5 h-2.5 bg-amber-400 rounded-full"></div>
              )}
            </div>
            <span className="text-blue-900 font-semibold">Stripe</span>
          </div>
        )}

        {/* PayPal */}
        {showPayPal && (
          <div
            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition
            ${selected === "paypal" ? "border-amber-400 bg-amber-50" : "border-slate-300 hover:border-amber-300"}`}
            onClick={() => handleSelect("paypal")}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${selected === "paypal" ? "border-amber-400" : "border-gray-400"}`}
            >
              {selected === "paypal" && (
                <div className="w-2.5 h-2.5 bg-amber-400 rounded-full"></div>
              )}
            </div>
            <span>
              <span className="text-blue-900 font-semibold">Pay</span>
              <span className="text-sky-500 font-semibold">Pal</span>
            </span>
          </div>
        )}

        {/* Cash on Delivery */}
        {showCOD && (
          <div
            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition
            ${selected === "cod" ? "border-amber-400 bg-amber-50" : "border-slate-300 hover:border-amber-300"}`}
            onClick={() => handleSelect("cod")}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${selected === "cod" ? "border-amber-400" : "border-gray-400"}`}
            >
              {selected === "cod" && (
                <div className="w-2.5 h-2.5 bg-amber-400 rounded-full"></div>
              )}
            </div>
            <span className="text-slate-700 font-semibold">
              {TEXT.payment_method_cod || "Cash on Delivery"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSelector;
