"use client";
// import { fetchProductByBaseProductId } from "@/app/(universal)/action/productsaddon/dbOperation";
// import { AddOnProductSchemaType } from "@/lib/types/productAddOnType";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import React, { useEffect, useState } from "react";

import { cartProductType } from "@/lib/types/cartDataType";
import { ProductType } from "@/lib/types/productType";
import { addOnType } from "@/lib/types/addOnType";


import { formatCurrencyNumber } from "@/utils/formatCurrency";

import { Cinzel, Lato, Roboto, Abel } from "next/font/google";
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "600", "700"] });
const lato = Lato({ subsets: ["latin"], weight: ["400", "700"] });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });
const abel = Abel({ subsets: ["latin"], weight: "400" });
const fonts = {
  Cinzel: cinzel,
  Abel: abel,
  // Playfair: playfair,
  // Cormorant: cormorant,
  // Lora: lora,
  // Montserrat: montserrat,
  // Oswald: oswald,
  // Bebas: bebas,
  // Anton: anton,
  // GreatVibes: vibes,
  // Pacifico: pacifico,
  // Dancing: dancing,
  Lato: lato,
  Roboto: roboto,
  //Poppins: poppins,
};

const fontTitle =
  fonts[process.env.NEXT_PUBLIC_FONT_TITLE as keyof typeof fonts] || cinzel;
const fontDescription =
  fonts[process.env.NEXT_PUBLIC_FONT_DESCRIPTION as keyof typeof fonts] || lato;
const fontPrice =
  fonts[process.env.NEXT_PUBLIC_FONT_PRICE as keyof typeof fonts] || roboto;

export default function ProdcutCardHorizontical({
  product,
  allAddOns,
}: {
  product: ProductType;
  allAddOns: addOnType[];
}) {
  const [addOnData, setAddOnData] = useState<addOnType[]>([]);
  const {  settings } = UseSiteContext();

  useEffect(() => {
    if (allAddOns.length !== 0 && product.flavors) {
      const AddOnData = allAddOns.filter(
        (item: addOnType) => product.id === item.baseProductId
      );
      AddOnData.sort(
        (a: addOnType, b: addOnType) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      );
      setAddOnData(AddOnData);
    }
  }, [product.id, allAddOns, product.flavors]);

  //common code start

  //const priceRegular = product.price?.toString().replace (/\./g, ",") ?? "0,00";
  const priceRegular = formatCurrencyNumber(
    product.price ?? 0,
    (settings.currency) as string,
    (settings.locale) as string
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

  // const cartProduct: cartProductType = {
  //   id: product.id,
  //   quantity: 1,
  //   price: priceTarget,
  //   name: product.name,
  //   image: product.image,
  //   categoryId: product.categoryId,
  //   productCat: product.productCat!,
  // };

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
    <div className="w-full lg:w-[49%]  shadow-sm  bg-white rounded-xl     flex flex-row    items-center p-1">
      <div className="rounded-2xl flex items-center justify-center w-[120px] h-[120px]  md:w-[150px]  md:h-[150px]  overflow-hidden">
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="h-full  "
          />
        )}
      </div>

      <div className="w-full flex flex-col pl-3 justify-between">
        <div className="w-full flex-col gap-4 justify-between ">
          <div className="w-full flex gap-1 mb-2 justify-between ">
            <div className="flex text-slate-500 font-bold items-start justify-start  min-w-[180px] ">
           {/* product-card-add-title-cover-1 */}
              {/* {productCategoryIdG !== "" && <>{product.sortOrder}.&nbsp;</>} */}
              {product.name}
              
            </div>
          </div>

           {/* Description */}
          {product.productDesc && (
            <p
              onClick={() =>
                alert(product.productDesc ?? "No description available")
              }
              className={`${fontDescription.className} text-md text-gray-600 mt-1 line-clamp-3 cursor-pointer`}
            >
              {product.productDesc}
            </p>
          )}

          {/* <button onClick={() => alert(product.productDesc)}> */}

          {/* <button
            onClick={() =>
              alert(product.productDesc ?? "Keine Beschreibung verfügbar")
            }
            className="text-sm text-slate-500 font-extralight text-left   overflow-hidden"
          >
            {product.productDesc}
          </button> */}

          {!product.flavors && (
            <div className=" flex  items-center  justify-between py-[1px]   rounded-3xl">
            
              {/* common code start */}
              {product.discountPrice !== undefined &&
              product.discountPrice > 0 ? (
                <div className="flex justify-between gap-3 items-center">
                  {" "}
                  <div className="text-md font-bold text-slate-500">{priceDiscounted}</div>
                  <div className="line-through text-sm text-slate-500">{priceRegular}</div>
                  {" "}
                  </div>
              ) : (
                <div className="text-md font-bold text-slate-500">{priceRegular}</div>
              )}
               {/* Cart Button */}
        <div className="w-full flex justify-center mx-3 ">
          {/* {!isCartDisabled ? (
            <CartButtonAdd cartProduct={cartProduct} />
          ) : (
            <div className="relative group">
            
            </div>
          )} */}
        </div>
            </div>
          )}
        </div>

       
      </div>
    </div>
  );
}

//bg-[#FF8989]
//bg-amber-400
