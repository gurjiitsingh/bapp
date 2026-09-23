"use server";

import { hashPassword } from "@/lib/auth";
import { adminDb } from "@/lib/firebaseAdmin";
 
import { FieldValue } from "firebase-admin/firestore";
 


export async function addUserDirectNew(
  formData: FormData
): Promise<string | undefined> {
  const email = String(formData.get("email") ?? "").trim();
  const mobNo = String(formData.get("mobNo") ?? "").trim();

  const password = String(formData.get("password") ?? "");

  const firstName = String(
    formData.get("firstName") ?? ""
  ).trim();

  const lastName = String(
    formData.get("lastName") ?? ""
  ).trim();

  const role = String(
    formData.get("role") ?? ""
  ).trim();

  let username = String(
    formData.get("username") ?? ""
  ).trim();

  username ||= `${firstName} ${lastName}`.trim();

  /*
   * ---------------------------------------------------------
   * Validate contact information
   * ---------------------------------------------------------
   *
   * At least one contact method must exist.
   */
  if (!email && !mobNo) {
    console.error(
      "addUserDirect: email or mobile number is required."
    );

    return undefined;
  }

  try {
    /*
     * -------------------------------------------------------
     * Check existing user by email
     * -------------------------------------------------------
     */
    if (email) {
      const existingUserByEmail = await adminDb
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (!existingUserByEmail.empty) {
        return existingUserByEmail.docs[0].id;
      }
    }

    /*
     * -------------------------------------------------------
     * Check existing user by mobile
     * -------------------------------------------------------
     */
    if (mobNo) {
      const existingUserByMob = await adminDb
        .collection("users")
        .where("mobNo", "==", mobNo)
        .limit(1)
        .get();

      if (!existingUserByMob.empty) {
        return existingUserByMob.docs[0].id;
      }
    }

    /*
     * -------------------------------------------------------
     * Generate Firestore document ID
     * -------------------------------------------------------
     */
    const userRef = adminDb
      .collection("users")
      .doc();

    const uid = userRef.id;

    /*
     * -------------------------------------------------------
     * Hash password
     * -------------------------------------------------------
     */
    const hashedPassword = await hashPassword(password);

    /*
     * -------------------------------------------------------
     * Create user
     * -------------------------------------------------------
     *
     * Store BOTH fields in the document.
     *
     * Missing contact fields are stored as empty strings
     * so the structure remains predictable.
     */
    const newUser = {
      uid,
      username,

      firstName,
      lastName,

      email,
      mobNo,

      hashedPassword,

      role,

      isVerified: true,
      isAdmin: false,

      createdAt: FieldValue.serverTimestamp(),
    };

    /*
     * -------------------------------------------------------
     * Save user
     * -------------------------------------------------------
     */
    await userRef.set(newUser);

    return uid;
  } catch (e) {
    console.error(
      "Error adding user:",
      e
    );

    return undefined;
  }
}
 
