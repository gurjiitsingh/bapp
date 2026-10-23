
"use client";

import { useState } from "react";
import {
  CreditCard,
  Banknote,
  WalletCards,
  CheckCircle2,
  Circle,
  ShieldCheck,
} from "lucide-react";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { useLanguage } from "@/store/LanguageContext";

const PaymentSelector = () => {
  const { TEXT } = useLanguage();
  const { setPaymentType } = UseSiteContext();

  const [selected, setSelected] = useState<string>("");

  // =====================================================
  // Payment methods from environment
  // =====================================================

  const showStripe =
    process.env.NEXT_PUBLIC_PAYMENT_STRIPE === "true";

  const showPayPal =
    process.env.NEXT_PUBLIC_PAYMENT_PAYPAL === "true";

  const showCOD =
    process.env.NEXT_PUBLIC_PAYMENT_COD === "true";

  const handleSelect = (value: string) => {
    setSelected(value);
    setPaymentType(value);
  };

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-5">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
          <CreditCard size={20} strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold tracking-tight text-slate-900">
            {TEXT.payment_method_title || "Select Payment Method"}
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Choose how you would like to pay for your order.
          </p>
        </div>

        <ShieldCheck
          size={20}
          strokeWidth={1.7}
          className="shrink-0 text-slate-400"
        />
      </div>

      {/* Payment Options */}
      <div className="flex flex-col gap-3">
        {showStripe && (
          <PaymentOption
            value="stripe"
            selected={selected}
            onSelect={handleSelect}
            icon={<CreditCard size={19} strokeWidth={1.8} />}
            title="Stripe"
            description="Secure card payment"
          />
        )}

        {showPayPal && (
          <PaymentOption
            value="paypal"
            selected={selected}
            onSelect={handleSelect}
            icon={<WalletCards size={19} strokeWidth={1.8} />}
            title="PayPal"
            description="Pay securely with PayPal"
          />
        )}

        {showCOD && (
          <PaymentOption
            value="cod"
            selected={selected}
            onSelect={handleSelect}
            icon={<Banknote size={19} strokeWidth={1.8} />}
            title={TEXT.payment_method_cod || "Cash on Delivery"}
            description="Pay when your order arrives"
          />
        )}
      </div>
    </section>
  );
};

function PaymentOption({
  value,
  selected,
  onSelect,
  icon,
  title,
  description,
}: {
  value: string;
  selected: string;
  onSelect: (value: string) => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  const isSelected = selected === value;

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={isSelected}
      className={`
        group flex w-full items-center gap-3 rounded-xl border p-3
        text-left transition-all duration-200 sm:gap-4 sm:p-4
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-orange-400 focus-visible:ring-offset-2
        ${
          isSelected
            ? "border-orange-400 bg-orange-50 shadow-sm shadow-orange-100/60"
            : "border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/30"
        }
      `}
    >
      {/* Icon */}
      <div
        className={`
          flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
          transition-colors duration-200 sm:h-11 sm:w-11
          ${
            isSelected
              ? "bg-orange-100 text-orange-600"
              : "bg-slate-100 text-slate-600 group-hover:bg-orange-100 group-hover:text-orange-600"
          }
        `}
      >
        {icon}
      </div>

      {/* Payment Details */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-xs leading-4 text-slate-500">
          {description}
        </p>
      </div>

      {/* Selection Indicator */}
      <div className="flex shrink-0 items-center justify-center">
        {isSelected ? (
          <CheckCircle2
            size={21}
            strokeWidth={2}
            className="text-orange-600"
          />
        ) : (
          <Circle
            size={21}
            strokeWidth={1.7}
            className="text-slate-300 transition-colors group-hover:text-orange-400"
          />
        )}
      </div>
    </button>
  );
}

export default PaymentSelector;
