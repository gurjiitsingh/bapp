
"use client";

import { UseSiteContext } from "@/SiteContext/SiteContext";
import { useLanguage } from "@/store/LanguageContext";
import { Check, ShoppingBag, Truck } from "lucide-react";

export default function SetDeliveryType() {
  const { TEXT } = useLanguage();
  const { chageDeliveryType, deliveryType } = UseSiteContext();

  const options = [
    {
      type: "pickup" as const,
      label: TEXT.pickup_button,
      description: "Collect your order from our restaurant",
      Icon: ShoppingBag,
    },
    {
      type: "delivery" as const,
      label: TEXT.delivery_button,
      description: "Get your order delivered to your address",
      Icon: Truck,
    },
  ];

  return (
    <div className="w-full mt-5 mb-1">
      <h3 className="text-base font-semibold text-slate-800">
        How would you like to receive your order?
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {options.map(({ type, label, description, Icon }) => {
          const selected = deliveryType === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => chageDeliveryType(type)}
              aria-pressed={selected}
              className={`relative flex flex-col items-start gap-3 rounded-xl border-2 p-4 text-left transition-all
                ${
                  selected
                    ? "border-green-500 bg-green-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
            >
              <div className="flex w-full items-center justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-lg
                    ${
                      selected
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                >
                  <Icon size={23} />
                </div>

                {selected && (
                  <Check
                    size={20}
                    className="text-green-600"
                  />
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {label}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
