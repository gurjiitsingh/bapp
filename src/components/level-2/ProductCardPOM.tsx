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
import { FaFireAlt, FaHeart, FaLeaf, FaSmile } from "react-icons/fa";

export default function ProductCardPrductOfMonth({
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
                className=" w-[240px] sm:min-w-[280px] md:min-w-[300px] flex-shrink-0 snap-center"
              >
                <div className="relative bg-white  rounded-2xl  transition px-3 pt-3 pb-0">
                  {/* Discount badge */}
                  {/* {product.discountPrice && (
                    <div className="absolute top-2 right-2 bg-[#8b0000] text-white text-[10px] sm:text-xs px-0 py-1 rounded-md font-semibold">
                      -
                      {Math.round(
                        100 - (product.discountPrice / product.price) * 100
                      )}
                      %
                    </div>
                  )} */}

                  <button className="text-left w-full">
                    <h3
                      className={`${lato.className} w-full   text-xl font-bold sm:text-lg text-[#2B2E4A] mb-0`}
                    >
                      {product.name}
                    </h3>
                    {/* <p className="italic text-gray-500 text-xs sm:text-sm mb-1">
                      Empfehlung vom Chefkoch
                    </p> */}

                    <div className="flex items-center gap-2 text-[#d24a0f] text-xs mb-0">
                      <FaFireAlt /> <FaLeaf /> 🌶️
                    </div>

                    <p className=" w-full h-[60px] text-gray-700 text-xs sm:text-[13spx] leading-snug mb-0">
                      {product.productDesc || "Leckeres Gericht des Monats"}
                    </p>

                    {/* Price */}
                   
<div className="w-full flex justify-end">
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
              )}</div>

                   
                  </button>
                </div>
                <div className="">
 {/* Reactions */}
                    <div className="flex items-center gap-3 px-2  mt-[-1px] text-xs sm:text-sm">
                      <span className="flex items-center gap-1 text-gray-600 bg-white p-1 rounded-b-lg">
                        <FaHeart className="text-[#d24a0f]" /> 41
                      </span>
                      <span className="flex items-center gap-1 text-gray-600 bg-white p-1 rounded-b-lg">
                        <FaSmile className="text-[#d24a0f]" /> 13
                      </span>
                    </div>

                </div>
              </div>
  );
}

//bg-[#FF8989]
//bg-amber-400
