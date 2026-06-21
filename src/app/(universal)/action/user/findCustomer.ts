// app/(universal)/action/users/findCustomer.ts

"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function findCustomer(
  identifier: string
) {
  const usersRef =
    adminDb.collection("users");

  const isEmail =
    identifier.includes("@");

  const snap = await usersRef
    .where(
      isEmail ? "email" : "phone",
      "==",
      identifier
    )
    .limit(1)
    .get();

  if (snap.empty) {
    return null;
  }

  return {
    id: snap.docs[0].id,
    ...snap.docs[0].data(),
  };
}