"use client";

import { deleteOrderMasterRec } from "@/app/(universal)/action/orders/dbOperations";
import { TableCell, TableRow } from "@/components/ui/table";
import { orderMasterDataT } from "@/lib/types/orderMasterType";
import Link from "next/link";
import { MdDeleteForever } from "react-icons/md";
import { useLanguage } from "@/store/LanguageContext";
import { formatCurrencyNumber } from "@/utils/formatCurrency";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { formatDateUTC } from "@/utils/formatDateUTC";

function TableRows({ order }: { order: orderMasterDataT }) {
  const { TEXT } = useLanguage();
  const { settings } = UseSiteContext();
  const flatDiscount = formatCurrencyNumber(
    Number(order.flatDiscount) ?? 0,
    (settings.currency || "EUR") as string,
    (settings.locale || "de-DE") as string
  );
  const endTotalG = formatCurrencyNumber(
    Number(order.endTotalG) ?? 0,
    (settings.currency || "EUR") as string,
    (settings.locale || "de-DE") as string
  );

  async function handleDelete(id: string) {
    if (confirm(TEXT.confirm_delete_order)) {
      try {
        await deleteOrderMasterRec(id);
        // Optionally: add toast or refresh logic
      } catch (err) {
        console.error(TEXT.error_delete_failed, err);
      }
    }
  }

  return (
    <TableRow className="bg-white dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-zinc-700 transition duration-200">
      <TableCell>
        <Link
          href={{
            pathname: `/admin/orders/order-detail`,
            query: {
              masterId: order.id,
              userId: order.userId,
              addressId: order.addressId,
            },
          }}
          className="border border-gray-500 hover:bg-amber-300 dark:bg-amber-900 dark:hover:bg-amber-700 text-amber-800 dark:text-white px-3 py-1 rounded-full text-xs font-semibold transition"
        >
          #{order.srno}
        </Link>
         <Link
          href={{
            pathname: `/admin/orders/order-print-auto`,
            query: {
              masterId: order.id,
              userId: order.userId,
              addressId: order.addressId,
            },
          }}
          className="border border-gray-500 hover:bg-amber-300 dark:bg-amber-900 dark:hover:bg-amber-700 text-amber-800 dark:text-white px-3 py-1 rounded-full text-xs font-semibold transition"
        >
          Print
        </Link>
      </TableCell>

      <TableCell className="text-gray-800 dark:text-zinc-200">
        {order.customerName}
      </TableCell>

      <TableCell className="text-gray-600 dark:text-zinc-400 text-sm">
        {/* {order.time} */}
        {formatDateUTC(
    order.createdAtUTC,
    String(settings.locale) || process.env.NEXT_PUBLIC_DEFAULT_LOCALE
  ) || order.time}
{/* {formatDateUTC(order.createdAtUTC, settings.locale as string || "de-DE")} */}
      </TableCell>


      <TableCell>
        <span
          className={`px-2 py-1 text-xs rounded-full font-semibold ${
            order.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : order.status === "Completed"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {order.status}
        </span>
      </TableCell>

      <TableCell className="font-medium text-gray-900 dark:text-zinc-100">
        {endTotalG}
      </TableCell>

      <TableCell className="text-sm text-gray-600 dark:text-zinc-400">
        {order.paymentType}
      </TableCell>

      <TableCell className="text-sm text-gray-600 dark:text-zinc-400">
        {order.couponCode}
      </TableCell>

      <TableCell className="text-sm text-gray-600">
        {order.totalDiscountG}%
      </TableCell>

      <TableCell className="text-sm text-gray-600">{flatDiscount}</TableCell>

      <TableCell>
        <button
          onClick={() => handleDelete(order.id)}
          className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition"
          aria-label="Delete Order"
        >
          <MdDeleteForever size={18} className="text-white" />
        </button>
      </TableCell>
    </TableRow>
  );
}

export default TableRows;
