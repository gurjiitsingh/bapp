"use server";

import { hashPassword } from "@/lib/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";


export async function addPosUser(formData: FormData) {
  const fullName = String(formData.get("fullName") || "").trim();

  const username = String(formData.get("username") || "")
    .trim()
    .toLowerCase();

  const mobile = String(formData.get("mobile") || "").trim();

  const role = String(formData.get("role") || "user")
    .trim()
    .toLowerCase();

  const status = String(formData.get("status") || "active")
    .trim()
    .toLowerCase();

  const pin = String(formData.get("pin") || "").trim();

  try {
    // =====================================================
    // VALIDATION
    // =====================================================

    if (!fullName || !username || !mobile || !pin) {
      return {
        success: false,
        message: "Please fill all required fields.",
      };
    }

    if (!["admin", "user"].includes(role)) {
      return {
        success: false,
        message: "Invalid POS user role.",
      };
    }

    if (!["active", "inactive"].includes(status)) {
      return {
        success: false,
        message: "Invalid user status.",
      };
    }

    if (!/^\d{4,6}$/.test(pin)) {
      return {
        success: false,
        message: "PIN must contain 4 to 6 digits.",
      };
    }

    // =====================================================
    // CHECK DUPLICATE MOBILE
    // =====================================================

    const existingMobile = await adminDb
      .collection("users")
      .where("mobile", "==", mobile)
      .limit(1)
      .get();

    if (!existingMobile.empty) {
      return {
        success: false,
        message: "Mobile number is already in use.",
      };
    }

    // =====================================================
    // CHECK DUPLICATE USERNAME
    // =====================================================

    const existingUsername = await adminDb
      .collection("users")
      .where("username", "==", username)
      .limit(1)
      .get();

    if (!existingUsername.empty) {
      return {
        success: false,
        message: "Username is already in use.",
      };
    }

    // =====================================================
    // POS PERMISSIONS
    // =====================================================

    const permissions = {
      sale: true,

      refund: role === "admin",

      discount: role === "admin",

      editPrice: role === "admin",

      inventory: role === "admin",

      reports: role === "admin",

      settings: role === "admin",

      manageUsers: role === "admin",
    };

    // =====================================================
    // CREATE POS USER
    // =====================================================

 const docRef = await adminDb.collection("users").add({
  fullName,
  username,
  mobile,

  // User type
  userType: "pos",

  // POS login
  allowPosLogin: true,

  // POS PIN
   loginPin:pin,

  // POS role
  role,

  status,
  active: status === "active",

  permissions,

  isVerified: true,

  createdAt: FieldValue.serverTimestamp(),
  updatedAt: FieldValue.serverTimestamp(),
});

    return {
      success: true,
      message: "POS user created successfully.",
      userId: docRef.id,
    };
  } catch (error: any) {
    console.error("Error creating POS user:", error);

    return {
      success: false,
      message: error.message || "Failed to create POS user.",
    };
  }
}
 
