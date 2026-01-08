"use client";

import { useMemo } from "react";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { ProductType } from "@/lib/types/productType";
import { addOnType } from "@/lib/types/addOnType";
import { cartProductType } from "@/lib/types/cartDataType";
import { formatCurrencyNumber } from "@/utils/formatCurrency";
import CartButtonAdd from "../AddToCart/CartButtonAdd";
import Image from "next/image";

export default function ProductCardHorizontical({
  product,
  variants,
  allAddOns,
}: {
  product: ProductType;
  variants: ProductType[]; //  NEW
  allAddOns: addOnType[];
}) {
  const { settings } = UseSiteContext();

  //  FILTER VARIANTS FOR THIS PRODUCT
  const productVariants = useMemo(() => {
    if (!product.hasVariants) return [];
    return variants
      .filter((v) => v.parentId === "product.id")
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [product.id, product.hasVariants, variants]);

  // ---------------- PRICE ----------------
  const priceRegular = formatCurrencyNumber(
    product.price ?? 0,
    settings.currency as string,
    settings.locale as string
  );

  const priceTarget =
    product.discountPrice && product.discountPrice > 0
      ? product.discountPrice
      : product.price ?? 0;

  const priceDiscounted =
    product.discountPrice && product.discountPrice > 0
      ? formatCurrencyNumber(
          product.discountPrice,
          settings.currency as string,
          settings.locale as string
        )
      : null;

  const cartProduct: cartProductType = {
    id: product.id,
    quantity: 1,
    stockQty: product.stockQty,
    price: priceTarget,
    name: product.name,
    image: product.image,
    categoryId: product.categoryId,
    productCat: product.productCat!,
    taxRate: product.taxRate,
    taxType: product.taxType,
  };

  

  // ---------------- UI ----------------
  return (
    <div className="flex flex-col gap-2 bg-white w-full lx:w-[49%] rounded-2xl shadow-sm p-3">
      {/* PRODUCT HEADER */}
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
          {product.image && (
            <Image
              src={product.image}
              alt={product.name}
              width={80}
              height={80}
              className="object-cover"
            />
          )}
        </div>

        <div className="flex-1 justify-between">
          <h3 className="font-semibold">{product.name}</h3>
          <p className="text-sm text-gray-500"></p>

          {!product.hasVariants && (
            <div className="flex justify-between mt-2">
              <div>
                {priceDiscounted ? (
                  <>
                    <span className="font-bold">{priceDiscounted}</span>
                    <span className="line-through ml-2 text-sm">
                      {priceRegular}
                    </span>
                  </>
                ) : (
                  <span>{priceRegular}</span>
                )}
              </div>
              <CartButtonAdd cartProduct={cartProduct} />
            </div>
          )}
        </div>
      </div>

      {/*  VARIANTS LIST */}
      {product.hasVariants && productVariants.length > 0 && (
        <div className="mt-2 space-y-2">
          {productVariants.map((variant) => (
            <div
              key={variant.id}
              className="flex justify-between items-center bg-slate-50 rounded-lg p-2"
            >
              <div>
                <p className="font-medium">{variant.name}</p>
                <p className="text-sm text-gray-500">
                  {formatCurrencyNumber(
                    variant.price ?? 0,
                    settings.currency as string,
                    settings.locale as string
                  )}
                </p>
              </div>

              <CartButtonAdd
                cartProduct={{
                   id: variant.id,
                  price: variant.price ?? 0,
                  name: product.name +" "+ variant.name,
                  quantity: 1,
                  stockQty: variant.stockQty,
                  image: product.image,
                  categoryId: variant.categoryId,
                  productCat: variant.productCat!,
                  taxRate: variant.taxRate,
                  taxType: variant.taxType,

               
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
