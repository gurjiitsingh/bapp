
"use server";

import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";

export async function getLoggedInCustomer() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return {
        success: false,
        customer: null,
        message: "User is not authenticated.",
      };
    }

    const doc = await adminDb
      .collection("users")
      .doc(userId)
      .get();

    if (!doc.exists) {
      return {
        success: false,
        customer: null,
        message: "Customer not found.",
      };
    }

    const data = doc.data();

    const customer = {
      id: doc.id,
      userId: doc.id,
      firstName: data?.firstName ?? "",
      lastName: data?.lastName ?? "",
      mobNo: data?.mobNo ?? "",
      email: data?.email ?? "",
    };

    return {
      success: true,
      customer,
      message: "",
    };

  } catch (error) {
    console.error("getLoggedInCustomer error:", error);

    return {
      success: false,
      customer: null,
      message: "Unable to load customer information.",
    };
  }
}
