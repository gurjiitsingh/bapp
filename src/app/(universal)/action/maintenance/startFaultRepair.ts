
"use server";

import { Timestamp } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

import { adminDb } from "@/lib/firebaseAdmin";

export async function startFaultRepair(
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

    const data = snapshot.data();

    if (
      data?.status !== "OPEN" &&
      data?.status !== "ASSIGNED"
    ) {
      return {
        success: false,
        message:
          "This fault cannot be started in its current status.",
      };
    }

    const now = Timestamp.now();

    await faultRef.update({
      status: "IN_PROGRESS",
      startedAt: now,
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
      message: "Repair started successfully.",
    };
  } catch (error) {
    console.error(
      "startFaultRepair error:",
      error
    );

    return {
      success: false,
      message: "Failed to start repair.",
    };
  }
}