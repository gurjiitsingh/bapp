
"use server";

import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export type CustomerProfile = {
  fullName: string;
  email: string;
  mobile: string;
};

export type CustomerProfileResult =
  | { success: true; data: CustomerProfile }
  | { success: false; error: string };

async function getAuthenticatedCustomerId(): Promise<string | null> {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "user") {
    return null;
  }

  return session.user.id;
}

export async function getCustomerProfile(): Promise<CustomerProfileResult> {
  try {
    const userId = await getAuthenticatedCustomerId();

    if (!userId) {
      return {
        success: false,
        error: "Please sign in to access your profile.",
      };
    }

    const userRef = adminDb.collection("users").doc(userId);
    const snapshot = await userRef.get();

    if (!snapshot.exists) {
      return {
        success: false,
        error: "Customer account was not found.",
      };
    }

    const user = snapshot.data();

    if (
      !user ||
      user.role !== "user" ||
      user.active === false ||
      ["inactive", "disabled", "suspended"].includes(
        String(user.status ?? "").toLowerCase()
      )
    ) {
      return {
        success: false,
        error: "This customer account is not available.",
      };
    }

    return {
      success: true,
      data: {
        fullName: String(user.fullName ?? ""),
        email: String(user.email ?? ""),
        mobile: String(user.mobile ?? ""),
      },
    };
  } catch (error) {
    console.error("[CustomerProfile] Load failed:", error);

    return {
      success: false,
      error: "Unable to load your profile. Please try again.",
    };
  }
}

export async function updateCustomerProfile(input: {
  fullName: string;
  mobile: string;
}): Promise<
  { success: true; data: CustomerProfile } |
  { success: false; error: string }
> {
  try {
    const userId = await getAuthenticatedCustomerId();

    if (!userId) {
      return {
        success: false,
        error: "Please sign in to update your profile.",
      };
    }

    // Validate and normalize only the fields customers may edit.
    const fullName =
      typeof input?.fullName === "string" ? input.fullName.trim() : "";

    const mobile =
      typeof input?.mobile === "string" ? input.mobile.trim() : "";

    if (fullName.length < 2 || fullName.length > 100) {
      return {
        success: false,
        error: "Name must be between 2 and 100 characters.",
      };
    }

    if (mobile.length > 25) {
      return {
        success: false,
        error: "Please enter a valid mobile number.",
      };
    }

    if (mobile && !/^[+\d\s().-]{7,25}$/.test(mobile)) {
      return {
        success: false,
        error: "Please enter a valid mobile number.",
      };
    }

    const userRef = adminDb.collection("users").doc(userId);

    // Recheck the role and account status on the server.
    const snapshot = await userRef.get();

    if (!snapshot.exists) {
      return {
        success: false,
        error: "Customer account was not found.",
      };
    }

    const user = snapshot.data();

    if (
      !user ||
      user.role !== "user" ||
      user.active === false ||
      ["inactive", "disabled", "suspended"].includes(
        String(user.status ?? "").toLowerCase()
      )
    ) {
      return {
        success: false,
        error: "This customer account is not available.",
      };
    }

    await userRef.update({
      fullName,
      mobile,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      data: {
        fullName,
        email: String(user.email ?? ""),
        mobile,
      },
    };
  } catch (error) {
    console.error("[CustomerProfile] Update failed:", error);

    return {
      success: false,
      error: "Unable to save your profile. Please try again.",
    };
  }
}
