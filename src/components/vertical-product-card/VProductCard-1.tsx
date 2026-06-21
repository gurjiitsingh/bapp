"use client";

import { useEffect, useMemo } from "react";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { ProductType } from "@/lib/types/productType";
import { addOnType } from "@/lib/types/addOnType";
import { cartProductType } from "@/lib/types/cartDataType";
import { formatCurrencyNumber } from "@/utils/formatCurrency";
import CartButtonAdd from "../AddToCart/CartButtonAdd";
import Image from "next/image";
import { useState } from "react";
import type { TnewModifierItemSchema } from "@/lib/types/modifierItemType";
import { IoClose } from "react-icons/io5";
export default function ProductCardHorizontical({
  product,
  variants,
  allAddOns,
  modifierGroups,
  productModifiers,
}: {
  product: ProductType;
  variants: ProductType[];
  allAddOns: addOnType[];
  modifierGroups: any[];
  productModifiers: any[];

}) {

  type ModifierItem = TnewModifierItemSchema & {
  id: string;
};
  const { settings } = UseSiteContext();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductType | null>(null);

  const [selectedModifiers, setSelectedModifiers] = useState<{
    [groupId: string]: any[];
  }>({});



  const shouldOpenPopup =
    product.hasVariants || product.hasModifier;

    


  const [simpleNoteOpen, setSimpleNoteOpen] = useState(false);


  const [popupNote, setPopupNote] = useState("");
  const [quickNote, setQuickNote] = useState("");

  //  FILTER VARIANTS FOR THIS PRODUCT
  const productVariants = useMemo(() => {
    if (!product.hasVariants) return [];
    return variants
      .filter((v) => v.parentId === product.id)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [product.id, product.hasVariants, variants]);
  const [modifiersLoaded, setModifiersLoaded] = useState(false);

  const productGroupIds = useMemo(() => {
    return productModifiers
      .filter((pm) => pm.productId === product.id)
      .map((pm) => pm.groupId);
  }, [product.id, productModifiers]);

  const productModifierGroups = useMemo(() => {
    return modifierGroups.filter((g) =>
      productGroupIds.includes(g.group.id)
    );
  }, [modifierGroups, productGroupIds]);

  useEffect(() => {
    if (!productModifierGroups.length) return;

    console.log("🍕 Product:", product.name);
    console.log("🔥 FULL GROUPS:", productModifierGroups);
  }, [productModifierGroups]);



  useEffect(() => {
    if (isOpen) {
      setSelectedModifiers({});
      setPopupNote(""); // ✅ reset properly

      if (productVariants.length > 0) {
        setSelectedVariant(productVariants[0]);
      }
    }
  }, [isOpen]);

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
    uniqueKey:
      product.id.toString() +
      "_" +
      (quickNote?.trim() || ""),
    note: quickNote,
    quantity: 1,
    currentStock: product.currentStock!,
    price: priceTarget,
    basePrice: priceTarget,
    name: product.name,
    image: product.image,
    categoryId: product.categoryId,
    productCat: product.productCat!,
    taxRate: product.taxRate,
    taxType: product.taxType,

  };

  const modifiersFlat = Object.values(selectedModifiers).flat();



  const uniqueKey =
    (selectedVariant?.id ?? product.id) +
    "_" +
    modifiersFlat.map((m) => m.id).sort().join("_") +
    "_" +
    (popupNote?.trim() || "");

  useEffect(() => {
    if (isOpen && productVariants.length > 0) {
      setSelectedVariant(productVariants[0]);
    }
  }, [isOpen, productVariants]);

  const selectedProduct = selectedVariant ?? product;

  const modifiersTotal = Object.values(selectedModifiers)
    .flat()
    .reduce((sum, item) => sum + (item.price ?? 0), 0);

  const basePrice = selectedProduct.price ?? 0;

  const finalPrice = basePrice + modifiersTotal;


  const isValidSelection = productModifierGroups.every((groupData) => {
    const selected = selectedModifiers[groupData.group.id] || [];

    return (
      selected.length >= groupData.group.minSelection &&
      selected.length <= groupData.group.maxSelection
    );
  });

  // ---------------- UI ----------------
  return (<>
   <div
  className="
    group
    bg-white
    rounded-[28px]
    overflow-hidden
    border
    border-neutral-100
    hover:shadow-xl
    transition-all
    duration-300
  "
>
  {/* IMAGE */}
  <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
    <Image
      src={product.image || "/placeholder.jpg"}
      alt={product.name}
      fill
      className="
        object-cover
        transition
        duration-700
        group-hover:scale-105
      "
    />

    {priceDiscounted && (
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

  {/* CONTENT */}
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

    <p className="text-sm text-neutral-500 mt-2 line-clamp-2">
      {product.productDesc}
    </p>

    <div className="mt-4 flex items-center gap-2">
      {priceDiscounted ? (
        <>
          <span className="font-semibold text-lg">
            {priceDiscounted}
          </span>

          <span className="text-neutral-400 line-through text-sm">
            {priceRegular}
          </span>
        </>
      ) : (
        <span className="font-semibold text-lg">
          {priceRegular}
        </span>
      )}
    </div>

    {/* FOOTER */}
    <div className="mt-5 flex items-center justify-between">
      <div className="flex flex-wrap gap-2">
        {product.stockStatus === "in_stock" && (
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
            In Stock
          </span>
        )}

        {product.hasVariants && (
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
            Variants
          </span>
        )}

        {product.hasModifier && (
          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
            Options
          </span>
        )}
      </div>

      {shouldOpenPopup ? (
        <button
          onClick={() => setIsOpen(true)}
          className="
            h-10
            px-5
            rounded-full
            bg-[#00897b]
            text-white
            text-sm
            font-medium
            hover:opacity-90
          "
        >
          Customize
        </button>
      ) : (
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <CartButtonAdd
            cartProduct={{
              ...cartProduct,
              note: "",
              uniqueKey: product.id.toString(),
            }}
          />
        </div>
      )}
    </div>
  </div>
</div>

    {isOpen && (
      <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-0 rounded-xl">

        <div className="bg-white w-[400px] max-full ">

          <div className="bg-white w-[400px] max-h-[75vh] overflow-y-auto rounded-xl p-4 pb-2">
            <h2 className="text-lg font-bold mb-3">{product.name}</h2>

            {/* VARIANTS */}
            {productVariants.map((variant) => (
              <label
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`flex justify-between items-center p-2 rounded cursor-pointer ${selectedVariant?.id === variant.id ? "bg-gray-100" : ""
                  }`}
              >

                <div className="flex gap-2">
                  <input
                    type="radio"
                    name="size"
                    checked={selectedVariant?.id === variant.id}
                    onChange={() => setSelectedVariant(variant)}
                  />

                  <span>{variant.name}</span>
                </div>

                <span className="text-sm text-gray-600">
                  {formatCurrencyNumber(
                    variant.price ?? 0,
                    //  settings.currency,
                    //  settings.locale
                  )}
                </span>
              </label>
            ))}

            {/* ✅ MODIFIERS HERE (INSIDE POPUP) */}
            {productModifierGroups.length > 0 && (
              <div className="mb-4">
                {productModifierGroups.map((groupData) => (
                  <div key={groupData.group.id} className="mb-3">

                    <p className="font-semibold">
                      {groupData.group.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      Min: {groupData.group.minSelection} | Max: {groupData.group.maxSelection}
                    </p>

                  {groupData.items.map((item: ModifierItem) => {
                      const selectedItems = selectedModifiers[groupData.group.id] || [];

                      const isChecked = selectedItems.some((i) => i.id === item.id);

                      const handleChange = () => {
                        setSelectedModifiers((prev) => {
                          const prevItems = prev[groupData.group.id] || [];
                          let updated = [...prevItems];

                          if (groupData.group.maxSelection === 1) {
                            updated = [item];
                          } else {
                            const exists = prevItems.some((i) => i.id === item.id);

                            if (exists) {
                              updated = prevItems.filter((i) => i.id !== item.id);
                            } else if (prevItems.length < groupData.group.maxSelection) {
                              updated.push(item);
                            }
                          }

                          return {
                            ...prev,
                            [groupData.group.id]: updated,
                          };
                        });
                      };

                      return (
                        <label key={item.id} className="flex justify-between items-center py-1">
                          <span>{item.name}</span>

                          <div className="flex items-center gap-2">
                            <span className="text-sm">+{item.price}</span>

                            <input
                              type={groupData.group.maxSelection === 1 ? "radio" : "checkbox"}
                              checked={isChecked}
                              onChange={handleChange}
                            />
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}


          </div>

          <div className="p-4">

            {/* 📝 NOTE INPUT */}
            <div className="p-0">
              <label className="text-sm font-medium text-gray-700 my-1">
                Add Note (optional)
              </label>

              <textarea
                value={popupNote}
                onChange={(e) => setPopupNote(e.target.value)}
                placeholder="e.g. less spicy, no onion..."
                className="w-full mt-1 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                rows={2}
              />
            </div>
            <p className="font-semibold text-right">
              Total: {formatCurrencyNumber(finalPrice)}
            </p>

            <div className="flex items-center justify-between my-2 gap-3">
               <button 
    onClick={() => setIsOpen(false)}
    className="p-2 rounded-lg bg-gray-200 hover:bg-gray-100"
  >
    <IoClose size={20} />
  </button>

              <div className="">
                <CartButtonAdd
                  cartProduct={{
                    id: selectedVariant?.id ?? product.id,
                    uniqueKey: uniqueKey,
                    price: finalPrice,
                    basePrice: selectedVariant?.price ?? product.price ?? 0,
                    name: selectedVariant?.name ?? product.name,

                    quantity: 1,
                    currentStock: selectedVariant?.currentStock?? product.currentStock!,

                    image: product.image,
                    categoryId: product.categoryId,
                    productCat: product.productCat!,

                    taxRate: selectedProduct.taxRate,
                    taxType: selectedProduct.taxType,

                    parentProductId: product.id,

                    modifiers: Object.values(selectedModifiers).flat(),

                    note: popupNote,
                  }}
                />
              </div>


            </div>


          </div>
        </div>
      </div >
    )
    }

    {
      simpleNoteOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-[350px] rounded-xl p-5 shadow-lg">

            {/* Title */}
            <h2 className="font-semibold text-lg mb-3 text-gray-800">
              {product.name}
            </h2>

            {/* Textarea */}
            <textarea
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              placeholder="e.g. no onion, less spicy..."
              className="w-full border border-gray-300 rounded-lg p-2 h-24 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />

            {/* Buttons */}

            <div className="flex justify-between items-center mt-5 gap-3">
              {/* Cancel */}
              <button
                onClick={() => { setSimpleNoteOpen(false); setQuickNote(""); }}
                className=" border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                <IoClose />
              </button>

              {/* Add to cart */}
              <div className="">
                <CartButtonAdd
                  cartProduct={{
                    ...cartProduct,
                    note: quickNote,
                    uniqueKey: product.id.toString() + "_" + quickNote,
                  }}
                />
              </div>


            </div>
          </div>
        </div>
      )
    }




  </>
  );
}
