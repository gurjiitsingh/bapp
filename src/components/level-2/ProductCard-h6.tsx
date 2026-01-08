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
import CartButton from "../AddToCart/CartButton";
import AddOn from "../level-1/AddOn";
import { formatCurrencyNumber } from "@/utils/formatCurrency";

export default function ProdcutCardHorizontical({
  product,
  allAddOns,
}: {
  product: ProductType;
  allAddOns: addOnType[];
}) {
  const [addOnData, setAddOnData] = useState<addOnType[]>([]);
  const { productCategoryIdG, settings } = UseSiteContext();

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
    (settings.currency || "EUR") as string,
    (settings.locale || "de-DE") as string
  );
  let priceDiscounted;
  let priceTarget = product.price ?? 0;
  if (product.discountPrice && product.discountPrice > 0) {
    priceTarget = product.discountPrice;
    // priceDiscounted = product.discountPrice.toString().replace (/\./g, ",");
    priceDiscounted = formatCurrencyNumber(
      product.discountPrice,
      (settings.currency) as string,
      (settings.locale) as string
    );
  }

  const cartProduct: cartProductType = {
    id: product.id,
    quantity: 1,
    price: priceTarget,
    stockQty: null,
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
    <div className="bg-black w-full  lg:w-[48%]    shadow-lg flex flex-row   rounded-2xl items-center p-1">
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
            <div className="flex text-slate-50 font-bold items-start justify-start  min-w-[180px] ">
           {/* product-card-add-title-cover-1 */}
              {/* {productCategoryIdG !== "" && <>{product.sortOrder}.&nbsp;</>} */}
              {product.name}
            </div>
          </div>

          {/* <button onClick={() => alert(product.productDesc)}> */}

          <button
            onClick={() =>
              alert(product.productDesc ?? "Keine Beschreibung verfügbar")
            }
            className="text-sm text-slate-500 font-extralight text-left   overflow-hidden"
          >
            {product.productDesc}
          </button>

          {!product.flavors && (
            <div className=" flex  items-center  justify-between py-[1px]   rounded-3xl">
              <div>Pack</div>
              {/* common code start */}
              {product.discountPrice !== undefined &&
              product.discountPrice > 0 ? (
                <div className="flex justify-between gap-3 items-center">
                  {" "}
                  <div className="line-through">{priceRegular}</div>{" "}
                  <div>{priceDiscounted}</div>
                </div>
              ) : (
                <div>{priceRegular}</div>
              )}
              {/* common code end */}
              <div>
                {!isCartDisabled ? (
                  <div className="product-card-add-button-cover-1 rounded-2xl">
                  <CartButton cartProduct={cartProduct} /></div>
                ) : (
                  <div className="relative group ">
                    <button
                      onClick={() => {
                        toast(
                          "Mittagessen gibt’s nur von 11 bis 16 Uhr. Bitte etwas anderes wählen."
                        );
                      }}
                      className="px-1 py-1 rounded-full bg-slate-500 cursor-not-allowed"
                    >
                      <IoMdAdd size={20} className="text-white" />
                    </button>
                    <div className="absolute bottom-full left-0 transform -translate-x-[100%] mb-2 w-max max-w-[200px] bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50">
                      Mittagessen gibt’s nur von 11 bis 16 Uhr. Bitte etwas
                      anderes wählen.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {product.flavors && (
          <AddOn baseProductName={product.name} addOnData={addOnData} />
        )}
      </div>
    </div>
  );
}

//bg-[#FF8989]
//bg-amber-400
