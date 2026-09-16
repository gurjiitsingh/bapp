"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { ProductImageType } from "@/lib/types/productType";

import { revalidatePath, revalidateTag } from "next/cache";

import { upload, deleteImage } from "@/lib/cloudinary";

import { randomUUID } from "crypto";

/* =========================================================
   TYPES
========================================================= */

type ProductImagesResult =
  | {
      success: true;
      message: string;
      images: ProductImageType[];
    }
  | {
      success?: false;
      errors: Record<string, string>;
    };

/* =========================================================
   FETCH PRODUCT IMAGES
========================================================= */

export async function fetchProductImages(
  productId: string
): Promise<ProductImageType[]> {
  try {
    if (!productId) {
      return [];
    }

    const productDoc = await adminDb
      .collection("products")
      .doc(productId)
      .get();

    if (!productDoc.exists) {
      return [];
    }

    const data = productDoc.data();

    const images = Array.isArray(data?.images)
      ? (data.images as ProductImageType[])
      : [];

    return images.sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );
  } catch (error) {
    console.error(
      "❌ Failed to fetch product images:",
      error
    );

    return [];
  }
}

/* =========================================================
   ADD PRODUCT IMAGE
========================================================= */

export async function addProductImage(
  productId: string,
  formData: FormData
): Promise<ProductImagesResult> {
  try {
    if (!productId) {
      return {
        errors: {
          general: "Product ID is required",
        },
      };
    }

    /* -----------------------------------------------------
       GET PRODUCT
    ----------------------------------------------------- */

    const productRef = adminDb
      .collection("products")
      .doc(productId);

    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return {
        errors: {
          general: "Product not found",
        },
      };
    }

    /* -----------------------------------------------------
       CHECK EXISTING IMAGES
    ----------------------------------------------------- */

    const productData = productDoc.data();

    const existingImages: ProductImageType[] =
      Array.isArray(productData?.images)
        ? (productData.images as ProductImageType[])
        : [];

    /* -----------------------------------------------------
       MAX 4 ADDITIONAL IMAGES
    ----------------------------------------------------- */

    if (existingImages.length >= 4) {
      return {
        errors: {
          images: "Maximum 4 additional images are allowed",
        },
      };
    }

    /* -----------------------------------------------------
       FORM DATA
    ----------------------------------------------------- */

    const name =
      (formData.get("name") as string | null)?.trim() ||
      `Image ${existingImages.length + 1}`;

    const image = formData.get("image");

    if (!image || image === "0") {
      return {
        errors: {
          image: "Please select an image",
        },
      };
    }

    /* -----------------------------------------------------
       UPLOAD TO CLOUDINARY
    ----------------------------------------------------- */

    let imageUrl: string;

    try {
      imageUrl = await upload(image);
    } catch (error) {
      console.error(
        "❌ Product image upload failed:",
        error
      );

      return {
        errors: {
          image: "Image upload failed",
        },
      };
    }

    /* -----------------------------------------------------
       CREATE IMAGE OBJECT
    ----------------------------------------------------- */

    const nextSortOrder =
      existingImages.length > 0
        ? Math.max(
            ...existingImages.map(
              (image) => image.sortOrder ?? 0
            )
          ) + 1
        : 1;

    const newImage: ProductImageType = {
      id: randomUUID(),
      url: imageUrl,
      name,
      sortOrder: nextSortOrder,
    };

    /* -----------------------------------------------------
       UPDATE PRODUCT
    ----------------------------------------------------- */

    const updatedImages = [
      ...existingImages,
      newImage,
    ];

    await productRef.update({
      images: updatedImages,
      updatedAt: new Date().toISOString(),
    });

    /* -----------------------------------------------------
       CACHE
    ----------------------------------------------------- */

    revalidateTag("products", "max");
    revalidateTag("featured-products", "max");
    revalidateTag("stock-products-updated", "max");

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product image added successfully",
      images: updatedImages,
    };
  } catch (error) {
    console.error(
      "❌ Failed to add product image:",
      error
    );

    return {
      errors: {
        general: "Could not add product image",
      },
    };
  }
}




type UploadProductImageResult = {
  success?: boolean;
  url?: string;
  error?: string;
};

export async function uploadProductImage(
  productId: string,
  imageId: string,
  formData: FormData
): Promise<UploadProductImageResult> {
  try {
    // =====================================================
    // VALIDATION
    // =====================================================

    if (!productId) {
      return {
        error: "Product ID is required",
      };
    }

    if (!imageId) {
      return {
        error: "Image ID is required",
      };
    }

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

    // =====================================================
    // CLOUDINARY UPLOAD
    // =====================================================

    const imageUrl = await upload(file);

    if (!imageUrl) {
      return {
        error: "Cloudinary upload did not return a URL",
      };
    }

    // =====================================================
    // RETURN URL
    // =====================================================

    return {
      success: true,
      url: imageUrl,
    };
  } catch (error) {
    console.error(
      "❌ Cloudinary product image upload failed:",
      error
    );

    return {
      error: "Image upload failed",
    };
  }
}
/* =========================================================
   UPDATE PRODUCT IMAGES
   Used for reorder / rename
========================================================= */

