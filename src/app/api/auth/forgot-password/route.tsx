import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { sendResetPasswordEmail } from "@/lib/sendResetPasswordEmail";

export async function POST(req: Request) {
  const { email } = await req.json();

  const userSnap = await adminDb
    .collection("user")
    .where("email", "==", email)
    .limit(1)
    .get();

  if (userSnap.empty) {
    return NextResponse.json({ message: "If the email exists, a reset link has been sent." });
  }

  const userId = userSnap.docs[0].id;
  const token = nanoid(32);
  const expires = Date.now() + 1000 * 60 * 60; // 1 hour

  await adminDb.collection("passwordResets").doc(userId).set({
    token,
    expires,
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}&id=${userId}`;

  const result = await sendResetPasswordEmail(email, resetUrl);

  if (!result.success) {
    return NextResponse.json({ message: "Failed to send email." }, { status: 500 });
  }

  return NextResponse.json({ message: "If the email exists, a reset link has been sent." });
}
