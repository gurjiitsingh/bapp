"use client";

import { useMemo, useContext } from "react";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import CartContext from "@/store/CartContext";

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

    addProductToCart({
      id: defaultVariant.id,
      quantity: 1,
      stockQty: defaultVariant.stockQty,
      price: defaultVariant.price ?? 0,
      name: `${product.name} ${defaultVariant.name}`,
      image: product.image,
      categoryId: defaultVariant.categoryId,
      productCat: defaultVariant.productCat!,
      taxRate: defaultVariant.taxRate,
      taxType: defaultVariant.taxType,
    });
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="flex flex-col gap-2 bg-white w-full lg:w-[49%] rounded-2xl shadow-sm p-3">
      {/* PRODUCT HEADER */}
      <div
        className="flex gap-4 cursor-pointer"
        onClick={handleProductClick}
      >
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

        <div className="flex-1">
          <h3 className="font-semibold">{product.name}</h3>

          {!product.hasVariants && (
            <div className="flex justify-between mt-2">
              <div>
                {priceDiscounted ? (
                  <>
                    <span className="font-bold">{priceDiscounted}</span>
                    <span className="line-through ml-2 text-sm text-gray-400">
                      {priceRegular}
                    </span>
                  </>
                ) : (
                  <span className="font-bold">{priceRegular}</span>
                )}
              </div>

              <CartButtonAdd
                cartProduct={{
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
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* VARIANTS */}
      {product.hasVariants && productVariants.length > 0 && (
        <div
          className="
            mt-3
            grid grid-flow-col auto-cols-max
            md:grid-cols-3 md:auto-cols-auto
            gap-2
            overflow-x-auto md:overflow-visible
          "
        >
          {productVariants.map((variant) => {
            const isDefault = defaultVariant?.id === variant.id;
            const outOfStock = variant.stockQty === 0;

            return (
              <div
                key={variant.id}
                className={`
                  min-w-[110px]
                  rounded-xl
                  p-2
                  flex flex-col
                  items-center
                  justify-between
                  text-center
                  shadow-sm
                  transition
                  relative

                  ${
                    outOfStock
                      ? "bg-gray-100 opacity-50 pointer-events-none"
                      : isDefault
                      ? "bg-green-50 border-2 border-green-500"
                      : "bg-slate-50 border"
                  }
                `}
              >
                {/* SIZE BADGE */}
                <span className="
                  absolute top-1 right-1
                  text-[10px] font-bold
                  bg-gray-800 text-white
                  rounded-full px-2 py-[1px]
                ">
                  {variant.name.split(" ")[0]}
                </span>

                {/* NAME */}
                <p className="text-xs font-semibold leading-tight">
                  {variant.name}
                </p>

                {/* PRICE */}
                <p className="text-sm font-bold text-gray-700 my-1">
                  {formatCurrencyNumber(
                    variant.price ?? 0,
                    settings.currency as string,
                    settings.locale as string
                  )}
                </p>

                {/* ADD */}
                <CartButtonAdd
                  cartProduct={{
                    id: variant.id,
                    quantity: 1,
                    stockQty: variant.stockQty,
                    price: variant.price ?? 0,
                    name: `${product.name} ${variant.name}`,
                    image: product.image,
                    categoryId: variant.categoryId,
                    productCat: variant.productCat!,
                    taxRate: variant.taxRate,
                    taxType: variant.taxType,
                  }}
                />

                {outOfStock && (
                  <span className="text-[10px] text-red-500 mt-1">
                    Out of stock
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
