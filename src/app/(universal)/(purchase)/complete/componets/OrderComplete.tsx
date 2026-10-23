"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  ArrowRight,
  ShoppingBag,
  PackageCheck,
  ShieldCheck,
  XCircle,
  LoaderCircle,
} from "lucide-react";

import CartContext from "@/store/CartContext";
import { useLanguage } from "@/store/LanguageContext";
import {
  decreaseProductStockFromOrder,
  updateOrderMaster,
} from "@/app/(universal)/action/orders/dbOperations";

const MAINTAIN_STOCK =
  process.env.NEXT_PUBLIC_MAINTAIN_STOCK === "true";

const SEND_CUSTOMER_EMAIL =
  process.env.CUSTOMER_EMAIL_CONF === "true";

const SEND_BUSINESS_EMAIL =
  process.env.BUSINESS_EMAIL_CONF === "true";

type CompletionState = "processing" | "success" | "failed";

export default function OrderComplete() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentType = searchParams.get("paymentType");
  const paymentStatus = searchParams.get("status");
  const orderId = searchParams.get("orderMasterId");

  const { TEXT, BRANDING } = useLanguage();
  const { cartData, endTotalG, emptyCart } = useContext(CartContext);

  const [completionState, setCompletionState] =
    useState<CompletionState>("processing");

  // Prevent duplicate processing when React Strict Mode runs effects twice.
  const hasFinalized = useRef(false);

  async function updateOrderStatus(status: string) {
    if (!orderId) {
      throw new Error("Missing orderMasterId.");
    }

    await updateOrderMaster(orderId, status);
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

    if (!response.ok) {
      throw new Error("Could not send order confirmation email.");
    }
  }

  async function createOrder() {
    try {
      if (cartData.length > 0) {
        const address =
          typeof window !== "undefined"
            ? localStorage.getItem("customer_address")
            : null;

        if (address && (SEND_CUSTOMER_EMAIL || SEND_BUSINESS_EMAIL)) {
          const parsedAddress = JSON.parse(address);
          const email = parsedAddress.email as string | undefined;

          if (email) {
            try {
              await sendOrderConfirmationEmail(email);
            } catch (error) {
              // Email failure should not prevent order completion.
              console.error("Order confirmation email failed:", error);
            }
          }
        }
      }

      if (typeof window !== "undefined") {
        window.localStorage.removeItem("cart_product_data");
        emptyCart();
      }
    } catch (error) {
      console.error("Error in order completion:", error);
    }
  }


