"use client";

import React, { useEffect, useState } from "react";
import {
  fetchOrderMasterById,
  fetchOrderProductsByOrderMasterId,
} from "@/app/(universal)/action/orders/dbOperations";

import { useSearchParams } from "next/navigation";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { OrderProductT } from "@/lib/types/orderType";
import { orderMasterDataT } from "@/lib/types/orderMasterType";
import { formatCurrencyNumber } from "@/utils/formatCurrency";
export type orderMasterDataSafeT = Omit<orderMasterDataT, "createdAt"> & {
  createdAt: string;
};

export default function POSPrintOrderPage() {
  const searchParams = useSearchParams();
  const masterOrderId = searchParams.get("orderId") as string;

  const [orderProducts, setOrderProducts] = useState<OrderProductT[]>([]);
   const [orderMasterData, setOrderMasterData] =
    useState<orderMasterDataSafeT | null>(null);

  const { settings } = UseSiteContext();

  useEffect(() => {
    async function loadOrder() {
      if (!masterOrderId) return;

      const [products, orderMaster] = await Promise.all([
        fetchOrderProductsByOrderMasterId(masterOrderId),
        fetchOrderMasterById(masterOrderId),
      ]);

    
      setOrderProducts(products);
      setOrderMasterData(orderMaster);
    }

    loadOrder();
  }, [masterOrderId]);

  // Auto print
  useEffect(() => {
    if (orderProducts.length > 0 && orderMasterData) {
      setTimeout(() => window.print(), 300);
    }
  }, [orderProducts, orderMasterData]);

  const formatMoney = (value: number) =>
    formatCurrencyNumber(
      value ?? 0,
      settings.currency as string,
      settings.locale as string
    );

  const totalTax = formatMoney(Number(orderMasterData?.taxTotal ?? 0));
  const itemTotal = formatMoney(Number(orderMasterData?.itemTotal ?? 0));
  const grandTotal = formatMoney(Number(orderMasterData?.grandTotal ?? 0));

  return (
    <div className="p-3 bg-white text-black font-mono text-[12px] print:p-0">
      {/* HEADER */}
      <div className="text-center border-b border-black pb-2 mb-2">
        <h1 className="font-bold text-[16px]">RECEIPT</h1>
        <p>Order #{orderMasterData?.srno}</p>
        {/* <p>{orderMasterData?.time}</p> */}
      </div>

      {/* ITEMS */}
      <div className="border-t border-b border-black py-1 mb-2">
        <div className="flex justify-between font-bold border-b border-black pb-1">
          <span className="w-2/5">Item</span>
          <span className="w-1/5 text-right">Qty</span>
          <span className="w-1/5 text-right">Tax</span>
          <span className="w-1/5 text-right">Total</span>
        </div>

        {orderProducts.map((p) => (
          <div key={p.id} className="flex justify-between py-0.5">
            <span className="w-2/5 truncate">{p.name}</span>
            <span className="w-1/5 text-right">{p.quantity}</span>
            <span className="w-1/5 text-right">
              {formatMoney(Number(p.taxAmount))}
            </span>
            <span className="w-1/5 text-right">
              {formatMoney(Number(p.finalTotal))}
            </span>
          </div>
        ))}
      </div>

      {/* TOTALS */}
      <div className="text-right text-[12px]">
        <p>Item Total: {itemTotal}</p>
        <p>Total Tax: {totalTax}</p>

        <p className="font-bold border-t border-black pt-1 mt-1">
          Grand Total: {grandTotal}
        </p>
      </div>

      <p className="text-center text-xs mt-3">Thank you!</p>

      {/* PRINT STYLES */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          * {
            font-size: 12px !important;
            line-height: 1.2 !important;
          }
        }
      `}</style>
    </div>
  );
}
