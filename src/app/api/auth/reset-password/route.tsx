import { hashPassword } from "@/lib/auth";
import { adminDb } from "@/lib/firebaseAdmin";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, id, password } = await req.json();

  if (!token || !id || !password) {
    return NextResponse.json({ message: "Missing data." }, { status: 400 });
  }

  const resetDoc = await adminDb.collection("passwordResets").doc(id).get();
  if (!resetDoc.exists) {
    return NextResponse.json({ message: "Invalid token." }, { status: 400 });
  }

  const resetData = resetDoc.data();
  const isExpired = Date.now() > resetData!.expires;

  if (resetData!.token !== token || isExpired) {
    return NextResponse.json({ message: "Reset link is invalid or has expired." }, { status: 400 });
  }

  const hashed = await hashPassword(password);

  await adminDb.collection("user").doc(id).update({ hashedPassword: hashed });
  await adminDb.collection("passwordResets").doc(id).delete();

  return NextResponse.json({ message: "Password has been reset successfully." });
}
