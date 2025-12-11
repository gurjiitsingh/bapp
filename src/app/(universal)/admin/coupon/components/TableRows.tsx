"use client";

import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MdDeleteForever } from "react-icons/md";
import { PiExcludeSquareDuotone } from "react-icons/pi";
import Link from "next/link";
import { CiEdit } from "react-icons/ci";
import { deletecoupon } from "@/app/(universal)/action/coupon/dbOperation";
import { couponType } from "@/lib/types/couponType";
import { useLanguage } from "@/store/LanguageContext";

function TableRows({ coupon }: { coupon: couponType }) {
  const { TEXT } = useLanguage();

  async function handleDelete(coupon: couponType) {
    const confirmDelete = confirm(TEXT.confirm_delete_coupon || "Are you sure you want to delete the coupon?\nIf yes, click OK.\nIf not, click Cancel.");
    if (confirmDelete) {
      await deletecoupon(coupon.id!);
      location.reload(); // consider using state in the future for a better UX
    }
  }

  return (
    <TableRow className="whitespace-nowrap hover:bg-green-50 dark:hover:bg-zinc-800 transition rounded-xl">
      <TableCell>{coupon.code}</TableCell>

      <TableCell>
        {coupon.discountType === "flat"
          ? `${TEXT.discount_type_flat || "Flat"} €${coupon.discount}`
          : `${TEXT.discount_type_percent || "Percent"} %${coupon.discount}`}
      </TableCell>

      <TableCell>€{coupon.minSpend}</TableCell>

      <TableCell>{coupon.expiry}</TableCell>

      <TableCell>
        {coupon.createdAt ? coupon.createdAt.toLocaleDateString() : TEXT.fallback_dash || "—"}
      </TableCell>

      <TableCell>
        <Link
          href={{
            pathname: "/admin/coupon/editform",
            query: { id: coupon.id },
          }}
        >
          <Button
            size="icon"
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <CiEdit size={18} />
          </Button>
        </Link>
      </TableCell>

      <TableCell>
        <Link
          href={{
            pathname: "/admin/coupon/exclude-categories",
            query: { id: coupon.id },
          }}
        >
          <Button
            size="icon"
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            <PiExcludeSquareDuotone size={18} />
          </Button>
        </Link>
      </TableCell>

      <TableCell>{coupon.message || TEXT.fallback_dash || "—"}</TableCell>

      <TableCell>
        <Button
          onClick={() => handleDelete(coupon)}
          size="icon"
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <MdDeleteForever size={18} />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default TableRows;
