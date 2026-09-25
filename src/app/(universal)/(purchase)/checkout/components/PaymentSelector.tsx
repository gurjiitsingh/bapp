"use client";

import { useState } from "react";
import { CreditCard, Banknote, WalletCards } from "lucide-react";
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
    <div
      className="
        rounded-3xl
        border
        border-[#E9DDD3]
        bg-[#FFF8F0]
        p-5
        shadow-sm
      "
    >
      {/* =====================================================
          Header
      ===================================================== */}

      <div className="mb-5">
        <h2
          className="
            text-base
            font-black
            tracking-tight
            text-[#2B211B]
          "
        >
          {TEXT.payment_method_title || "Select Payment Method"}
        </h2>

        <p className="mt-1 text-xs text-[#8C7D73]">
          Choose how you would like to pay for your order.
        </p>
      </div>

      <div className="flex flex-col gap-3">

        {/* =====================================================
            Stripe
        ===================================================== */}

        {showStripe && (
          <PaymentOption
            value="stripe"
            selected={selected}
            onSelect={handleSelect}
            icon={<CreditCard size={19} />}
            title="Stripe"
            description="Secure card payment"
            accent="orange"
          />
        )}

        {/* =====================================================
            PayPal
        ===================================================== */}

        {showPayPal && (
          <PaymentOption
            value="paypal"
            selected={selected}
            onSelect={handleSelect}
            icon={<WalletCards size={19} />}
            title="PayPal"
            description="Pay securely with PayPal"
            accent="blue"
          />
        )}

        {/* =====================================================
            Cash on Delivery
        ===================================================== */}

        {showCOD && (
          <PaymentOption
            value="cod"
            selected={selected}
            onSelect={handleSelect}
            icon={<Banknote size={19} />}
            title={
              TEXT.payment_method_cod || "Cash on Delivery"
            }
            description="Pay when your order arrives"
            accent="green"
          />
        )}
      </div>
    </div>
  );
};

function PaymentOption({
  value,
  selected,
  onSelect,
  icon,
  title,
  description,
  accent,
}: {
  value: string;
  selected: string;
  onSelect: (value: string) => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: "orange" | "blue" | "green";
}) {
  const isSelected = selected === value;

  const accentClasses = {
    orange: {
      icon: "bg-[#FFF0E1] text-[#F59E45]",
      selected: "border-[#F59E45] bg-[#FFF5EA]",
    },
    blue: {
      icon: "bg-[#EEF4FF] text-[#3975D3]",
      selected: "border-[#3975D3] bg-[#F4F7FF]",
    },
    green: {
      icon: "bg-[#ECF8F1] text-[#2F9E68]",
      selected: "border-[#2F9E68] bg-[#F2FBF6]",
    },
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`
        flex
        w-full
        items-center
        gap-3
        rounded-2xl
        border
        p-4
        text-left
        transition-all
        duration-200
        ${
          isSelected
            ? accentClasses[accent].selected
            : "border-[#E9DDD3] bg-white hover:border-[#D9C8BB] hover:shadow-sm"
        }
      `}
    >
      {/* Icon */}

      <div
        className={`
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          ${accentClasses[accent].icon}
        `}
      >
        {icon}
      </div>

      {/* Text */}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[#2B211B]">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-[#95857A]">
          {description}
        </p>
      </div>

      {/* Radio */}

      <div
        className={`
          flex
          h-5
          w-5
          shrink-0
          items-center
          justify-center
          rounded-full
          border-2
          transition-all
          ${
            isSelected
              ? "border-[#F59E45]"
              : "border-[#CFC0B5]"
          }
        `}
      >
        {isSelected && (
          <div
            className="
              h-2.5
              w-2.5
              rounded-full
              bg-[#F59E45]
            "
          />
        )}
      </div>
    </button>
  );
}

export default PaymentSelector;

// "use client";

// import { useState } from "react";
// import { UseSiteContext } from "@/SiteContext/SiteContext";
// import { useLanguage } from "@/store/LanguageContext";

// const PaymentSelector = () => {
//   const { TEXT } = useLanguage();
//   const { setPaymentType } = UseSiteContext();
//   const [selected, setSelected] = useState<string>("");

//   // Read available payment methods from env
//   const showStripe = process.env.NEXT_PUBLIC_PAYMENT_STRIPE === "true";
//   const showPayPal = process.env.NEXT_PUBLIC_PAYMENT_PAYPAL === "true";
//   const showCOD = process.env.NEXT_PUBLIC_PAYMENT_COD === "true";


//   const handleSelect = (value: string) => {
//     setSelected(value);
//     setPaymentType(value);
//   };

//   return (
//     <div className="flex flex-col p-5 rounded-2xl border border-slate-300 bg-white">
//       {/* <h3 className="text-xl font-semibold text-slate-600 pt-3 pb-4 uppercase"> */}
//           <h2 className="text-sm font-semibold text-gray-700 mb-4">
//         {TEXT.payment_method_title || "Select Payment Method"}
//       </h2>

//       <div className="flex flex-col gap-4">
//         {/* Stripe */}
//         {showStripe && (
//           <div
//             className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition
//             ${selected === "stripe" ? "border-amber-400 bg-amber-50" : "border-slate-300 hover:border-amber-300"}`}
//             onClick={() => handleSelect("stripe")}
//           >
//             <div
//               className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
//               ${selected === "stripe" ? "border-amber-400" : "border-gray-400"}`}
//             >
//               {selected === "stripe" && (
//                 <div className="w-2.5 h-2.5 bg-amber-400 rounded-full"></div>
//               )}
//             </div>
//             <span className="text-blue-900 font-semibold">Stripe</span>
//           </div>
//         )}

//         {/* PayPal */}
//         {showPayPal && (
//           <div
//             className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition
//             ${selected === "paypal" ? "border-amber-400 bg-amber-50" : "border-slate-300 hover:border-amber-300"}`}
//             onClick={() => handleSelect("paypal")}
//           >
//             <div
//               className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
//               ${selected === "paypal" ? "border-amber-400" : "border-gray-400"}`}
//             >
//               {selected === "paypal" && (
//                 <div className="w-2.5 h-2.5 bg-amber-400 rounded-full"></div>
//               )}
//             </div>
//             <span>
//               <span className="text-blue-900 font-semibold">Pay</span>
//               <span className="text-sky-500 font-semibold">Pal</span>
//             </span>
//           </div>
//         )}

//         {/* Cash on Delivery */}
//         {showCOD && (
//           <div
//             className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition
//             ${selected === "cod" ? "border-amber-400 bg-amber-50" : "border-slate-300 hover:border-amber-300"}`}
//             onClick={() => handleSelect("cod")}
//           >
//             <div
//               className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
//               ${selected === "cod" ? "border-amber-400" : "border-gray-400"}`}
//             >
//               {selected === "cod" && (
//                 <div className="w-2.5 h-2.5 bg-amber-400 rounded-full"></div>
//               )}
//             </div>
//             <span className="text-slate-700 font-semibold">
//               {TEXT.payment_method_cod || "cod"}
//             </span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PaymentSelector;
