import { UseSiteContext } from "@/SiteContext/SiteContext";
import { useLanguage } from "@/store/LanguageContext";
import { FaCheck } from "react-icons/fa";

export default function SetDeliveryType() {
  const { TEXT } = useLanguage();
  const { chageDeliveryType, deliveryType } = UseSiteContext();

  return (
    <div className="font-semibold border-b border-slate-200 py-3 w-full flex justify-start gap-4">
      {/* Pickup option */}
      <div className="flex flex-col gap-2">
        <div className="h-5 flex justify-center">
          {deliveryType === "pickup" && (
            <FaCheck className="text-green-400" size={20} />
          )}
        </div>
        <div className="w-fit">
          <button
            onClick={() => chageDeliveryType("pickup")}
            className={`flex gap-2 items-center text-sm border rounded-2xl px-3 font-semibold py-1 w-full text-left transition
              ${
                deliveryType === "pickup"
                  ? "bg-green-200 text-slate-800 border-green-300"
                  : "bg-gray-200 text-slate-600 hover:bg-gray-300 border-gray-300"
              }`}
          >
            <span>{TEXT.pickup_button}</span>
          </button>
        </div>
      </div>

      {/* Delivery option */}
      <div className="flex flex-col gap-2">
        <div className="h-5 flex justify-center">
          {deliveryType === "delivery" && (
            <FaCheck className="text-green-400" size={20} />
          )}
        </div>
        <div className="w-fit">
          <button
            onClick={() => chageDeliveryType("delivery")}
            className={`flex gap-2 items-center text-sm border rounded-2xl px-3 font-semibold py-1 w-full text-left transition
              ${
                deliveryType === "delivery"
                  ? "bg-green-200 text-slate-800 border-green-300"
                  : "bg-gray-200 text-slate-600 hover:bg-gray-300 border-gray-300"
              }`}
          >
            <span>{TEXT.delivery_button}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
