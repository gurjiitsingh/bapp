"use server";

import Stripe from "stripe";
import { adminDb } from "@/lib/firebaseAdmin";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!
);

export async function createStripeCheckoutSession({
  orderMasterId,
}: {
  orderMasterId: string;
}) {
  try {
    // -----------------------------------------
    // 1. Validate order ID
    // -----------------------------------------
    if (!orderMasterId) {
      return {
        success: false,
        error: "Order ID is missing.",
      };
    }

    // -----------------------------------------
    // 2. Fetch order from Firestore
    // -----------------------------------------
    const orderRef = adminDb
      .collection("orderMaster")
      .doc(orderMasterId);

    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return {
        success: false,
        error: "Order not found.",
      };
    }

    const order = orderSnap.data();

    if (!order) {
      return {
        success: false,
        error: "Unable to read order.",
      };
    }

    // -----------------------------------------
    // 3. Get amount from Firestore
    // -----------------------------------------
    const grandTotal = Number(order.grandTotal);

    if (!Number.isFinite(grandTotal) || grandTotal <= 0) {
      return {
        success: false,
        error: "Invalid order total.",
      };
    }

    // Stripe uses the smallest currency unit.
    // Example:
    // €25.50 -> 2550 cents
    const amountInCents = Math.round(
      grandTotal * 100
    );

    // -----------------------------------------
    // 4. Create Stripe Checkout Session
    // -----------------------------------------
const session =
  await stripe.checkout.sessions.create({
    mode: "payment",

    line_items: [
      {
        price_data: {
          currency: "eur",

          product_data: {
            name: `Food Order ${order.srno || orderMasterId}`,
          },

          unit_amount: amountInCents,
        },

        quantity: 1,
      },
    ],

    success_url:
      `${process.env.NEXT_PUBLIC_APP_URL}` +
      `/complete?orderMasterId=${orderMasterId}`,

    cancel_url:
      `${process.env.NEXT_PUBLIC_APP_URL}` +
      `/stripe?orderMasterId=${orderMasterId}`,

    metadata: {
      orderMasterId,
    },
  });

    // -----------------------------------------
    // 5. Return Stripe Checkout URL
    // -----------------------------------------
    return {
      success: true,
      url: session.url,
    };

  } catch (error) {
    console.error(
      "Stripe Checkout Session error:",
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to create Stripe checkout session",
    };
  }
}