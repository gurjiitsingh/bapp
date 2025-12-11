import React from "react";
import { formatCurrencyNumber } from "@/utils/formatCurrency";
import { UseSiteContext } from "@/SiteContext/SiteContext";

type TRow = {
  month: string;
  orderCount: number;
  totalSales: number; // assuming your row has totalSales
};

type TableRowProps = {
  row: TRow;
};

export default function TableRows({ row }: TableRowProps) {
  const { settings } = UseSiteContext();

  const amount = formatCurrencyNumber(
    Number(row.totalSales) ?? 0,
    settings.currency as string,
    settings.locale as string
  );

  return (
    <tr className="hover:bg-gray-50">
      <td className="border px-4 py-2">{row.month}</td>
      <td className="border px-4 py-2">{row.orderCount}</td>
      <td className="border px-4 py-2">{amount}</td>
    </tr>
  );
}
