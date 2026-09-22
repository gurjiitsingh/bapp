import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebaseAdmin";
//import { FieldValue, Timestamp } from "firebase-admin/firestore";
import admin from "firebase-admin";
export async function POST(req: NextRequest) {
  const body = await req.text();

  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing Stripe signature", {
      status: 400,
    });
  }

  let event: Stripe.Event;

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

    return new NextResponse("Invalid signature", {
      status: 400,
    });
  }

  console.log("Stripe webhook received:", event.type);

  switch (event.type) {
  case "checkout.session.completed": {
  const session =
    event.data.object as Stripe.Checkout.Session;

  console.log(
    "Checkout completed:",
    session.id
  );

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

    return new NextResponse(
      "Missing orderMasterId",
      { status: 400 }
    );
  }

  // -----------------------------------------
  // Update Firestore payment status
  // -----------------------------------------

  const orderRef = adminDb
    .collection("orderMaster")
    .doc(orderMasterId);

  const orderSnap = await orderRef.get();

  if (!orderSnap.exists) {
    console.error(
      `Order not found: ${orderMasterId}`
    );

    return new NextResponse(
      "Order not found",
      { status: 404 }
    );
  }

  const order = orderSnap.data();

  const grandTotal =
    Number(order?.grandTotal ?? 0);

  const paidAmount =
    Number(session.amount_total ?? 0) / 100;

  const dueAmount = Math.max(
    grandTotal - paidAmount,
    0
  );

  await orderRef.update({
    paymentMode: "ONLINE",
    paymentProvider: "STRIPE",
    paymentMethod: "STRIPE",

    paymentStatus: "PAID",

    paidAmount,
    dueAmount,

    updatedAt: 
      admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(
    `Order ${orderMasterId} marked as PAID.`
  );

  break;
}

    default:
      console.log(
        `Unhandled Stripe event: ${event.type}`
      );
  }

  return NextResponse.json({
    received: true,
  });
}