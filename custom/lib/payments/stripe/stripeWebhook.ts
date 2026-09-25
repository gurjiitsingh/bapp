import Stripe from "stripe";
import admin from "firebase-admin";


import { adminDb } from "@/lib/firebaseAdmin";
import { stripe } from "./stripe";

export async function handleStripeWebhook(
  body: string,
  signature: string
) {
  let event: Stripe.Event;

  // =====================================================
  // VERIFY STRIPE WEBHOOK
  // =====================================================

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error(
      "Stripe webhook signature verification failed:",
      error
    );

    return {
      success: false,
      status: 400,
      message: "Invalid signature",
    };
  }

  console.log(
    "Stripe webhook received:",
    event.type
  );

  // =====================================================
  // HANDLE EVENTS
  // =====================================================

  switch (event.type) {
    case "checkout.session.completed": {
      const session =
        event.data.object as Stripe.Checkout.Session;

      console.log(
        "Checkout completed:",
        session.id
      );

      // -----------------------------------------------
      // VERIFY PAYMENT STATUS
      // -----------------------------------------------

      if (session.payment_status !== "paid") {
        console.log(
          "Checkout completed but payment is not marked as paid:",
          session.payment_status
        );

        break;
      }

      // -----------------------------------------------
      // GET ORDER ID
      // -----------------------------------------------

      const orderMasterId =
        session.metadata?.orderMasterId;

      console.log(
        "Order ID:",
        orderMasterId
      );

      if (!orderMasterId) {
        console.error(
          "Stripe Checkout Session is missing orderMasterId metadata."
        );

        return {
          success: false,
          status: 400,
          message: "Missing orderMasterId",
        };
      }

      // -----------------------------------------------
      // GET FIRESTORE ORDER
      // -----------------------------------------------

      const orderRef = adminDb
        .collection("orderMaster")
        .doc(orderMasterId);

      const orderSnap =
        await orderRef.get();

      if (!orderSnap.exists) {
        console.error(
          `Order not found: ${orderMasterId}`
        );

        return {
          success: false,
          status: 404,
          message: "Order not found",
        };
      }

      const order =
        orderSnap.data();

      // -----------------------------------------------
      // IDEMPOTENCY CHECK
      // -----------------------------------------------

      if (
        order?.paymentStatus === "PAID"
      ) {
        console.log(
          `Order ${orderMasterId} is already marked as PAID.`
        );

        break;
      }

      // -----------------------------------------------
      // AMOUNT
      // -----------------------------------------------

      const grandTotal =
        Number(
          order?.grandTotal ?? 0
        );

      const paidAmount =
        Number(
          session.amount_total ?? 0
        ) / 100;

      const dueAmount =
        Math.max(
          grandTotal - paidAmount,
          0
        );

      // -----------------------------------------------
      // UPDATE FIRESTORE
      // -----------------------------------------------

      await orderRef.update({
        paymentMode: "ONLINE",

        paymentProvider: "STRIPE",

        paymentMethod: "CARD",

        paymentStatus: "PAID",

        paidAmount,

        dueAmount,

        updatedAt:
          admin.firestore.FieldValue
            .serverTimestamp(),
      });

      console.log(
        `Order ${orderMasterId} marked as PAID.`
      );

      break;
    }

    default: {
      console.log(
        `Unhandled Stripe event: ${event.type}`
      );

      break;
    }
  }

  return {
    success: true,
    status: 200,
    message: "Webhook received",
  };
}