"use client";

import React, { useEffect, useState } from "react";
import {
  fetchOrderMasterById,
  fetchOrderProductsByOrderMasterId,
} from "@/app/(universal)/action/orders/dbOperations";
import { searchAddressByAddressId } from "@/app/(universal)/action/address/dbOperations";
import { useSearchParams } from "next/navigation";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { OrderProductT } from "@/lib/types/orderType";
import { orderMasterDataT } from "@/lib/types/orderMasterType";
import { addressResT } from "@/lib/types/addressType";
import { formatCurrencyNumber } from "@/utils/formatCurrency";
export type orderMasterDataSafeT = Omit<orderMasterDataT, "createdAt"> & {
  createdAt: string;
};
export default function PrintOrderPage() {
  const searchParams = useSearchParams();
  const masterOrderId = searchParams.get("masterId") as string;
  const addressId = searchParams.get("addressId") as string;

  const [orderProducts, setOrderProducts] = useState<OrderProductT[]>([]);
  const [customerAddress, setCustomerAddress] = useState<addressResT>();
  //const [orderMasterData, setOrderMasterData] = useState<orderMasterDataT | null>(null);
    const [orderMasterData, setOrderMasterData] =
    useState<orderMasterDataSafeT | null>(null);
  const { settings } = UseSiteContext();

  useEffect(() => {
    async function loadOrder() {
      if (!masterOrderId || !addressId) return;
      const [products, address, orderMaster] = await Promise.all([
        fetchOrderProductsByOrderMasterId(masterOrderId),
        searchAddressByAddressId(addressId),
        fetchOrderMasterById(masterOrderId),
      ]);
      setOrderProducts(products);
      setCustomerAddress(address);
      setOrderMasterData(orderMaster);
    }
    loadOrder();
  }, [masterOrderId, addressId]);

  // Auto-print when data is ready
  useEffect(() => {
    if (orderProducts.length > 0 && orderMasterData) {
      const timer = setTimeout(() => window.print(), 300);
      return () => clearTimeout(timer);
    }
  }, [orderProducts, orderMasterData]);

  const formatCurrency = (value: number) =>
    formatCurrencyNumber(
      value ?? 0,
      (settings.currency || "EUR") as string,
      (settings.locale || "de-DE") as string
    );

  const grandTotal = formatCurrency(Number(orderMasterData?.grandTotal ?? 0));
  const itemTotal = formatCurrency(Number(orderMasterData?.itemTotal ?? 0));
  const deliveryFee = formatCurrency(Number(orderMasterData?.deliveryFee ?? 0));
  const pickUpDiscount = formatCurrency(Number(orderMasterData?.pickUpDiscount ?? 0));
  const couponFlat = formatCurrency(Number(orderMasterData?.couponFlat ?? 0));
  const couponPercent = formatCurrency(Number(orderMasterData?.couponPercent ?? 0));

  return (
    <div className="p-2">
      {/* Header */}
      <div className="text-center border-b border-black pb-2 mb-2">
        <h1 className="text-lg font-bold">ORDER RECEIPT</h1>
        <p>Order No: {orderMasterData?.srno}</p>
        {/* <p>Date: {orderMasterData?.time}</p> */}
      </div>

      {/* Customer Info */}
      <div className="mb-2">
        <p><strong>Name:</strong> {customerAddress?.firstName} {customerAddress?.lastName}</p>
        <p><strong>Phone:</strong> {customerAddress?.mobNo}</p>
        <p><strong>Email:</strong> {customerAddress?.email}</p>
        <p>{customerAddress?.addressLine1} {customerAddress?.addressLine2}</p>
        <p>{customerAddress?.city} {customerAddress?.state} {customerAddress?.zipCode}</p>
      </div>

      {/* Products */}
      <div className="border-t border-b border-black py-1 mb-2">
        <div className="flex justify-between font-bold border-b border-black pb-1">
          <span className="w-1/2">Item</span>
          <span className="w-1/6 text-right">Qty</span>
          <span className="w-1/6 text-right">Price</span>
          <span className="w-1/6 text-right">Total</span>
        </div>
        {orderProducts.map((item) => {
          const total = formatCurrency(Number(item.quantity) * Number(item.price));
          const price = formatCurrency(Number(item.price));
          return (
            <div key={item.id} className="flex justify-between py-0.5">
              <span className="w-1/2 truncate">{item.name}</span>
              <span className="w-1/6 text-right">{item.quantity}</span>
              <span className="w-1/6 text-right">{price}</span>
              <span className="w-1/6 text-right">{total}</span>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="text-right mb-2">
        <p>Item Total: {itemTotal}</p>
        <p>Delivery: {deliveryFee}</p>
        <p>Pickup Discount: {pickUpDiscount}</p>
        <p>Coupon Flat: {couponFlat}</p>
        <p>Coupon %: {couponPercent}</p>
        <p className="font-bold border-t border-black pt-1 mt-1">
          Grand Total: {grandTotal}
        </p>
      </div>

      <p className="text-center text-xs mt-2">Thank you for your order!</p>

      {/* Print-specific styles */}
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
