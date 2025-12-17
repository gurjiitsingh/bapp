"use client";

import { useMemo, useContext } from "react";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import CartContext from "@/store/CartContext";

import { ProductType } from "@/lib/types/productType";
import { addOnType } from "@/lib/types/addOnType";
import { cartProductType } from "@/lib/types/cartDataType";
import { formatCurrencyNumber } from "@/utils/formatCurrency";

import CartButtonAdd from "../AddToCart/CartButtonAddPOS";
import Image from "next/image";

export default function ProductCardHorizontical({
  product,
  variants,
  allAddOns,
}: {
  product: ProductType;
  variants: ProductType[];
  allAddOns: addOnType[];
}) {
  const { settings } = UseSiteContext();
  const { addProductToCart } = useContext(CartContext);

  /* ---------------- VARIANTS ---------------- */
  const productVariants = useMemo(() => {
    if (!product.hasVariants || !Array.isArray(variants)) return [];

    return variants
      .filter((v) => v.parentId === product.id)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [product.id, product.hasVariants, variants]);

  /* ---------------- DEFAULT VARIANT ---------------- */
  const defaultVariant = useMemo(() => {
    if (!productVariants.length) return null;

    return productVariants.reduce((min, v) =>
      (v.price ?? 0) < (min.price ?? 0) ? v : min
    );
  }, [productVariants]);

  /* ---------------- PRICE ---------------- */
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

  /* ---------------- AUTO ADD DEFAULT VARIANT ---------------- */
  const handleProductClick = () => {
    if (!product.hasVariants || !defaultVariant) return;

    if (defaultVariant.stockQty === 0) return;
    // name: `${product.name} ${defaultVariant.name}`,
    addProductToCart({
      id: defaultVariant.id,
      quantity: 1,
      stockQty: defaultVariant.stockQty,
      price: defaultVariant.price ?? 0,
      name: `${defaultVariant.name}`,
      image: product.image,
      categoryId: defaultVariant.categoryId,
      productCat: defaultVariant.productCat!,
      taxRate: defaultVariant.taxRate,
      taxType: defaultVariant.taxType,
    });
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="bg-white w-full xl:w-[49%] rounded-2xl shadow-sm p-1">
      {/* SINGLE ROW – HEIGHT NEVER CHANGES */}
      <div className="flex items-center gap-1 flex-nowrap overflow-x-auto">
     

        {/* VARIANTS */}
        {product.hasVariants &&
          productVariants.map((variant) => (
            <div
              key={variant.id}
              className="
            w-[90px]
            h-[90px]
            flex-shrink-0
            rounded-xl
            border
            border-slate-100
            bg-white
            flex
            flex-col
            items-center
            justify-between
            px-px py-px
            text-center
          "
            >
              {/* NAME */}
              <span className="text-xs text-gray-600 leading-tight">
                {variant.name}
              </span>

              {/* PRICE */}
              <span className="text-xs font-bold text-gray-600">
                {formatCurrencyNumber(
                  variant.price ?? 0,
                  settings.currency as string,
                  settings.locale as string
                )}
              </span>
              {/* name: `${product.name} ${variant.name}`, */}
              {/* ADD */}
              <CartButtonAdd
                cartProduct={{
                  id: variant.id,
                  quantity: 1,
                  stockQty: variant.stockQty,
                  price: variant.price ?? 0,
                  name: `${variant.name}`,
                  image: product.image,
                  categoryId: variant.categoryId,
                  productCat: variant.productCat!,
                  taxRate: variant.taxRate,
                  taxType: variant.taxType,
                }}
              />
            </div>
          ))}

        {/* NO VARIANTS (fallback) */}
        {/* NO VARIANTS (fallback) */}
        {!product.hasVariants && (
          <div
            className="
      w-[90px]
      h-[90px]
      flex-shrink-0
      rounded-xl
      border
      border-slate-100
      bg-white
      flex
      flex-col
      items-center
      justify-between
      px-1 py-1
      text-center
    "
          >
            {/* PRODUCT NAME */}
            <span className="text-xs text-gray-600 leading-tight line-clamp-2">
              {product.name}
            </span>

            {/* PRICE */}
            <span className="text-xs font-bold text-gray-600">
              {formatCurrencyNumber(
                product.price ?? 0,
                settings.currency as string,
                settings.locale as string
              )}
            </span>

            {/* ADD */}
            <CartButtonAdd
              cartProduct={{
                id: product.id,
                quantity: 1,
                stockQty: product.stockQty,
                price: product.price ?? 0,
                name: product.name,
                image: product.image,
                categoryId: product.categoryId,
                productCat: product.productCat!,
                taxRate: product.taxRate,
                taxType: product.taxType,
              }}
            />
          </div>
        )}

           {/* IMAGE */}
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          {product.image && (
            <Image
              src={product.image}
              alt={product.name}
              width={90}
              height={90}
              className="object-cover"
            />
          )}
        </div>
      </div>
    </div>
  );
}
