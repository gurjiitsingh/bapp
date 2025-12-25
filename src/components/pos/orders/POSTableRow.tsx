"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { orderMasterDataT } from "@/lib/types/orderMasterType";
import Link from "next/link";
import { MdDeleteForever, MdPrint } from "react-icons/md";
import { deleteOrderMasterRec } from "@/app/(universal)/action/orders/dbOperations";
import { formatCurrencyNumber } from "@/utils/formatCurrency";
import { UseSiteContext } from "@/SiteContext/SiteContext";

export default function POSTableRow({ order }: { order: orderMasterDataT }) {
  const { settings } = UseSiteContext();

  const total = formatCurrencyNumber(
    Number(order.endTotalG) || 0,
    settings.currency as string,
    settings.locale as string
  );

  async function handleDelete(id: string) {
    if (confirm("Delete this order?")) {
      await deleteOrderMasterRec(id);
      window.location.reload();
    }
  }


console.log("orders--------", order)
  return (
    <TableRow className="hover:bg-green-50 transition">
      <TableCell>
        <div className="flex gap-1">
        <Link
         href={{
            pathname: `/pos/orders/order-detail`,
            query: {
              masterId: order.id,
              userId: order.userId,
              addressId: order.addressId,
            }}}
       // href={`/pos/orders/order-detail?orderId=${order.id}`}
          className="p-1 py-1 flex items-center border rounded-full text-sm font-semibold"
        >
          #{order.srno}
        </Link>

 {/* Print */}
      
        <Link
          href={`/pos/print?orderId=${order.id}`}
          className="p-2 w-10 rounded-full  hover:bg-gray-300 transition"
        >
          <MdPrint size={20} />
        
        </Link>
        <div className="flex items-center">
      {order.source}</div>
</div>
      </TableCell>
      

      <TableCell>{order.customerName || "Walk-in"}</TableCell>

      <TableCell>{order.time}</TableCell>

      <TableCell>
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            order.status === "Completed"
              ? "bg-green-200 text-green-800"
              : order.status === "pending"
              ? "bg-yellow-200 text-yellow-800"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {order.status}
        </span>
      </TableCell>

      <TableCell className="font-semibold">{total}</TableCell>

      <TableCell>{order.paymentType}</TableCell>

      <TableCell>{order.printed ? "Yes": "No"}</TableCell>

      {/* Delete */}
      <TableCell>
        <button
          onClick={() => handleDelete(order.id)}
          className="p-2 bg-red-600 hover:bg-red-700 rounded-full text-white"
        >
          <MdDeleteForever size={18} />
        </button>
      </TableCell>
    </TableRow>
  );
}
