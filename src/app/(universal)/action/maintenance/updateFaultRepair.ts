"use server";

import { Timestamp } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

import { adminDb } from "@/lib/firebaseAdmin";

export async function updateFaultRepair(
  faultId: string,
  input: {
    diagnosis: string;
    repairDescription: string;
    downtimeMinutes: number;
    remarks?: string;
  }
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
      "IN_PROGRESS"
    ) {
      return {
        success: false,
        message:
          "Repair information can only be updated while the fault is in progress.",
      };
    }

    if (!input.diagnosis?.trim()) {
      return {
        success: false,
        message: "Diagnosis is required.",
      };
    }

    if (
      !input.repairDescription?.trim()
    ) {
      return {
        success: false,
        message:
          "Repair description is required.",
      };
    }

    const downtimeMinutes = Number(
      input.downtimeMinutes || 0
    );

    if (downtimeMinutes < 0) {
      return {
        success: false,
        message:
          "Downtime cannot be negative.",
      };
    }

    await faultRef.update({
      diagnosis:
        input.diagnosis.trim(),

      repairDescription:
        input.repairDescription.trim(),

      downtimeMinutes,

      remarks:
        input.remarks?.trim() || "",

      updatedAt: Timestamp.now(),
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
        "Repair information updated successfully.",
    };
  } catch (error) {
    console.error(
      "updateFaultRepair error:",
      error
    );

    return {
      success: false,
      message:
        "Failed to update repair information.",
    };
  }
}