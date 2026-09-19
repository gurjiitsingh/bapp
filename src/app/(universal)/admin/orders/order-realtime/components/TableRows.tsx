"use client";

import React from "react";
import Link from "next/link";

import {
  TableCell,
  TableRow,
} from "@/components/ui/table";

import {
  Eye,
  Printer,
  Trash2,
} from "lucide-react";

import { deleteOrderMasterRec } from "@/app/(universal)/action/orders/dbOperations";

import { orderMasterDataT } from "@/lib/types/orderMasterType";

import { useLanguage } from "@/store/LanguageContext";

import { formatCurrencyNumber } from "@/utils/formatCurrency";

import { UseSiteContext } from "@/SiteContext/SiteContext";

import { formatDateTimeStamp } from "@/utils/formatDateTimestamp";

import { Timestamp } from "firebase/firestore";

function TableRows({
  order,
}: {
  order: orderMasterDataT;
}) {
  const { TEXT } = useLanguage();

  const { settings } =
    UseSiteContext();

  const currency =
    typeof settings.currency === "string"
      ? settings.currency
      : "EUR";

  const locale =
    typeof settings.locale === "string"
      ? settings.locale
      : "de-DE";

  const couponFlat =
    formatCurrencyNumber(
      Number(order.couponFlat) || 0,
      currency,
      locale
    );

  const grandTotal =
    formatCurrencyNumber(
      Number(order.grandTotal) || 0,
      currency,
      locale
    );

  async function handleDelete(
    id: string
  ) {
    if (
      !confirm(
        TEXT.confirm_delete_order
      )
    ) {
      return;
    }

    try {
      await deleteOrderMasterRec(id);
    } catch (error) {
      console.error(
        TEXT.error_delete_failed,
        error
      );
    }
  }

  const status =
    order.orderStatus || "NEW";

  return (
    <TableRow className="border-b border-slate-100 bg-white transition hover:bg-slate-50">
      {/* ORDER */}
      <TableCell className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Link
            href={{
              pathname:
                "/admin/orders/order-detail",
              query: {
                masterId: order.id,
                userId:
                  order.customerId,
                addressId:
                  order.addressId,
              },
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100"
          >
            <Eye className="h-3.5 w-3.5" />

            #{order.srno}
          </Link>

          {/* <Link
            href={{
              pathname:
                "/admin/orders/order-print-auto",
              query: {
                masterId: order.id,
                customerId:
                  order.customerId,
                addressId:
                  order.addressId,
              },
            }}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            title="Print order"
          >
            <Printer className="h-3.5 w-3.5" />
          </Link> */}
        </div>
      </TableCell>

      {/* CUSTOMER */}
      <TableCell className="px-4 py-4">
        <div className="max-w-[180px] truncate text-sm font-medium text-slate-800">
          {order.customerName ||
            "Guest"}
        </div>

        {order.email && (
          <div className="mt-0.5 max-w-[180px] truncate text-xs text-slate-400">
            {order.email}
          </div>
        )}
      </TableCell>

      {/* SUBMITTED */}
      <TableCell className="px-4 py-4">
        <div className="whitespace-nowrap text-xs text-slate-600">
          {formatDateTimeStamp(
            order.createdAt as Timestamp,
            locale
          )}
        </div>
      </TableCell>

      {/* DELIVERY / PICKUP */}
      <TableCell className="px-4 py-4">
        <div className="text-xs font-medium text-slate-700">
          {order.orderType ||
            "—"}
        </div>

        {order.scheduledAt && (
          <div className="mt-1 whitespace-nowrap text-[11px] text-slate-400">
            {formatDateTimeStamp(
              order.scheduledAt as Timestamp,
              locale
            )}
          </div>
        )}
      </TableCell>

      {/* STATUS */}
      <TableCell className="px-4 py-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
            status === "NEW"
              ? "bg-amber-50 text-amber-700"
              : status === "COMPLETED"
              ? "bg-emerald-50 text-emerald-700"
              : status === "CANCELLED"
              ? "bg-red-50 text-red-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {status}
        </span>
      </TableCell>

      {/* TOTAL */}
      <TableCell className="px-4 py-4 text-right">
        <span className="text-sm font-bold text-slate-900">
          {grandTotal}
        </span>
      </TableCell>

      {/* PAYMENT */}
      <TableCell className="px-4 py-4">
        <span className="rounded-md bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600">
          {order.paymentMode ||
            "—"}
        </span>
      </TableCell>

      {/* COUPON */}
      <TableCell className="px-4 py-4">
        {order.couponCode ? (
          <span className="rounded-md bg-violet-50 px-2 py-1 text-[11px] font-medium text-violet-600">
            {order.couponCode}
          </span>
        ) : (
          <span className="text-xs text-slate-400">
            —
          </span>
        )}
      </TableCell>

      {/* DISCOUNT */}
      <TableCell className="px-4 py-4 text-right">
        <span className="text-xs font-medium text-slate-600">
          {Number(
            order.discountTotal
          ) || 0}
          %
        </span>
      </TableCell>

      {/* FLAT DISCOUNT */}
      <TableCell className="px-4 py-4 text-right">
        <span className="text-xs font-medium text-slate-600">
          {couponFlat}
        </span>
      </TableCell>

      {/* ACTION */}
      {/* <TableCell className="px-4 py-4 text-center">
        <button
          type="button"
          onClick={() =>
            handleDelete(order.id)
          }
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-600"
          aria-label="Delete order"
          title="Delete order"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </TableCell> */}
    </TableRow>
  );
}

export default TableRows;