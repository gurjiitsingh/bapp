"use server";

import { hashPassword } from "@/lib/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function addUserDashboard(
  formData: FormData
): Promise<string | undefined> {
  const fullName = String(formData.get("fullName") || "").trim();
  const username = String(formData.get("username") || "").trim();

  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  const mobile = String(formData.get("mobile") || "").trim();

  const password = String(formData.get("password") || "");

  const role = String(formData.get("role") || "user");

  const status = String(formData.get("status") || "active");

  const employeeId = String(
    formData.get("employeeId") || ""
  ).trim();

  const department = String(
    formData.get("department") || ""
  ).trim();

  const address = String(
    formData.get("address") || ""
  ).trim();

  const notes = String(
    formData.get("notes") || ""
  ).trim();

  try {
    // Check existing user by mobile
    const existing = await adminDb
      .collection("users")
      .where("mobile", "==", mobile)
      .limit(1)
      .get();

    if (!existing.empty) {
      return existing.docs[0].id;
    }

    const hashedPassword = await hashPassword(password);

    const newUser = {
      // Basic Information
      fullName,
      username,
      email,
      mobile,

      // Authentication
      hashedPassword,
      role,
      status,
      isVerified: true,
      isAdmin: role === "admin",

      // Employee Information
      employeeId: employeeId || "",
      department: department || "",
      address: address || "",
      notes: notes || "",

      // Optional readable time
      time: new Intl.DateTimeFormat("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date()),

      // Timestamps
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb
      .collection("users")
      .add(newUser);

    return docRef.id;
  } catch (error) {
    console.error("Error creating user:", error);
    return undefined;
  }
}