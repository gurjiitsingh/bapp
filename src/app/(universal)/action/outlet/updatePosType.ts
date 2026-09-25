"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
 



export async function updatePosType(formData: FormData): Promise<void> {
  const outletId = formData.get("outletId") as string;
  const posType = formData.get("posType") as string;

  if (!outletId || !posType) {
    throw new Error("Missing data");
  }

  await adminDb.collection("outlets").doc(outletId).update({
    posType,
    updatedAt: FieldValue.serverTimestamp(),
  });
}