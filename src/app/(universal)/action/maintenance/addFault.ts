// app/(universal)/action/maintenance/faultActions.ts

"use server";

import { Timestamp } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

import { adminDb } from "@/lib/firebaseAdmin";
import { deleteImage, upload } from "@/lib/cloudinary";

import type {
  CreateFaultInput,
   
} from "@/lib/maintenance/faultTypes";

/* =========================================================
   ADD FAULT / CREATE MAINTENANCE TICKET
========================================================= */

export async function addFault(
  input: CreateFaultInput,
  formData?: FormData
): Promise<{
  success: boolean;
  message: string;
  faultId?: string;
  ticketNumber?: string;
}> {
  let uploadedImages: string[] = [];

  try {
    // =====================================================
    // VALIDATION
    // =====================================================

    if (!input.machineId?.trim()) {
      return {
        success: false,
        message: "Machine is required.",
      };
    }

    if (!input.machineName?.trim()) {
      return {
        success: false,
        message: "Machine name is required.",
      };
    }

    if (!input.faultTitle?.trim()) {
      return {
        success: false,
        message: "Fault title is required.",
      };
    }

    if (!input.faultDescription?.trim()) {
      return {
        success: false,
        message: "Fault description is required.",
      };
    }

    if (!input.reportedBy?.trim()) {
      return {
        success: false,
        message: "Reporter is required.",
      };
    }

    // =====================================================
    // VERIFY MACHINE
    // =====================================================

    const machineSnapshot = await adminDb
      .collection("machines")
      .doc(input.machineId.trim())
      .get();

    if (!machineSnapshot.exists) {
      return {
        success: false,
        message: "Selected machine was not found.",
      };
    }

    // =====================================================
    // UPLOAD IMAGES TO CLOUDINARY
    // =====================================================

    if (formData) {
      const images = formData.getAll("images");

      for (const image of images) {
        if (!(image instanceof File)) {
          continue;
        }

        if (image.size <= 0) {
          continue;
        }

        if (!image.type.startsWith("image/")) {
          continue;
        }

        if (image.size > 10 * 1024 * 1024) {
          return {
            success: false,
            message:
              `${image.name} is larger than 10 MB.`,
          };
        }

        const imageUrl = await upload(image);
        console.log("image-------------------------",imageUrl )

        if (!imageUrl) {
          throw new Error(
            `Failed to upload ${image.name}`
          );
        }

        uploadedImages.push(imageUrl);
      }
    }

    // =====================================================
    // GENERATE TICKET
    // =====================================================

    const counterRef = adminDb
      .collection("counters")
      .doc("maintenanceFaults");

    const now = Timestamp.now();

    const ticketNumber =
      await adminDb.runTransaction(
        async (transaction) => {
          const counterSnapshot =
            await transaction.get(counterRef);

          let nextNumber = 1;

          if (counterSnapshot.exists) {
            const counterData =
              counterSnapshot.data();

            nextNumber =
              Number(
                counterData?.value || 0
              ) + 1;
          }

          transaction.set(
            counterRef,
            {
              value: nextNumber,
              updatedAt: now,
            },
            {
              merge: true,
            }
          );

          const year =
            new Date().getFullYear();

          return `MNT-${year}-${String(
            nextNumber
          ).padStart(5, "0")}`;
        }
      );

    // =====================================================
    // CREATE FAULT
    // =====================================================

    const faultRef = adminDb
      .collection("maintenanceFaults")
      .doc();

    await faultRef.set({
      ticketNumber,

      machineId:
        input.machineId.trim(),

      machineName:
        input.machineName.trim(),

      machineCode:
        input.machineCode?.trim() || "",

      departmentId:
        input.departmentId?.trim() || "",

      departmentName:
        input.departmentName?.trim() || "",

      location:
        input.location?.trim() || "",

      faultTitle:
        input.faultTitle.trim(),

      faultDescription:
        input.faultDescription.trim(),

      priority:
        input.priority || "MEDIUM",

      status: "OPEN",

      reportedBy:
        input.reportedBy.trim(),

      reportedByName:
        input.reportedByName?.trim() || "",

      reportedAt: now,

      assignedTo:
        input.assignedTo?.trim() || null,

      assignedToName:
        input.assignedToName?.trim() || null,

      assignedAt: null,

      startedAt: null,

      resolvedAt: null,

      closedAt: null,

      diagnosis: "",

      repairDescription: "",

      downtimeMinutes: 0,

      remarks: "",

      // ===================================================
      // CLOUDINARY PHOTOS
      // ===================================================

      photos: uploadedImages.map(
        (url) => ({
          url,
          uploadedAt: now,
        })
      ),

      createdAt: now,

      updatedAt: now,
    });

    // =====================================================
    // UPDATE MACHINE
    // =====================================================

    await adminDb
      .collection("machines")
      .doc(input.machineId.trim())
      .update({
        status: "BREAKDOWN",
        updatedAt: now,
      });

    // =====================================================
    // REVALIDATE
    // =====================================================

    revalidatePath(
      "/admin/maintenance/faults"
    );

    revalidatePath(
      "/admin/maintenance/machines"
    );

    // =====================================================
    // SUCCESS
    // =====================================================

    return {
      success: true,

      message:
        "Machine fault reported successfully.",

      faultId:
        faultRef.id,

      ticketNumber,
    };

  } catch (error) {

    console.error(
      "addFault error:",
      error
    );

    // =====================================================
    // CLOUDINARY CLEANUP
    // =====================================================

    for (const imageUrl of uploadedImages) {
      try {
        await deleteImage(imageUrl);
      } catch (deleteError) {
        console.error(
          "Cloudinary cleanup error:",
          deleteError
        );
      }
    }

    return {
      success: false,

      message:
        "Failed to report machine fault.",
    };
  }
}