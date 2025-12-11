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

export default function PrintOrderPage() {
  const searchParams = useSearchParams();
  const masterOrderId = searchParams.get("masterId") as string;
  const addressId = searchParams.get("addressId") as string;

  const [orderProducts, setOrderProducts] = useState<OrderProductT[]>([]);
  const [customerAddress, setCustomerAddress] = useState<addressResT>();
  const [orderMasterData, setOrderMasterData] = useState<orderMasterDataT | null>(null);
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

  // Helper function for currency formatting
  const formatCurrency = (value: number) =>
    formatCurrencyNumber(
      value ?? 0,
      (settings.currency || "EUR") as string,
      (settings.locale || "de-DE") as string
    );

  const handlePrint = () => window.print();

  const endTotal = formatCurrency(Number(orderMasterData?.endTotalG ?? 0));
  const itemTotal = formatCurrency(Number(orderMasterData?.itemTotal ?? 0));
  const deliveryCost = formatCurrency(Number(orderMasterData?.deliveryCost ?? 0));
  const pickUpDiscount = formatCurrency(Number(orderMasterData?.calculatedPickUpDiscountL ?? 0));
  const flatDiscount = formatCurrency(Number(orderMasterData?.flatDiscount ?? 0));
  const couponDiscount = formatCurrency(Number(orderMasterData?.calCouponDiscount ?? 0));

  return (
    <div className="min-h-screen bg-gray-100 p-4 print:p-0">
      <div className="max-w-4xl mx-auto bg-white p-6 shadow-lg rounded-md print:shadow-none print:p-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold">Order Invoice</h1>
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 print:hidden"
          >
            Print
          </button>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Order Info */}
          <div className="border rounded p-4">
            <h2 className="text-xl font-semibold mb-2">Order</h2>
            <p><strong>Sr. No:</strong> {orderMasterData?.srno}</p>
            <p><strong>Date:</strong> {orderMasterData?.time}</p>
            <p><strong>Status:</strong> {orderMasterData?.status}</p>
            <p><strong>Discount Total:</strong> {orderMasterData?.totalDiscountG}%</p>
          </div>

          {/* Calculation Info */}
          <div className="border rounded p-4">
            <h2 className="text-xl font-semibold mb-2">Calculations</h2>
            <p><strong>Item Total:</strong> {itemTotal}</p>
            <p><strong>Delivery Cost:</strong> {deliveryCost}</p>
            <p><strong>Pickup Discount:</strong> {pickUpDiscount}</p>
            <p><strong>Coupon Flat:</strong> {flatDiscount}</p>
            <p><strong>Coupon %:</strong> {couponDiscount}</p>
            <p><strong>Subtotal:</strong> {endTotal}</p>
          </div>

          {/* Customer Address */}
          <div className="border rounded p-4">
            <h2 className="text-xl font-semibold mb-2">Customer</h2>
            <p><strong>Name:</strong> {customerAddress?.firstName} {customerAddress?.lastName}</p>
            <p><strong>Email:</strong> {customerAddress?.email}</p>
            <p><strong>Phone:</strong> {customerAddress?.mobNo}</p>
            <p>{customerAddress?.addressLine1} {customerAddress?.addressLine2}</p>
            <p>{customerAddress?.city} {customerAddress?.state}</p>
            <p>{customerAddress?.zipCode}</p>
          </div>
        </div>

        {/* Product List */}
        <h2 className="text-xl font-bold mb-2">Products</h2>
        <div className="border-t border-b py-2">
          {orderProducts.map((item) => {
            const total = formatCurrency(Number(item.quantity) * Number(item.price));
            const price = formatCurrency(Number(item.price));
            return (
              <div
                key={item.id}
                className="flex justify-between py-2 border-b last:border-b-0"
              >
                <div className="flex-1">{item.name}</div>
                <div className="w-24 text-right">{price}</div>
                <div className="w-12 text-center">{item.quantity}</div>
                <div className="w-24 text-right">{total}</div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Thank you for your order!
        </p>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
            margin: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
