"use server";

import { createStripeCheckoutSessionInternal } from "../../../../../custom/lib/payments/stripe/stripeCheckout";

export async function createStripeCheckoutSession({
  orderMasterId,
}: {
  orderMasterId: string;
}) {
  try {
    return await createStripeCheckoutSessionInternal({
      orderMasterId,
    });
  } catch (error) {
    console.error("Stripe Checkout Session error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to create Stripe checkout session",
      url: null,
    };
  }
}