"use client";
// import { fetchProductByBaseProductId } from "@/app/(universal)/action/productsaddon/dbOperation";
// import { AddOnProductSchemaType } from "@/lib/types/productAddOnType";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import React, { useEffect, useState } from "react";

import { cartProductType } from "@/lib/types/cartDataType";
import { ProductType } from "@/lib/types/productType";
import { addOnType } from "@/lib/types/addOnType";
import { IoMdAdd } from "react-icons/io";
import toast from "react-hot-toast";
import AddOn from "../level-1/AddOn";
import { formatCurrencyNumber } from "@/utils/formatCurrency";
import CartButtonAdd from "../AddToCart/CartButtonAdd";
import { Lato } from "next/font/google";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
  display: "swap",
});

import {
 
  Info,
  Flame,
  Utensils,
  Leaf,
  CircleHelp,
} from "lucide-react";

export default function ProductCardForSlider({
  product,
 
}: {
  product: ProductType;
  
}) {
 
  const {  settings } = UseSiteContext();
 


  //common code start

  //const priceRegular = product.price?.toString().replace (/\./g, ",") ?? "0,00";
  // const priceRegular = formatCurrencyNumber(
  //   product.price ?? 0,
  //   (settings.currency || "EUR") as string,
  //   (settings.locale || "de-DE") as string
  // );

  const priceRegular = formatCurrencyNumber(
  product.price ?? 0,       // numeric value
  (settings.currency ) as string,
      (settings.locale ) as string
);

  let priceDiscounted;
  let priceTarget = product.price ?? 0;
  if (product.discountPrice && product.discountPrice > 0) {
    priceTarget = product.discountPrice;
    // priceDiscounted = product.discountPrice.toString().replace (/\./g, ",");
    priceDiscounted = formatCurrencyNumber(
      product.discountPrice,
      (settings.currency ) as string,
      (settings.locale ) as string
    );
  }

  const cartProduct: cartProductType = {
    id: product.id,
    quantity: 1,
    stockQty :product.stockQty,
    price: priceTarget,
    name: product.name,
    image: product.image,
    categoryId: product.categoryId,
    productCat: product.productCat!,
    taxRate: product.taxRate,
    taxType: product.taxType,
    
  };

  const isCartDisabled = (() => {
    if (product.categoryId !== "2vvuGl0pgbvvyEPc7o83") return false;
    const berlinTime = new Date().toLocaleString("en-US", {
      timeZone: "Europe/Berlin",
    });
    const berlinHour = new Date(berlinTime).getHours();
    return !(berlinHour >= 11 && berlinHour < 16);
  })();

  //common code end
  return (
 <div
            key={product.id}
            className="min-w-[250px] bg-white rounded-3xl border border-[#f3e6dc] shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all flex-shrink-0 p-5"
          >
            {/* Product Header (Optional Image Removed) */}
            {/* <div className="w-full h-32 rounded-xl overflow-hidden bg-gray-100 mb-3">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div> */}

            {/* Product Name */}
            <h3
              className={`${lato.className} font-bold text-[#000000] text-[18px] leading-tight tracking-wide`}
              style={{
                fontFamily: `'Lato', sans-serif`,
              }}
            >
              {product.name}
            </h3>

            {/* Icons Row (Visual Feature Line) */}
            <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
              <CircleHelp size={16} />
              <Flame size={16} />
              <Utensils size={16} />
              <Leaf size={16} />
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mt-1 italic line-clamp-2 max-w-[250px]">
              {product.productDesc || "Leckeres Gericht mit frischen Zutaten"}
            </p>

            {/* Price Row */}
            <div className="mt-3 flex items-center justify-between">
              <div className="text-base font-bold text-[#d24a0f] flex items-center gap-1">
                {/* {product.discountPrice ? (
                  <>
                    <span className="line-through text-gray-400 text-sm">
                      {product.price}€
                    </span>
                    {product.discountPrice}€
                  </>
                ) : (
                  `${product.price}€`
                )} */}


  {product.discountPrice !== undefined &&
              product.discountPrice > 0 ? (
                <div className="text-base font-bold text-[#d24a0f] flex items-center gap-1">
                  {" "}
                  <div className="line-through text-gray-400 text-sm">{priceRegular}</div>
                  <div className="text-md font-bold ">{priceDiscounted}</div>
                  
                  {" "}
                  </div>
              ) : (
                <div className="text-base font-bold text-[#d24a0f] flex items-center gap-1">{priceRegular}</div>
              )}

              </div>

              <Info
                size={18}
                className="text-gray-400 hover:text-[#d24a0f] cursor-pointer transition"
              />
            </div>
          </div>
  );
}

//bg-[#FF8989]
//bg-amber-400
