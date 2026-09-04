"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
/**
 * Save or update customer info in Firestore
 * @param name - Customer's full name
 * @param userId - Unique customer ID
 * @param email - Customer email address
 * @param marketingConsent - Boolean (true if allowed to send marketing)
 */

export async function marketingData({
  name,
  userId,
  addressId,
  email,
  noOfferEmails,
}: {
  name: string;
  userId: string | undefined;
  addressId: string;
  email: string;
  noOfferEmails: boolean;
}) {
  // Get current German time
  // const now = new Date();
  // const germanDateStr = now.toLocaleString("en-DE", {
  //   timeZone: "Europe/Berlin",
  // });
  // const germanDate = new Date(germanDateStr);

  const docRef = adminDb.collection("customerRecentOrder").doc(userId!);

  await docRef.set(
    {
      name,
      email,
      userId,
      addressId,
      noOfferEmails,
      lastOrderDate: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}