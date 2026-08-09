import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      tripId: string;
    }>;
  }
) {
  try {
    const { tripId } = await params;

    if (!tripId) {
      return NextResponse.json({
        success: false,
        message: "Trip ID required.",
      });
    }

    const snap = await adminDb
      .collection("driverSettlements")
      .doc(tripId)
      .get();

    if (!snap.exists) {
      return NextResponse.json({
        success: false,
        message: "Settlement not found.",
      });
    }

    const data = snap.data()!;

    return NextResponse.json({
      success: true,

      data: {
        settlementId: snap.id,

        ...data,

        openingCash: Number(data.openingCash || 0),

        totalSalesAmount:
          Number(data.totalSalesAmount || 0),

        newSaleCashCollected:
          Number(data.newSaleCashCollected || 0),

        newSaleCreditAmount:
          Number(data.newSaleCreditAmount || 0),

        oldCreditCollected:
          Number(data.oldCreditCollected || 0),

        totalCashCollected:
          Number(data.totalCashCollected || 0),

        totalExpenses:
          Number(data.totalExpenses || 0),

        amountPayableToManager:
          Number(data.amountPayableToManager || 0),

        amountHandedOver:
          Number(data.amountHandedOver || 0),

        shortageAmount:
          Number(data.shortageAmount || 0),

        excessAmount:
          Number(data.excessAmount || 0),
      },
    });

  } catch (error: any) {
    console.error(
      "❌ GET settlement:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to load settlement.",
      },
      {
        status: 500,
      }
    );
  }
}