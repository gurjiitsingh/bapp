"use server";


import { adminDb } from "@/lib/firebaseAdmin";
 
import { FieldValue } from "firebase-admin/firestore";
 



export async function updateRenewDate(
  formData: FormData
): Promise<void> {
  const outletId = formData.get("outletId") as string;
  const renewDate = formData.get("renewDate") as string;

  if (!outletId || !renewDate) {
    throw new Error("Missing data");
  }

  await adminDb
    .collection("outlets")
    .doc(outletId)
    .update({
      renewDate,
      updatedAt: FieldValue.serverTimestamp(),
    });
}