"use server";

import { hashPassword } from "@/lib/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import admin from "firebase-admin";

export async function addUserDashboard(
  formData: FormData
): Promise<string | undefined> {
  const fullName = String(formData.get("fullName") || "").trim();
  const username = String(formData.get("username") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const mobile = String(formData.get("mobile") || "").trim();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "user");
  const status = String(formData.get("status") || "active");

  const employeeId =
    String(formData.get("employeeId") || "").trim();

  const department =
    String(formData.get("department") || "").trim();

  const address =
    String(formData.get("address") || "").trim();

  const notes =
    String(formData.get("notes") || "").trim();

  try {
    // Check if email already exists in Firebase Auth
    try {
      const existingUser =
        await admin.auth().getUserByEmail(email);

      return existingUser.uid;
    } catch {
      // continue if not found
    }

    // Create Firebase Auth user
    const authUser =
      await admin.auth().createUser({
        email,
        password,
        displayName: fullName || username,
        emailVerified: true,
        disabled: status !== "active",
      });

    const hashedPassword =
      await hashPassword(password);

    const newUser = {
      uid: authUser.uid,

      // basic
      fullName,
      username,
      email,
      mobile,

      // auth
      hashedPassword,
      role,
      status,
      isVerified: true,
      isAdmin: role === "admin",

      // employee information
      employeeId: employeeId || null,
      department: department || null,
      address: address || "",
      notes: notes || "",

      // timestamps
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await adminDb
      .collection("users")
      .doc(authUser.uid)
      .set(newUser);

    return authUser.uid;
  } catch (error) {
    console.error(
      "Error creating user:",
      error
    );
    return undefined;
  }
}