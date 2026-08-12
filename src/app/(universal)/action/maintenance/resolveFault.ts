"use server";

import { Timestamp } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

import { adminDb } from "@/lib/firebaseAdmin";

export async function resolveFault(
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

    if (data?.status !== "IN_PROGRESS") {
      return {
        success: false,
        message:
          "Only an in-progress repair can be resolved.",
      };
    }

    if (!data?.diagnosis?.trim()) {
      return {
        success: false,
        message:
          "Please enter diagnosis before resolving the fault.",
      };
    }

    if (
      !data?.repairDescription?.trim()
    ) {
      return {
        success: false,
        message:
          "Please enter repair description before resolving the fault.",
      };
    }

    const now = Timestamp.now();

    await faultRef.update({
      status: "RESOLVED",
      resolvedAt: now,
      updatedAt: now,
    });

    if (data?.machineId) {
      await adminDb
        .collection("machines")
        .doc(data.machineId)
        .update({
          status: "ACTIVE",
          updatedAt: now,
        });
    }

    revalidatePath(
      "/admin/maintenance/faults"
    );

    revalidatePath(
      `/admin/maintenance/faults/${faultId}`
    );

    revalidatePath(
      "/admin/maintenance/machines"
    );

    return {
      success: true,
      message:
        "Fault resolved successfully.",
    };
  } catch (error) {
    console.error(
      "resolveFault error:",
      error
    );

    return {
      success: false,
      message:
        "Failed to resolve fault.",
    };
  }
}