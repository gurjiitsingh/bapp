
"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function getCustomerAddresses(userId: string) {
  const snapshot = await adminDb
    .collection("address")
    .where("userId", "==", userId)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      userId,
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      mobNo: data.mobNo ?? "",
      email: data.email ?? "",
      addressLine1: data.addressLine1 ?? "",
      addressLine2: data.addressLine2 ?? "",
      city: data.city ?? "",
      state: data.state ?? "",
      zipCode: data.zipCode ?? "",
      portal: data.portal ?? "",
      staircase: data.staircase ?? "",
      floor: data.floor ?? "",
      door: data.door ?? "",
      deliveryNotes: data.deliveryNotes ?? "",
    };
  });
}
