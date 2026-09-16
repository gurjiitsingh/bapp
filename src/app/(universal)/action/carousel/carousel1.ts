"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { upload } from "@/lib/cloudinary";
import { revalidatePath, revalidateTag } from "next/cache";

export async function addCarousel(formData: FormData) {
  try {
    // =========================================================
    // GET FORM DATA
    // =========================================================

    const title =
      (formData.get("title") as string | null)?.trim() || "";

    const description =
      (formData.get("description") as string | null)?.trim() || "";

    const link =
      (formData.get("link") as string | null)?.trim() || "";

    const sortOrderRaw =
      (formData.get("sortOrder") as string | null) || "0";

    const active =
      formData.get("active") === "true";

    const image = formData.get("image");

    // =========================================================
    // VALIDATION
    // =========================================================

    if (!title) {
      return {
        errors: {
          title: "Title is required",
        },
      };
    }

    if (!image || image === "0") {
      return {
        errors: {
          image: "Please select an image",
        },
      };
    }

    const sortOrder = parseInt(sortOrderRaw, 10) || 0;

    // =========================================================
    // UPLOAD IMAGE TO CLOUDINARY
    // =========================================================

    let imageUrl = "";

    try {
      imageUrl = await upload(image);
    } catch (error) {
      console.error(
        "❌ Carousel image upload failed:",
        error
      );

      return {
        errors: {
          image: "Image upload failed",
        },
      };
    }

    // =========================================================
    // FIRESTORE DATA
    // =========================================================

    const data = {
      title,
      description,
      link,

      // Cloudinary URL
      image: imageUrl,

      sortOrder,
      active,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // =========================================================
    // SAVE TO FIRESTORE
    // =========================================================

    const docRef = await adminDb
      .collection("carousels")
      .add(data);

    // =========================================================
    // REVALIDATE
    // =========================================================

    revalidateTag("carousels", "max");

    revalidatePath("/");
    revalidatePath("/admin/carousel");

    // =========================================================
    // SUCCESS
    // =========================================================

    return {
      success: true,
      message: "Carousel saved successfully",
      id: docRef.id,
    };

  } catch (error) {
    console.error(
      "❌ Failed to save carousel:",
      error
    );

    return {
      errors: {
        general: "Could not save carousel",
      },
    };
  }
}
 
