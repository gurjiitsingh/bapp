"use client";

import React from "react";

import { UseSiteContext } from "@/SiteContext/SiteContext";
import { formatCurrencyNumber } from "@/utils/formatCurrency";

interface OrderInfoProps {
  srno?: string;
  createdAt?: string;

  subTotal?: string;
  taxTotal?: string;
  discountTotal?: string;
  deliveryFee?: string;
  grandTotal?: string;

  paymentMode?: string;
  paymentStatus?: string;
  orderStatus?: string;

  email?: string;
  notes?: string;
}

export default function OrderInfo({
  srno,
  createdAt,

  subTotal,
  taxTotal,
  discountTotal,
  deliveryFee,
  grandTotal,

  paymentMode,
  paymentStatus,
  orderStatus,

  email,
  notes,
}: OrderInfoProps) {
  const { settings } = UseSiteContext();

  const currency =
    typeof settings.currency === "string"
      ? settings.currency
      : "EUR";

  const locale =
    typeof settings.locale === "string"
      ? settings.locale
      : "de-DE";

  console.log(
    "OrderInfo currency/locale:",
    currency,
    locale
  );

  const formattedSubTotal = formatCurrencyNumber(
    Number(subTotal) || 0,
    currency,
    locale
  );

  const formattedTaxTotal = formatCurrencyNumber(
    Number(taxTotal) || 0,
    currency,
    locale
  );

  const formattedDiscountTotal = formatCurrencyNumber(
    Number(discountTotal) || 0,
    currency,
    locale
  );

  const formattedDeliveryFee = formatCurrencyNumber(
    Number(deliveryFee) || 0,
    currency,
    locale
  );

  const formattedGrandTotal = formatCurrencyNumber(
    Number(grandTotal) || 0,
    currency,
    locale
  );

  return (
    <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      {/* SUMMARY HEADER */}
      <div className="mb-5 flex items-start justify-between">

        <div>
          <h2 className="text-sm font-bold text-slate-800">
            Order Information
          </h2>

          <p className="mt-0.5 text-xs text-slate-400">
            Order master details and payment information
          </p>
        </div>

        <div className="text-right">
          {srno && (
            <>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Order No.
              </div>

              <div className="mt-0.5 text-sm font-bold text-indigo-600">
                {srno}
              </div>
            </>
          )}
        </div>

      </div>

      {/* ORDER STATUS */}
      <div className="mb-5 flex flex-wrap gap-2">

        {orderStatus && (
          <span
            className="
              rounded-full
              bg-blue-50
              px-3
              py-1.5
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-blue-600
            "
          >
            Order: {orderStatus}
          </span>
        )}

        {paymentStatus && (
          <span
            className="
              rounded-full
              bg-emerald-50
              px-3
              py-1.5
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-emerald-600
            "
          >
            Payment: {paymentStatus}
          </span>
        )}

        {paymentMode && (
          <span
            className="
              rounded-full
              bg-slate-100
              px-3
              py-1.5
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-slate-600
            "
          >
            {paymentMode}
          </span>
        )}

      </div>

      {/* ORDER DETAILS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* CREATED */}
        {createdAt && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Order Date
            </div>

            <div className="mt-1 text-sm font-semibold text-slate-700">
              {createdAt}
            </div>
          </div>
        )}

        {/* EMAIL */}
        {email && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Email
            </div>

            <div className="mt-1 truncate text-sm font-medium text-slate-700">
              {email}
            </div>
          </div>
        )}

        {/* PAYMENT MODE */}
        {paymentMode && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Payment Mode
            </div>

            <div className="mt-1 text-sm font-semibold text-slate-700">
              {paymentMode}
            </div>
          </div>
        )}

        {/* ORDER STATUS */}
        {orderStatus && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Order Status
            </div>

            <div className="mt-1 text-sm font-semibold text-slate-700">
              {orderStatus}
            </div>
          </div>
        )}

      </div>

      {/* NOTES */}
      {notes && (
        <div className="mt-5 border-t border-slate-100 pt-4">

          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Notes
          </div>

          <div className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {notes}
          </div>

        </div>
      )}

      {/* TOTALS */}
      <div className="mt-5 border-t border-slate-100 pt-5">

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

          {/* SUBTOTAL */}
          <div className="rounded-xl bg-slate-50 p-3">

            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Subtotal
            </div>

            <div className="mt-1 text-sm font-bold text-slate-800">
              {formattedSubTotal}
            </div>

          </div>

          {/* TAX */}
          <div className="rounded-xl bg-slate-50 p-3">

            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Tax
            </div>

            <div className="mt-1 text-sm font-bold text-slate-800">
              {formattedTaxTotal}
            </div>

          </div>

          {/* DISCOUNT */}
          <div className="rounded-xl bg-slate-50 p-3">

            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Discount
            </div>

            <div className="mt-1 text-sm font-bold text-slate-800">
              {formattedDiscountTotal}
            </div>

          </div>

          {/* DELIVERY */}
          <div className="rounded-xl bg-slate-50 p-3">

            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Delivery
            </div>

            <div className="mt-1 text-sm font-bold text-slate-800">
              {formattedDeliveryFee}
            </div>

          </div>

          {/* GRAND TOTAL */}
          <div className="rounded-xl bg-indigo-50 p-3">

            <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-500">
              Grand Total
            </div>

            <div className="mt-1 text-base font-bold text-indigo-700">
              {formattedGrandTotal}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}