export async function updateProductImages(
  productId: string,
  images: ProductImageType[]
): Promise<ProductImagesResult> {
  try {
    if (!productId) {
      return {
        errors: {
          general: "Product ID is required",
        },
      };
    }

    if (!Array.isArray(images)) {
      return {
        errors: {
          images: "Invalid image data",
        },
      };
    }

    /* -----------------------------------------------------
       LIMIT
    ----------------------------------------------------- */

    if (images.length > 4) {
      return {
        errors: {
          images: "Maximum 4 additional images are allowed",
        },
      };
    }

    /* -----------------------------------------------------
       NORMALIZE SORT ORDER
    ----------------------------------------------------- */

    const normalizedImages: ProductImageType[] =
      images.map((image, index) => ({
        id: image.id || randomUUID(),

        url: image.url,

        name:
          image.name?.trim() ||
          `Image ${index + 1}`,

        sortOrder: index + 1,
      }));

    /* -----------------------------------------------------
       UPDATE FIRESTORE
    ----------------------------------------------------- */

    await adminDb
      .collection("products")
      .doc(productId)
      .update({
        images: normalizedImages,
        updatedAt: new Date().toISOString(),
      });

    /* -----------------------------------------------------
       CACHE
    ----------------------------------------------------- */

    revalidateTag("products", "max");
    revalidateTag("featured-products", "max");

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product images updated successfully",
      images: normalizedImages,
    };
  } catch (error) {
    console.error(
      "❌ Failed to update product images:",
      error
    );

    return {
      errors: {
        general: "Could not update product images",
      },
    };
  }
}

/* =========================================================
   DELETE PRODUCT IMAGE
========================================================= */

export async function deleteProductImage(
  productId: string,
  imageId: string
): Promise<ProductImagesResult> {
  try {
    if (!productId) {
      return {
        errors: {
          general: "Product ID is required",
        },
      };
    }

    if (!imageId) {
      return {
        errors: {
          image: "Image ID is required",
        },
      };
    }

    /* -----------------------------------------------------
       GET PRODUCT
    ----------------------------------------------------- */

    const productRef = adminDb
      .collection("products")
      .doc(productId);

    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return {
        errors: {
          general: "Product not found",
        },
      };
    }

    const productData = productDoc.data();

    const existingImages: ProductImageType[] =
      Array.isArray(productData?.images)
        ? (productData.images as ProductImageType[])
        : [];

    /* -----------------------------------------------------
       FIND IMAGE
    ----------------------------------------------------- */

    const imageToDelete = existingImages.find(
      (image) => image.id === imageId
    );

    if (!imageToDelete) {
      return {
        errors: {
          image: "Product image not found",
        },
      };
    }

    /* -----------------------------------------------------
       REMOVE FROM ARRAY
    ----------------------------------------------------- */

    const remainingImages = existingImages
      .filter((image) => image.id !== imageId)
      .map((image, index) => ({
        ...image,
        sortOrder: index + 1,
      }));

    /* -----------------------------------------------------
       UPDATE FIRESTORE FIRST
    ----------------------------------------------------- */

    await productRef.update({
      images: remainingImages,
      updatedAt: new Date().toISOString(),
    });

    /* -----------------------------------------------------
       DELETE FROM CLOUDINARY
       
       IMPORTANT:
       This depends on what your existing `deleteImage`
       function expects.
       
       If deleteImage expects a Cloudinary public ID,
       your ProductImageType should eventually store it.
    ----------------------------------------------------- */

    try {
      if (imageToDelete.url) {
        await deleteImage(imageToDelete.url);
      }
    } catch (cloudinaryError) {
      /*
       * Do not fail the database operation if the image
       * has already disappeared from Cloudinary.
       */
      console.error(
        "⚠️ Cloudinary image deletion failed:",
        cloudinaryError
      );
    }

    /* -----------------------------------------------------
       CACHE
    ----------------------------------------------------- */

    revalidateTag("products", "max");
    revalidateTag("featured-products", "max");

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product image deleted successfully",
      images: remainingImages,
    };
  } catch (error) {
    console.error(
      "❌ Failed to delete product image:",
      error
    );

    return {
      errors: {
        general: "Could not delete product image",
      },
    };
  }
}

