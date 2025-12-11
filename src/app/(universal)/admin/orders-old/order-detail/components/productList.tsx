"use client";

import React from "react";
import { OrderProductT } from "@/lib/types/orderType";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { formatCurrencyNumber } from "@/utils/formatCurrency";

type ProductListProps = {
  item: OrderProductT;
};

const ProductList = ({ item }: ProductListProps) => {
  const { settings } = UseSiteContext();

  const total = (parseInt(item.quantity.toString()) * parseFloat(item.price.toString())).toFixed(2);

  const total_FORMATED = formatCurrencyNumber(
    Number(total) ?? 0,
    (settings.currency || "EUR") as string,
    (settings.locale || "de-DE") as string
  );

  const itemPrice_formated = formatCurrencyNumber(
    Number(item.price) ?? 0,
    (settings.currency || "EUR") as string,
    (settings.locale || "de-DE") as string
  );

  return (
    <div className="flex flex-row gap-2 justify-between border-b mt-2 rounded-xl">
      <div className="w-[20%]">
        <div className="w-[100px]">
          {/* Optional image placeholder */}
        </div>
      </div>
      <div className="w-full flex flex-col justify-between gap-2 p-2">
        <div className="flex flex-row gap-3 items-start">
          <div className="text-sm w-[40%] flex items-start">{item.name}</div>
          <div className="flex gap-2 w-[60%]">
            <div className="text-[1rem] w-[33%] flex items-start justify-end">
              {itemPrice_formated}
            </div>
            <div className="text-[1rem] w-[33%] flex items-start justify-end">
              {item.quantity}
            </div>
            <div className="text-[1rem] w-[33%] flex items-start justify-end">
              {total_FORMATED}
            </div>
          </div>
        </div>
        <div>{item.productDesc}</div>
      </div>
    </div>
  );
};

export default ProductList;
