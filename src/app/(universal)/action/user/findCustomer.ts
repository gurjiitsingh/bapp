// app/(universal)/action/users/findCustomer.ts

"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function findCustomer(identifier: string) {
  const value = identifier.trim();

  const usersRef = adminDb.collection("users");

  const field = value.includes("@") ? "email" : "phone";

  const snap = await usersRef
    .where(field, "==", value)
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