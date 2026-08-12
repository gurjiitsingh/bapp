// app/(universal)/action/maintenance/faultActions.ts

"use server";

import { Timestamp } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

import { adminDb } from "@/lib/firebaseAdmin";
import { deleteImage, upload } from "@/lib/cloudinary";

 

/* =========================================================
   ADD FAULT PHOTO
========================================================= */

export async function addFaultPhoto(
  faultId: string,
  formData: FormData
): Promise<{
  success: boolean;
  message: string;
  imageUrl?: string;
}> {
  let imageUrl = "";

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

    const faultSnapshot =
      await faultRef.get();

    if (!faultSnapshot.exists) {
      return {
        success: false,
        message: "Fault ticket not found.",
      };
    }

    const image =
      formData.get("image");

    if (!(image instanceof File)) {
      return {
        success: false,
        message: "Fault image is required.",
      };
    }

    if (image.size <= 0) {
      return {
        success: false,
        message: "Invalid image.",
      };
    }

    imageUrl = await upload(image);
console.log("iaage---------------------",imageUrl)
    if (!imageUrl) {
      return {
        success: false,
        message: "Image upload failed.",
      };
    }

    const faultData =
      faultSnapshot.data();

    const existingPhotos =
      Array.isArray(faultData?.photos)
        ? faultData.photos
        : [];

    const now = Timestamp.now();

    await faultRef.update({
      photos: [
        ...existingPhotos,
        {
          url: imageUrl,
          uploadedAt: now,
        },
      ],
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
        "Fault photo uploaded successfully.",
      imageUrl,
    };
  } catch (error) {
    console.error(
      "addFaultPhoto error:",
      error
    );

    if (imageUrl) {
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
        "Failed to upload fault photo.",
    };
  }
}