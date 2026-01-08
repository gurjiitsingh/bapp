import { formatCurrencyNumber } from "@/utils/formatCurrency";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { useLanguage } from "@/store/LanguageContext";
import React from "react";

export default function DeliveryFee() {
  const { TEXT } = useLanguage();
  const { settings, deliveryDis, deliveryType } = UseSiteContext();

  const priceValue = Number(deliveryDis?.deliveryFee);
  const isDeliverable = !isNaN(priceValue);

  const delivery_price = isDeliverable
    ? formatCurrencyNumber(
        priceValue,
        settings.currency as string,
        settings.locale as string
      )
    : null;

  return (
    <>
      {deliveryType === "delivery" && (
        <>
          {isDeliverable ? (
            <div className="font-semibold border-b py-3 w-full flex justify-between items-center">
              <button className="text-sm font-semibold py-3 w-full text-left">
                {TEXT.deliveryFee.title}
              </button>
              <div className="flex gap-1">
                <span>{delivery_price}</span>
              </div>
            </div>
          ) : (
            <div className="font-semibold border-b py-3 w-full flex justify-between items-center">
              <div className="flex gap-1 justify-start w-full">
                <span className="text-sm font-extralight text-red-600">
                  {TEXT.deliveryFee.notDeliverableAddress}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