useEffect(() => {
  if (hasFinalized.current) return;
  hasFinalized.current = true;

  async function finalizeOrder() {
    try {
      console.log("[OrderComplete] Starting finalization", {
        orderId,
        paymentType,
        paymentStatus,
      });

      await createOrder();

      if (!orderId) {
        throw new Error("Missing orderMasterId in the URL.");
      }

      const normalizedPaymentType = paymentType?.toLowerCase();
      const normalizedPaymentStatus = paymentStatus?.toLowerCase();

      const isOnlinePayment =
        normalizedPaymentType === "paypal" ||
        normalizedPaymentType === "stripe";

      if (
        isOnlinePayment &&
        normalizedPaymentStatus === "success"
      ) {
        console.log("[OrderComplete] Updating order to COMPLETED");
        await updateOrderStatus("COMPLETED");

        if (MAINTAIN_STOCK) {
          console.log("[OrderComplete] Decreasing stock");
          await decreaseProductStockFromOrder(orderId);
        }

        setCompletionState("success");
      } else if (
        isOnlinePayment &&
        ["fail", "failed", "failure", "cancelled", "canceled"].includes(
          normalizedPaymentStatus ?? ""
        )
      ) {
        await updateOrderStatus("Payment failed");
        setCompletionState("failed");
      } else if (
        normalizedPaymentType === "cod" ||
        normalizedPaymentType === "barzahlung"
      ) {
        await updateOrderStatus("COMPLETED");

        if (MAINTAIN_STOCK) {
          await decreaseProductStockFromOrder(orderId);
        }

        setCompletionState("success");
      } else {
        console.error("[OrderComplete] Unrecognized payment parameters", {
          paymentType,
          paymentStatus,
          orderId,
        });

        setCompletionState("failed");
        return;
      }

      // Check the signed-in customer after processing the order.
      console.log("[OrderComplete] Checking customer session");

      const response = await fetch("/api/auth/session", {
        credentials: "include",
        cache: "no-store",
      });

      if (response.ok) {
        const session = await response.json();

        console.log("[OrderComplete] Session role:", session?.user?.role);

        if (session?.user?.id && session?.user?.role === "user") {
          router.replace("/user/orders");
        }
      }
    } catch (error) {
      console.error("[OrderComplete] Finalization failed:", error);
      setCompletionState("failed");
    }
  }

  void finalizeOrder();

  // IMPORTANT:
  // Do not cancel this async operation in the effect cleanup.
  // The hasFinalized ref prevents duplicate execution in Strict Mode.
}, []);


  const isProcessing = completionState === "processing";
  const isSuccess = completionState === "success";
  const isFailed = completionState === "failed";

  return (
    <main className="min-h-[70vh] bg-slate-50 px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
        <section className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Top accent */}
          <div
            className={`h-1.5 w-full ${
              isFailed
                ? "bg-red-500"
                : isProcessing
                  ? "bg-amber-500"
                  : "bg-emerald-500"
            }`}
          />

          <div className="px-5 py-9 text-center sm:px-10 sm:py-12">
            {/* Status icon */}
            <div
              className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full sm:h-24 sm:w-24 ${
                isFailed
                  ? "bg-red-50 text-red-600"
                  : isProcessing
                    ? "bg-amber-50 text-amber-600"
                    : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {isProcessing ? (
                <LoaderCircle size={42} className="animate-spin" strokeWidth={1.7} />
              ) : isFailed ? (
                <XCircle size={44} strokeWidth={1.7} />
              ) : (
                <CheckCircle2 size={46} strokeWidth={1.7} />
              )}
            </div>

            <p
              className={`mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                isFailed
                  ? "bg-red-50 text-red-700"
                  : isProcessing
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {isProcessing ? (
                <>
                  <Clock3 size={14} />
                  Processing your order
                </>
              ) : isFailed ? (
                <>
                  <XCircle size={14} />
                  Payment or order needs attention
                </>
              ) : (
                <>
                  <ShieldCheck size={14} />
                  Order confirmed
                </>
              )}
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {isProcessing
                ? "Finalizing your order"
                : isFailed
                  ? "We couldn't confirm your order"
                  : BRANDING?.order_complete_heading ||
                    "Ihre Bestellung ist abgeschlossen"}
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
              {isProcessing
                ? "Please wait while we update your order details. This may take a moment."
                : isFailed
                  ? "Please check your payment status or contact us before placing the order again."
                  : "Thank you for ordering with us. Your order details are being taken care of."}
            </p>

            {isSuccess && (
              <div className="mx-auto mt-7 grid max-w-md gap-3 text-left sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                    <PackageCheck size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {BRANDING?.pickup_time || "Pickup"}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Follow the instructions provided for your order.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {BRANDING?.delivery_time || "Delivery"}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Your order will be handled according to the selected option.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isFailed && (
              <div className="mx-auto mt-6 max-w-md rounded-xl border border-red-100 bg-red-50 p-4 text-left text-sm leading-6 text-red-800">
                If you were charged, please contact the business before trying again.
              </div>
            )}

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
              >
                <ShoppingBag size={18} />
                {TEXT?.shop_more_button || "Mehr einkaufen"}
              </button>

              {!isProcessing && (
                <button
                  type="button"
                  onClick={() => router.push("/user/orders")}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                >
                  View My Orders
                  <ArrowRight size={17} />
                </button>
              )}
            </div>
          </div>
        </section>

        <p className="mt-5 flex items-center gap-2 text-center text-xs text-slate-400">
          <ShieldCheck size={15} />
          Thank you for choosing us.
        </p>
      </div>
    </main>
  );
}
