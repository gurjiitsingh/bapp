 
import { NextRequest, NextResponse } from "next/server";
import { handleStripeWebhook } from "../../../../../custom/lib/payments/stripe/stripeWebhook";

 

export async function POST(req: NextRequest) {
  const body = await req.text();

  const signature =
    req.headers.get("stripe-signature");

  if (!signature) {
    return new NextResponse(
      "Missing Stripe signature",
      {
        status: 400,
      }
    );
  }

  const result =
    await handleStripeWebhook(
      body,
      signature
    );

  return new NextResponse(
    result.message,
    {
      status: result.status,
    }
  );
}