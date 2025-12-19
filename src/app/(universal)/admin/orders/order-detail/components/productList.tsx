"use client";

import React from "react";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { formatCurrencyNumber } from "@/utils/formatCurrency";
import {  OrderProductT } from "@/lib/types/orderType";
import { CartItemWithTax } from "@/lib/types/cartDataType";

interface ProductListProps {
  item: OrderProductT;
}

const ProductList: React.FC<ProductListProps> = ({ item }) => {
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
    const itemSubtotal_formated = formatCurrencyNumber(
      Number(item.itemSubtotal) ?? 0,
      (settings.currency || "EUR") as string,
      (settings.locale || "de-DE") as string
    );
     const itemTax_formated = formatCurrencyNumber(
      Number(item.taxAmount) ?? 0,
      (settings.currency || "EUR") as string,
      (settings.locale || "de-DE") as string
    );
  const finalTotal_tax_formated = formatCurrencyNumber(
      Number(item.finalTotal) ?? 0,
      (settings.currency || "EUR") as string,
      (settings.locale || "de-DE") as string
    );

   

  return (
    <div className="flex flex-row gap-2 justify-between border-b mt-2 rounded-xl">
      <div className="w-[20%]">
        <div className="w-[100px]">
          {/* Optional image block */}
          {/* <Image
            src={item.image}
            width="0"
            height="0"
            sizes="100vw"
            loading="eager"
            priority={true}
            className="w-full h-[100px] rounded-tl-xl rounded-bl-xl"
            alt={item.name}
          /> */}
        </div>
      </div>
      <div className="w-full flex flex-col justify-between gap-2 p-2">
        <div className="flex flex-row gap-3 items-start">
          <div className="text-sm w-[40%] flex items-start">{item.name}</div>
          <div className="flex gap-2 w-[60%]">
            
               <div className="text-[1rem] w-[33%] flex items-start justify-end">
              {item.quantity}
            </div>
            <div className="text-[1rem] w-[33%] flex items-start justify-end">
              {itemPrice_formated}
            </div>

   <div className="text-[1rem] w-[33%] flex items-start justify-end">
              {itemSubtotal_formated}
            </div>

              <div className="text-[1rem] w-[33%] flex items-start justify-end">
              {itemTax_formated}
            </div>
         
            <div className="text-[1rem] w-[33%] flex items-start justify-end">
              {/* {total_FORMATED} */}
              {finalTotal_tax_formated}
            </div>
          </div>
        </div>
        <div>{item.productDesc}</div>
        <div className="flex flex-row justify-between">
          <div className="flex justify-between items-center gap-2"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
