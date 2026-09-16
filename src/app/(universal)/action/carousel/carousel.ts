"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";
import { upload, deleteImage } from "@/lib/cloudinary";
import { randomUUID } from "crypto";

/* =========================================================
   TYPES
========================================================= */

type UploadCarouselImageResult = | { success: true; message: string; url: string; } | { success?: false; error: string; };

export type CarouselType = {
  id: string;
  image: string;
  title: string;
  description: string;
  link: string;
  sortOrder: number;
  active: boolean;
};

type CarouselResult =
  | {
      success: true;
      message: string;
      carousel?: CarouselType;
      carousels?: CarouselType[];
      id?: string;
      url?: string;
    }
  | {
      success?: false;
      error?: string;
      errors?: Record<string, string>;
    };

type CarouselOrderItem = {
  id: string;
  sortOrder: number;
};

/* =========================================================
   CACHE
========================================================= */

function revalidateCarouselCache() {
  revalidateTag("carousels", "max");

  revalidatePath("/");
  revalidatePath("/admin/carousel");
}

/* =========================================================
   FETCH CAROUSELS
========================================================= */

export async function fetchCarousels(): Promise<CarouselType[]> {
  try {
    const snapshot = await adminDb
      .collection("carousels")
      .orderBy("sortOrder", "asc")
      .get();

    const carousels: CarouselType[] = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        image: data?.image ?? "",
        title: data?.title ?? "",
        description: data?.description ?? "",
        link: data?.link ?? "",
        sortOrder: data?.sortOrder ?? 0,
        active: data?.active ?? true,
      };
    });

    return carousels;
  } catch (error) {
    console.error(
      "❌ Failed to fetch carousels:",
      error
    );

    return [];
  }
}

/* =========================================================
   UPLOAD CAROUSEL IMAGE
========================================================= */

 
export async function uploadCarouselImage(
  formData: FormData
): Promise<UploadCarouselImageResult> {
  try {
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return {
        error: "Image file is required",
      };
    }

    if (!file.type.startsWith("image/")) {
      return {
        error: "Only image files are allowed",
      };
    }

    let imageUrl: string;

    try {
      imageUrl = await upload(file);
    } catch (error) {
      console.error(
        "❌ Carousel image Cloudinary upload failed:",
        error
      );

      return {
        error: "Image upload failed",
      };
    }

    if (!imageUrl) {
      return {
        error: "Cloudinary upload did not return a URL",
      };
    }

    return {
      success: true,
      message: "Carousel image uploaded successfully",
      url: imageUrl,
    };
  } catch (error) {
    console.error(
      "❌ Failed to upload carousel image:",
      error
    );

    return {
      error: "Image upload failed",
    };
  }
}
 


/* =========================================================
   CREATE CAROUSEL
========================================================= */

