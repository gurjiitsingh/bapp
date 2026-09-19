"use client";

import Link from "next/link";
import { MdDeleteForever } from "react-icons/md";
import { Eye } from "lucide-react";

import { deleteOrderMasterRec } from "@/app/(universal)/action/orders/dbOperations";

import {
  TableCell,
  TableRow,
} from "@/components/ui/table";

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
  const { settings } = UseSiteContext();

  const couponFlat = formatCurrencyNumber(
    Number(order.couponFlat) || 0,
    settings.currency as string,
    settings.locale as string
  );

  const grandTotal = formatCurrencyNumber(
    Number(order.grandTotal) || 0,
    settings.currency as string,
    settings.locale as string
  );

  async function handleDelete(id: string) {

    if (
      confirm(
        TEXT.confirm_delete_order
      )
    ) {
      try {

        await deleteOrderMasterRec(id);

      } catch (err) {

        console.error(
          TEXT.error_delete_failed,
          err
        );

      }
    }
  }

  // -----------------------------------------------------
  // Status
  // -----------------------------------------------------

  const status =
    order.orderStatus || "NEW";

  const statusStyle =
    status === "NEW"
      ? "bg-amber-50 text-amber-700 ring-amber-600/20"
      : status === "ACCEPTED"
      ? "bg-blue-50 text-blue-700 ring-blue-600/20"
      : status === "PREPARING"
      ? "bg-violet-50 text-violet-700 ring-violet-600/20"
      : status === "READY"
      ? "bg-cyan-50 text-cyan-700 ring-cyan-600/20"
      : status === "COMPLETED"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
      : status === "CANCELLED"
      ? "bg-red-50 text-red-700 ring-red-600/20"
      : "bg-slate-100 text-slate-600 ring-slate-500/20";

  // -----------------------------------------------------
  // Payment
  // -----------------------------------------------------

  const payment =
    order.paymentMode || "—";

  const paymentStyle =
    payment === "CASH"
      ? "bg-emerald-50 text-emerald-700"
      : payment === "CARD"
      ? "bg-blue-50 text-blue-700"
      : payment === "UPI"
      ? "bg-violet-50 text-violet-700"
      : payment === "CREDIT"
      ? "bg-orange-50 text-orange-700"
      : "bg-slate-100 text-slate-600";

  return (
    <TableRow
      className="
        group
        border-b
        border-slate-100
        bg-white
        transition-colors
        hover:bg-slate-50/80
      "
    >

      {/* =================================================
          ORDER
          ================================================= */}

      <TableCell className="px-4 py-4">

        <div className="flex items-center gap-3">

          <div className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-indigo-50
            text-xs
            font-bold
            text-indigo-600
          ">
            #
          </div>

          <div className="min-w-0">

            <div className="font-semibold text-slate-900">
              {order.srno}
            </div>

            <div className="max-w-[130px] truncate text-[10px] text-slate-400">
              {order.id}
            </div>

          </div>

        </div>

      </TableCell>

      {/* =================================================
          CUSTOMER
          ================================================= */}

      <TableCell className="py-4">

        <div className="max-w-[150px]">

          <div className="truncate text-sm font-semibold text-slate-800">
            {order.customerName || "Walk-in Customer"}
          </div>

          {order.customerPhone && (
            <div className="mt-0.5 text-xs text-slate-400">
              {order.customerPhone}
            </div>
          )}

        </div>

      </TableCell>

      {/* =================================================
          SUBMITTED
          ================================================= */}

      <TableCell className="whitespace-nowrap py-4">

        <div className="text-xs font-medium text-slate-700">
          {formatDateTimeStamp(
            order.createdAt as Timestamp,
            String(settings.locale)
          )}
        </div>

      </TableCell>

      {/* =================================================
          SCHEDULED
          ================================================= */}

      <TableCell className="whitespace-nowrap py-4">

        {order.scheduledAt ? (
          <div className="text-xs font-medium text-slate-700">
            {formatDateTimeStamp(
              order.scheduledAt as Timestamp,
              String(settings.locale)
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-400">
            —
          </span>
        )}

      </TableCell>

      {/* =================================================
          TYPE
          ================================================= */}

      <TableCell className="py-4">

        <span className="
          inline-flex
          rounded-md
          bg-slate-100
          px-2.5
          py-1
          text-[11px]
          font-semibold
          text-slate-600
        ">
          {order.orderType || "—"}
        </span>

      </TableCell>

      {/* =================================================
          TABLE
          ================================================= */}

      <TableCell className="py-4">

        {order.tableNo ? (
          <span className="
            inline-flex
            min-w-10
            items-center
            justify-center
            rounded-md
            bg-indigo-50
            px-2.5
            py-1
            text-xs
            font-bold
            text-indigo-600
          ">
            {order.tableNo}
          </span>
        ) : (
          <span className="text-xs text-slate-400">
            —
          </span>
        )}

      </TableCell>

      {/* =================================================
          STATUS
          ================================================= */}

      {/* <TableCell className="py-4">

        <span
          className={`
            inline-flex
            items-center
            rounded-full
            px-2.5
            py-1
            text-[10px]
            font-bold
            uppercase
            tracking-wide
            ring-1
            ring-inset
            ${statusStyle}
          `}
        >
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />

          {status}
        </span>

      </TableCell> */}

      {/* =================================================
          TOTAL
          ================================================= */}

      <TableCell className="py-4 text-right">

        <div className="font-bold text-slate-900">
          {grandTotal}
        </div>

        {order.itemTotal !== undefined && (
          <div className="text-[10px] text-slate-400">
            Items: {order.itemTotal}
          </div>
        )}

      </TableCell>

      {/* =================================================
          PAYMENT
          ================================================= */}

      <TableCell className="py-4">

        <span
          className={`
            inline-flex
            rounded-md
            px-2.5
            py-1
            text-[10px]
            font-bold
            uppercase
            ${paymentStyle}
          `}
        >
          {payment}
        </span>

      </TableCell>

      {/* =================================================
          DISCOUNT
          ================================================= */}

      <TableCell className="py-4">

        {order.discountTotal ||
        order.couponFlat ? (
          <div>

            {order.discountTotal ? (
              <div className="text-xs font-semibold text-emerald-600">
                {order.discountTotal}%
              </div>
            ) : null}

            {order.couponFlat ? (
              <div className="text-[10px] text-slate-400">
                {couponFlat}
              </div>
            ) : null}

          </div>
        ) : (
          <span className="text-xs text-slate-400">
            —
          </span>
        )}

      </TableCell>

      {/* =================================================
          PRINTED
          ================================================= */}

      {/* <TableCell className="py-4">

        {order.printed ? (
          <span className="
            inline-flex
            items-center
            gap-1
            rounded-md
            bg-emerald-50
            px-2
            py-1
            text-[10px]
            font-bold
            text-emerald-600
          ">
            ✓ Printed
          </span>
        ) : (
          <span className="
            inline-flex
            items-center
            rounded-md
            bg-slate-100
            px-2
            py-1
            text-[10px]
            font-semibold
            text-slate-500
          ">
            Not printed
          </span>
        )}

      </TableCell> */}

      {/* =================================================
          ACTION
          ================================================= */}

      <TableCell className="px-4 py-4">

        <div className="flex items-center justify-end gap-2">

          {/* VIEW */}

          <Link
         href={`/admin/orders/pos/order-detail/${order.id}`}

            className="
              inline-flex
              items-center
              gap-1.5
              rounded-lg
              bg-slate-900
              px-3
              py-2
              text-xs
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-indigo-600
              active:scale-[0.97]
            "
          >
            <Eye className="h-3.5 w-3.5" />

            View
          </Link>

          {/* DELETE */}

          {/* <button
            onClick={() =>
              handleDelete(order.id)
            }
            className="
              inline-flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              border
              border-slate-200
              bg-white
              text-slate-400
              transition
              hover:border-red-200
              hover:bg-red-50
              hover:text-red-600
              active:scale-[0.95]
            "
            aria-label="Delete Order"
          >
            <MdDeleteForever size={17} />
          </button> */}

        </div>

      </TableCell>

    </TableRow>
  );
}

export default TableRows;