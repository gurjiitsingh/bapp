
import React from "react";
import { formatCurrencyNumber } from '@/utils/formatCurrency';
import { UseSiteContext } from "@/SiteContext/SiteContext";

export default function CouponDisc({ total }: { total: number }) {
  const { couponDisc,settings } = UseSiteContext();

  const coupon_discount = formatCurrencyNumber(
    Number(couponDisc?.discount) ?? 0,
    (settings.currency ) as string,
    (settings.locale ) as string
  );

  const discount_value_from_percent = ((+total * Number(couponDisc?.discount)) / 100);

  const discount_value_from_percentCUR = formatCurrencyNumber(
    discount_value_from_percent ?? 0,
    (settings.currency ) as string,
    (settings.locale ) as string
  );


  

  return (
    <>
      {couponDisc?.discount  &&(
        <>
          {couponDisc?.discountType === "flat" ? (
            <div className="font-semibold border-b py-3 w-full flex justify-between items-center">
              <div className="text-sm font-semibold py-3 w-full text-left">
                Coupon Discount &nbsp;
                 {/* {couponDisc?.discount}  */}
                  {coupon_discount }
                 &nbsp; flat
              </div>
              <div className="flex gap-1">
                {coupon_discount}
                {/* - <span>&#8364;</span>{" "}
                <span>
                  {(Number(couponDisc?.discount))
                    .toFixed(2)
                    .replace (/\./g, ",")}
                </span> */}
              </div>
            </div>
          ) : (
            <div className="font-semibold border-b py-3 w-full flex justify-between items-center">
              <div className="text-sm font-semibold py-3 w-full text-left">
                Coupon Discount {couponDisc?.discount}%
              </div>
              <div className="flex gap-1">
                {couponDisc?.discount && <span>- &#8364;</span>}
                {discount_value_from_percentCUR}
                {/* <span>
                  {((+total * Number(couponDisc?.discount)) / 100)
                    .toFixed(2)
                    .replace (/\./g, ",")}
                </span> */}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
