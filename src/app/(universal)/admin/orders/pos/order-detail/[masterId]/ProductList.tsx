"use client";

import React from "react";

import { UseSiteContext } from "@/SiteContext/SiteContext";
import { formatCurrencyNumber } from "@/utils/formatCurrency";

import { OrderProductT } from "@/lib/types/orderType";

interface ProductListProps {
  item: OrderProductT;
}

const ProductList: React.FC<ProductListProps> = ({
  item,
}) => {
  const { settings } = UseSiteContext();

const currency =
  typeof settings.currency === "string"
    ? settings.currency
    : "EUR";

const locale =
  typeof settings.locale === "string"
    ? settings.locale
    : "de-DE";

  const quantity =
    Number(item.quantity) || 0;

  const price =
    Number(item.basePrice) || 0;

  const itemSubtotal =
    Number(item.itemSubtotal) || 0;

  const taxAmount =
    Number(item.taxTotal) || 0;

  const finalTotal =
    Number(item.finalTotal) || 0;

  const taxRate =
    Number(item.taxRate) || 0;

    

  const formattedPrice =
    formatCurrencyNumber(
      price,
      currency,
      locale
    );

  const formattedSubtotal =
    formatCurrencyNumber(
      itemSubtotal,
      currency,
      locale
    );

  const formattedTax =
    formatCurrencyNumber(
      taxAmount,
      currency,
      locale
    );

  const formattedFinalTotal =
    formatCurrencyNumber(
      finalTotal,
      currency,
      locale
    );

  const modifiers =
    Array.isArray(item.modifiers)
      ? item.modifiers
      : [];

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <div className="min-w-[850px] px-4 py-4">
        <div className="grid grid-cols-[minmax(280px,1fr)_70px_110px_120px_110px_130px] items-start gap-4">
          
          {/* PRODUCT */}
          <div className="min-w-0">
            <div className="font-semibold text-slate-900">
              {item.name || "Unnamed Product"}
            </div>

            {item.productDesc && (
              <div className="mt-1 text-xs leading-5 text-slate-500">
                {item.productDesc}
              </div>
            )}

            {/* NOTE */}
            {item.note && (
              <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700">
                <span className="font-semibold">
                  Note:
                </span>

                <span className="min-w-0">
                  {item.note}
                </span>
              </div>
            )}

            {/* MODIFIERS */}
            {modifiers.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {modifiers.map(
                  (modifier, index) => {
                    const modifierPrice =
                      Number(
                        modifier.price
                      ) || 0;

                    return (
                      <span
                        key={`${modifier.name}-${index}`}
                        className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600"
                      >
                        {modifier.name}

                        {modifierPrice > 0 && (
                          <span className="ml-1 font-semibold text-slate-800">
                            +
                            {formatCurrencyNumber(
                              modifierPrice,
                              currency,
                              locale
                            )}
                          </span>
                        )}
                      </span>
                    );
                  }
                )}
              </div>
            )}

            {/* TAX TYPE */}
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                Tax {taxRate}%
              </span>

              <span className="rounded-md bg-slate-50 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                {item.taxType || "exclusive"}
              </span>
            </div>
          </div>

          {/* QUANTITY */}
          <div className="text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Qty
            </div>

            <div className="mt-1 text-sm font-semibold text-slate-800">
              {quantity}
            </div>
          </div>

          {/* PRICE */}
          <div className="text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Price
            </div>

            <div className="mt-1 text-sm font-medium text-slate-700">
              {formattedPrice}
            </div>
          </div>

          {/* SUBTOTAL */}
          <div className="text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Subtotal
            </div>

            <div className="mt-1 text-sm font-medium text-slate-700">
              {formattedSubtotal}
            </div>
          </div>

          {/* TAX */}
          <div className="text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Tax
            </div>

            <div className="mt-1 text-sm font-medium text-slate-700">
              {formattedTax}
            </div>
          </div>

          {/* TOTAL */}
          <div className="text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Total
            </div>

            <div className="mt-1 text-sm font-bold text-slate-900">
              {formattedFinalTotal}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;