export async function createCarousel(
  carousel: Omit<CarouselType, "id">
): Promise<CarouselResult> {
  try {
    if (!carousel.image) {
      return {
        error: "Carousel image is required",
      };
    }

    /* -----------------------------------------------------
       CREATE FIRESTORE DOCUMENT
    ----------------------------------------------------- */

    const id = randomUUID();

    const carouselData: CarouselType = {
      id,
      image: carousel.image,
      title: carousel.title?.trim() ?? "",
      description: carousel.description?.trim() ?? "",
      link: carousel.link?.trim() ?? "",
      sortOrder: carousel.sortOrder ?? 0,
      active: carousel.active ?? true,
    };

    await adminDb
      .collection("carousels")
      .doc(id)
      .set({
        ...carouselData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    /* -----------------------------------------------------
       CACHE
    ----------------------------------------------------- */

    revalidateCarouselCache();

    return {
      success: true,
      message: "Carousel created successfully",
      carousel: carouselData,
      id,
    };
  } catch (error) {
    console.error(
      "❌ Failed to create carousel:",
      error
    );

    return {
      error: "Could not create carousel",
    };
  }
}

/* =========================================================
   UPDATE CAROUSEL
========================================================= */

export async function updateCarousel(
  id: string,
  carousel: Omit<CarouselType, "id">
): Promise<CarouselResult> {
  try {
    if (!id) {
      return {
        error: "Carousel ID is required",
      };
    }

    /* -----------------------------------------------------
       GET DOCUMENT
    ----------------------------------------------------- */

    const carouselRef = adminDb
      .collection("carousels")
      .doc(id);

    const carouselDoc = await carouselRef.get();

    if (!carouselDoc.exists) {
      return {
        error: "Carousel not found",
      };
    }

    /* -----------------------------------------------------
       UPDATE
    ----------------------------------------------------- */

    await carouselRef.update({
      image: carousel.image ?? "",
      title: carousel.title?.trim() ?? "",
      description: carousel.description?.trim() ?? "",
      link: carousel.link?.trim() ?? "",
      sortOrder: carousel.sortOrder ?? 0,
      active: carousel.active ?? true,
      updatedAt: new Date().toISOString(),
    });

    /* -----------------------------------------------------
       CACHE
    ----------------------------------------------------- */

    revalidateCarouselCache();

    return {
      success: true,
      message: "Carousel updated successfully",
    };
  } catch (error) {
    console.error(
      "❌ Failed to update carousel:",
      error
    );

    return {
      error: "Could not update carousel",
    };
  }
}

/* =========================================================
   DELETE CAROUSEL
========================================================= */

export async function deleteCarousel(
  id: string
): Promise<CarouselResult> {
  try {
    if (!id) {
      return {
        error: "Carousel ID is required",
      };
    }

    /* -----------------------------------------------------
       GET DOCUMENT
    ----------------------------------------------------- */

    const carouselRef = adminDb
      .collection("carousels")
      .doc(id);

    const carouselDoc = await carouselRef.get();

    if (!carouselDoc.exists) {
      return {
        error: "Carousel not found",
      };
    }

    const data = carouselDoc.data();

    const imageUrl = data?.image ?? "";

    /* -----------------------------------------------------
       DELETE FIRESTORE DOCUMENT FIRST
    ----------------------------------------------------- */

    await carouselRef.delete();

    /* -----------------------------------------------------
       DELETE CLOUDINARY IMAGE
       
       Same pattern as your existing product image
       deletion.
    ----------------------------------------------------- */

    if (imageUrl) {
      try {
        await deleteImage(imageUrl);
      } catch (cloudinaryError) {
        console.error(
          "⚠️ Cloudinary carousel image deletion failed:",
          cloudinaryError
        );
      }
    }

    /* -----------------------------------------------------
       CACHE
    ----------------------------------------------------- */

    revalidateCarouselCache();

    return {
      success: true,
      message: "Carousel deleted successfully",
    };
  } catch (error) {
    console.error(
      "❌ Failed to delete carousel:",
      error
    );

    return {
      error: "Could not delete carousel",
    };
  }
}

/* =========================================================
   UPDATE CAROUSEL ORDER
========================================================= */

export async function updateCarouselOrder(
  items: CarouselOrderItem[]
): Promise<CarouselResult> {
  try {
    if (!Array.isArray(items) || items.length === 0) {
      return {
        error: "Carousel order is required",
      };
    }

    /* -----------------------------------------------------
       FIRESTORE BATCH
    ----------------------------------------------------- */

    const batch = adminDb.batch();

    for (const item of items) {
      if (!item.id) {
        continue;
      }

      const carouselRef = adminDb
        .collection("carousels")
        .doc(item.id);

      batch.update(carouselRef, {
        sortOrder: item.sortOrder,
        updatedAt: new Date().toISOString(),
      });
    }

    await batch.commit();

    /* -----------------------------------------------------
       CACHE
    ----------------------------------------------------- */

    revalidateCarouselCache();

    return {
      success: true,
      message: "Carousel order updated successfully",
    };
  } catch (error) {
    console.error(
      "❌ Failed to update carousel order:",
      error
    );

    return {
      error: "Could not update carousel order",
    };
  }
}
 
