
"use server";

import { Timestamp } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

import { adminDb } from "@/lib/firebaseAdmin";

export async function closeFault(
  faultId: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!faultId?.trim()) {
      return {
        success: false,
        message: "Fault ID is required.",
      };
    }

    const faultRef = adminDb
      .collection("maintenanceFaults")
      .doc(faultId);

    const snapshot = await faultRef.get();

    if (!snapshot.exists) {
      return {
        success: false,
        message: "Fault ticket not found.",
      };
    }

    if (
      snapshot.data()?.status !==
      "RESOLVED"
    ) {
      return {
        success: false,
        message:
          "Only a resolved fault can be closed.",
      };
    }

    const now = Timestamp.now();

    await faultRef.update({
      status: "CLOSED",
      closedAt: now,
      updatedAt: now,
    });

    revalidatePath(
      "/admin/maintenance/faults"
    );

    revalidatePath(
      `/admin/maintenance/faults/${faultId}`
    );

    return {
      success: true,
      message:
        "Fault ticket closed successfully.",
    };
  } catch (error) {
    console.error(
      "closeFault error:",
      error
    );

    return {
      success: false,
      message:
        "Failed to close fault ticket.",
    };
  }
}