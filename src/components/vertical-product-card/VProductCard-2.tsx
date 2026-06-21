"use client";

import Image from "next/image";
import Link from "next/link";
import { ProductType } from "@/lib/types/productType";
import { cartProductType } from "@/lib/types/cartDataType";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import CartButtonAdd from "../AddToCart/CartButtonAdd";

type Props = {
  product: ProductType;
};

export default function VProductCard_1({
  product,
}: Props) {
  const discount =
    product.discountPrice &&
    product.discountPrice > 0;


  const { settings } = UseSiteContext();

  let priceTarget = product.price ?? 0;

  if (
    product.discountPrice &&
    product.discountPrice > 0
  ) {
    priceTarget = product.discountPrice;
  }

  const cartProduct: cartProductType = {
    id: product.id,
    quantity: 1,
    currentStock: product.currentStock!,
    price: priceTarget,
    name: product.name,
    image: product.image,
    categoryId: product.categoryId,
    productCat: product.productCat!,
    taxRate: product.taxRate,
    taxType: product.taxType,
  };

  return (
    <div
    
      className="
        group
        bg-white
        rounded-[28px]
        overflow-hidden
        border
        border-neutral-100
        hover:shadow-xl
        transition
      "
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
        <Image
          src={
            product.image ||
            "/placeholder.jpg"
          }
          alt={product.name}
          fill
          className="
            object-cover
            transition
            duration-700
            group-hover:scale-105
          "
        />

        {discount && (
          <div
            className="
              absolute
              top-3
              left-3
              bg-black
              text-white
              text-xs
              px-3
              py-1
              rounded-full
            "
          >
            SALE
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="text-xs uppercase tracking-[2px] text-neutral-400 mb-2">
          {product.productCat}
        </p>

        <h3
          className="
            text-base
            font-medium
            text-neutral-900
            line-clamp-2
            min-h-[48px]
          "
        >
          {product.name}
        </h3>

        <div className="mt-3 flex items-center gap-2">
          {discount ? (
            <>
              <span className="font-semibold text-lg">
                ₹{product.discountPrice}
              </span>

              <span className="text-neutral-400 line-through text-sm">
                ₹{product.price}
              </span>
            </>
          ) : (
            <span className="font-semibold text-lg">
              ₹{product.price}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${product.stockStatus === "in_stock"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                }`}
            >
              {product.stockStatus === "in_stock"
                ? "In Stock"
                : "Out of Stock"}
            </span>

            {product.hasVariants && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                Variants
              </span>
            )}
          </div>

         {!product.hasVariants && (
  <div
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
    }}
  >
    <CartButtonAdd
      cartProduct={cartProduct}
    />
  </div>
)}
        </div>
      </div>
    </div>
  );
}