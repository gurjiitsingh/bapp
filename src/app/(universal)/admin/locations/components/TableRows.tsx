"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MdDeleteForever } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import Link from "next/link";

import { locationType } from "@/lib/types/locationType";
import { deleteLocation } from "@/app/(universal)/action/location/dbOperation";
import { useLanguage } from "@/store/LanguageContext";
import { formatCurrencyNumber } from "@/utils/formatCurrency";
import { UseSiteContext } from "@/SiteContext/SiteContext";

function TableRows({ location }: { location: locationType }) {
  const { TEXT } = useLanguage();
  const { settings } = UseSiteContext();

  async function handleDelete(loc: locationType) {
    const confirmDelete = confirm(TEXT.confirm_delete_delivery);
    if (confirmDelete) {
      await deleteLocation(loc.id!);
      window.location.reload();
    }
  }

  // const cost = formatCurrencyNumber(
  //   Number(location.deliveryFee) ?? 0,
  //   settings.currency,
  //   settings.locale
  // );

  // const minSpend = formatCurrencyNumber(
  //   Number(location.minSpend) ?? 0,
  //   settings.currency,
  //   settings.locale
  // );

  return (
    <TableRow className="whitespace-nowrap hover:bg-green-50 dark:hover:bg-zinc-800 transition rounded-xl">
      <TableCell className="font-medium">
        {location.name}
      </TableCell>

      <TableCell className="hidden md:table-cell">
        {location.city}
      </TableCell>

      <TableCell className="hidden md:table-cell">
        {location.state}
      </TableCell>

      <TableCell>{location.deliveryFee}</TableCell>
      <TableCell>{location.minSpend}</TableCell>

      <TableCell>
        {location.deliveryDistance ?? "-"}
      </TableCell>

      <TableCell className="hidden md:table-cell">
        {location.notes ?? ""}
      </TableCell>

      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Link
            href={{
              pathname: "/admin/locations/editform",
              query: { id: location.id },
            }}
          >
            <Button
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 px-2 py-1"
            >
              <CiEdit size={18} className="text-white" />
            </Button>
          </Link>

          <Button
            onClick={() => handleDelete(location)}
            size="sm"
            className="bg-red-600 hover:bg-red-700 px-2 py-1"
          >
            <MdDeleteForever size={18} className="text-white" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default TableRows;
