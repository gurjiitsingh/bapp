import { NextResponse } from "next/server";
import { getCustomerLedger } from "@/app/(universal)/action/stock-finished/customer/reports/getCustomerLedger";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await getCustomerLedger({
      customerId : body.customerId ,
      fromDate: body.fromDate,
      toDate: body.toDate,
    });

    console.log("customerId------------",body.customerId)

    return NextResponse.json(res);
  } catch (error) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}