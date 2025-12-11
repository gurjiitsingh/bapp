'use server';

import { hashPassword } from "@/lib/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import { TuserSchem, userType } from "@/lib/types/userType";
import { FieldValue } from "firebase-admin/firestore";
import admin from 'firebase-admin';
/**
 * Add a new user if email isn't already in use.
 * Returns the new or existing user ID.
 */
export async function addUserDirect(formData: FormData): Promise<string | undefined> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  let username = (formData.get("username") || undefined) as string | undefined;

  const existing = await adminDb
    .collection("user")
    .where("email", "==", email)
    .get();

  if (!existing.empty) {
    return existing.docs[0].id;
  }

  username ??= `${firstName} ${lastName}`;

  try {
    const hashedPassword = await hashPassword(password);

    const newUser = {
      username,
      firstName,
      lastName,
      email,
      hashedPassword,
      role: "user",
      isVerified: true,
      isAdmin: false,
      time: new Intl.DateTimeFormat("de", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        hour12: false,
        minute: "2-digit",
      }).format(new Date()),
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection("user").add(newUser);
    return docRef.id;
  } catch (e) {
    console.error("Error adding user:", e);
    return undefined;
  }
}

/**
 * Search a user by userId field (custom key).
 */
export async function searchUserById(id: string | undefined): Promise<TuserSchem> {
  let data = {} as TuserSchem;
  if (id) {
    const snapshot = await adminDb
      .collection("user")
      .where("userId", "==", id)
      .get();

    if (!snapshot.empty) {
      data = snapshot.docs[0].data() as TuserSchem;
    }
  }
  return data;
}

/**
 * Retrieve all users from Firestore.
 */
export async function fetchAllUsers(): Promise<userType[]> {
  const data: userType[] = [];
  const snapshot = await adminDb.collection("user").get();

  snapshot.forEach((doc) => {
    const docData = doc.data();

    data.push({
      id: doc.id,
      email: docData.email || "",
      hashedPassword: docData.hashedPassword || "",
      isAdmin: docData.isAdmin ?? false,
      isVerfied: docData.isVerified ?? false,
      role: docData.role || "user",
      username: docData.username || "",
      time: docData.time || "",
      createdAt: docData.createdAt?.toDate().toISOString() || undefined,
    });
  });

  return data;
}

/**
 * Delete a user document by its Firestore ID.
 */
export async function deleteUser(id: string): Promise<{ message: { success: string } }> {
  await adminDb.collection("user").doc(id).delete();
  return { message: { success: "ok" } };
}

/**
 * Add an email to the unsubscribe collection.
 */
export async function unsubscribeUser(email: string): Promise<boolean> {
  if (!email) return false;
  try {
    await adminDb.collection("unsubscribedEmails").doc(email).set({
      email,
      unsubscribedAt: FieldValue.serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Failed to unsubscribe:", error);
    return false;
  }
}



export async function unsbscribeUser(email: string): Promise<boolean> {
  try {
    if (!email) return false;

    await adminDb.collection("unsubscribedEmails").doc(email).set({
      email,
      unsubscribedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("❌ Failed to unsubscribe user:", error);
    return false;
  }
}