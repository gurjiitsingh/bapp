"use client";

import { useContext, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CartContext from "@/store/CartContext";
import { useLanguage } from "@/store/LanguageContext";
import {
  decreaseProductStock,
  decreaseProductStockFromOrder,
  updateOrderMaster,
} from "@/app/(universal)/action/orders/dbOperations";

const MAINTAIN_STOCK = process.env.NEXT_PUBLIC_MAINTAIN_STOCK === "true";
const SEND_CUSTOMER_EMAIL = process.env.CUSTOMER_EMAIL_CONF === "true";
const SEND_BUSINESS_EMAIL = process.env.BUSINESS_EMAIL_CONF === "true";

export default function OrderComplete() {
  const searchParams = useSearchParams();
  const PaymentType = searchParams.get("paymentType");
  const Paymentstatus = searchParams.get("status");
  const orderId = searchParams.get("orderMasterId");

  const router = useRouter();

  const { TEXT, BRANDING } = useLanguage();
  const { cartData, endTotalG, emptyCart } = useContext(CartContext);

  const id = orderId as string;

  async function updateOrderStatus(status: string) {
    await updateOrderMaster(id, status);
  }

  async function sendOrderConfirmationEmail(email: string) {
    const response = await fetch("/api/order-confirmation-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        subject: "New Order Confirmation",
        items: cartData,
        endTotalG,
      }),
    });
    console.log(response);
  }

  async function createOrder() {
    try {
      let address;
      const result = "success";
      if (typeof window !== "undefined") {
        address = localStorage.getItem("customer_address");
      }
      if (cartData.length) {
        if (address !== undefined && address !== null) {
          const Address = JSON.parse(address);
          const email = Address.email as string;

          if (SEND_CUSTOMER_EMAIL || SEND_BUSINESS_EMAIL) {
            await sendOrderConfirmationEmail(email);
          }
        }

        if (result === "success") {
          if (typeof window !== "undefined") {
            window.localStorage.removeItem("cart_product_data");
            emptyCart();
          }
        }
      }
    } catch (error) {
      console.error("Error in order completion:", error);
    }
  }

  // useEffect(() => {
  //   createOrder();
  //   if (PaymentType === 'paypal' && Paymentstatus === 'success') {
  //     updateOrderStatus('COMPLETED');
  //   }
  //   if (PaymentType === 'paypal' && Paymentstatus === 'fail') {
  //     updateOrderStatus('Payment failed');
  //   }
  //   if (PaymentType === 'stripe' && Paymentstatus === 'success') {
  //     updateOrderStatus('COMPLETED');
  //   }
  //   if (PaymentType === 'stripe' && Paymentstatus === 'fail') {
  //     updateOrderStatus('Payment failed');
  //   }
  // }, []);

  useEffect(() => {
    async function finalizeOrder() {
      await createOrder();

      if (PaymentType === "paypal" && Paymentstatus === "success") {
        await updateOrderStatus("COMPLETED");
        if (MAINTAIN_STOCK) await decreaseProductStockFromOrder(id);
      }
      if (PaymentType === "paypal" && Paymentstatus === "fail") {
        await updateOrderStatus("Payment failed");
      }

      if (PaymentType === "stripe" && Paymentstatus === "success") {
        await updateOrderStatus("COMPLETED");
        if (MAINTAIN_STOCK) await decreaseProductStockFromOrder(id);
      }
      if (PaymentType === "stripe" && Paymentstatus === "fail") {
        await updateOrderStatus("Payment failed");
      }

      // COD / Cash
      if (PaymentType === "cod" || PaymentType === "Barzahlung") {
        await updateOrderStatus("COMPLETED");
        if (MAINTAIN_STOCK) await decreaseProductStockFromOrder(id);
      }
    }

    finalizeOrder();
  }, []);

  return (
    <div className="container bg-slate-100 mp flex rounded-2xl my-9 flex-col w-[90%] lg:w-[50%] mx-auto">
      <div className="flex flex-col gap-6 items-center">
        <div className="text-2xl font-semibold text-center">
          {BRANDING?.order_complete_heading ||
            "Ihre Bestellung ist abgeschlossen"}
        </div>

        <div className="text-lg text-center text-slate-500">
          {BRANDING?.pickup_time || "Abholen: 20–25 Minuten"}
        </div>

        <div className="text-lg text-center text-slate-500">
          {BRANDING?.delivery_time || "Lieferzeit: 40–55 Minuten"}
        </div>

        <div>
          <button
            onClick={() => router.push("/")}
            className="min-w-[200px] mt-5 py-1 text-center primary rounded-2xl text-slate-500 text-[1rem]"
          >
            {TEXT?.shop_more_button || "Mehr einkaufen"}
          </button>
        </div>
      </div>
    </div>
  );
}
