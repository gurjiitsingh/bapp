// app/api/outlet/route.ts
import { NextResponse } from "next/server";
import { deleteOutlet } from "@/app/(universal)/action/outlet/deleteOutlet";

export async function DELETE(req: Request) {
  try {
    const { outletId } = await req.json();

    const result = await deleteOutlet(outletId);
    if (result?.errors) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { errors: { general: "Invalid request" } },
      { status: 500 }
    );
  }
}