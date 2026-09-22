"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createStripeCheckoutSession } from "@/app/(universal)/action/stripe/actionStripe";

export default function StripeWrapper() {
  const searchParams = useSearchParams();

  const orderMasterId =
    searchParams.get("orderMasterId");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    if (!orderMasterId) {
      setError("Order ID is missing.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result =
        await createStripeCheckoutSession({
          orderMasterId,
        });

      if (!result.success || !result.url) {
        setError(
          result.error ||
            "Unable to start Stripe payment."
        );
        return;
      }

      // Redirect customer to Stripe Checkout
      window.location.href = result.url;

    } catch (error) {
      console.error(
        "Stripe checkout error:",
        error
      );

      setError(
        "Unable to start payment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-5">
      <div className="flex flex-col items-center gap-4">

        <h2 className="text-xl font-semibold text-slate-700">
          Secure Payment
        </h2>

        <button
          type="button"
          onClick={handlePayment}
          disabled={loading}
          className="bg-amber-400 font-semibold text-slate-700 rounded-lg px-6 py-3 min-w-[220px] disabled:opacity-50"
        >
          {loading
            ? "Redirecting..."
            : "Pay with Stripe"}
        </button>

        {error && (
          <p className="text-red-600 text-sm text-center">
            {error}
          </p>
        )}

      </div>
    </div>
  );
}