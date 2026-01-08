"use server";

import { categorySchema, editCategorySchema } from "@/lib/types/categoryType";
import { deleteImage, upload } from "@/lib/cloudinary";
import { categoryType } from "@/lib/types/categoryType";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidateTag } from "next/cache";


//  Removed all incorrect Firestore imports from firebase-admin
// You already use the correct admin SDK syntax

export async function fetchCategories(): Promise<categoryType[]> {
  const snapshot = await adminDb.collection("category").get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      name: data.name,
      desc: data.desc,
      productDesc: data.productDesc,
      slug: data.slug,
      image: data.image,
      isFeatured: data.isFeatured,
      sortOrder: data.sortOrder,
      disablePickupDiscount: data.disablePickupDiscount,
       // tax fields
        taxRate: data.taxRate ,
        taxType: data.taxType ,
    } as categoryType;
  });
}



export async function deleteCategory(id: string, oldImageUrl: string) {
  const docRef = adminDb.collection("category").doc(id);
  await docRef.delete();

  const imageUrlArray = oldImageUrl.split("/");
  const imageName =
    imageUrlArray[imageUrlArray.length - 2] +
    "/" +
    imageUrlArray[imageUrlArray.length - 1];
  const image_public_id = imageName.split(".")[0];

  try {
    const deleteResult = await deleteImage(image_public_id);
      revalidateTag("categories", "max");
    console.log("image delete data", deleteResult);
  } catch (error) {
    console.log(error);
    return { errors: "Something went wrong, cannot delete product picture" };
  }

  return {
    message: { success: "Deleted product" },
  };
}



export async function addNewCategory(formData: FormData) {
  const name = formData.get("name");
  const desc = formData.get("desc");
  const sortOrder = formData.get("sortOrder");
  const image = formData.get("image");
  const isFeatured = formData.get("isFeatured");
   const taxRateRaw = formData.get("taxRate") as string ;
    const taxType = formData.get("taxType") as string ;
     const taxRate = taxRateRaw ? parseFloat(taxRateRaw) : null;

  const receivedData = { name, desc, sortOrder, image, isFeatured };

  const result = categorySchema.safeParse(receivedData);
  let zodErrors = {};
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      zodErrors = { ...zodErrors, [issue.path[0]]: issue.message };
    });
    return { errors: zodErrors };
  }

  let imageUrl;
  if (image === "0") {
    imageUrl = "/com-1.jpg";
  } else {
    try {
      imageUrl = await upload(image);
    } catch (error) {
      console.log(error);
      return { errors: "Image cannot be uploaded" };
    }
  }

  const data = { name, desc, sortOrder, image: imageUrl, isFeatured, taxRate, taxType };
 

  try {
    const docRef = await adminDb.collection("category").add(data);
    console.log("Document written with ID: ", docRef.id);

    //  Instantly clear "categories" cached data
     revalidateTag("categories", "max");

    return { message: { success: "Category Created" } };
  } catch (e) {
    console.error("Error adding document: ", e);
    return { errors: "Failed to add category" };
  }
}



export async function editCategory(formData: FormData) {
  console.log("form---------------",formData)
  const id = formData.get("id") as string;
  const image = formData.get("image");
  const name = formData.get("name");
  const desc = formData.get("desc");
  const oldImageUrl = formData.get("oldImageUrl") as string;
  const isFeatured = formData.get("isFeatured");
  const sortOrder = formData.get("sortOrder");

  const taxRateRaw = formData.get("taxRate") as string | null;
  const taxType = (formData.get("taxType") as string ) ?? null;
  //  Convert taxRate safely
  const taxRate = taxRateRaw ? parseFloat(taxRateRaw) || null : null;
  const receivedData = {
    id,
    oldImageUrl,
    name,
    desc,
    sortOrder,
    image,
    isFeatured,
    // taxRate, 
    // taxType
  };

  const result = editCategorySchema.safeParse(receivedData);
  let zodErrors = {};
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      zodErrors = { ...zodErrors, [issue.path[0]]: issue.message };
    });
    return { errors: zodErrors };
  }

  let imageUrl;
  // if (image === "undefined" || image === null) {
  //   imageUrl = oldImageUrl;
  // } else {
  //   try {
  //     imageUrl = (await upload(image)) as string;
  //   } catch (error) {
  //     console.log(error);
  //     return { errors: "Image cannot be uploaded" };
  //   }
  // }


 if (image && image !== "undefined") {
    try {
      //  Upload new image
      imageUrl = await upload(image);

      //  Delete old Cloudinary image (skip if default image)
      if (oldImageUrl && !oldImageUrl.includes("/com.jpg")) {
        const oldParts = oldImageUrl.split("/");
        const publicId = oldParts.slice(-2).join("/").split(".")[0];
        // ex: anjana-bhog/xyz123

        try {
          await deleteImage(publicId);
          console.log(" Old Cloudinary image deleted:", publicId);
        } catch (err) {
          console.error("❌ Failed to delete old image:", err);
        }
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      return { errors: "Image could not be uploaded" };
    }
  } else {
    //  Keep old image if no new image uploaded
   // imageUrl = existingProduct?.image || oldImageUrl;
     imageUrl = oldImageUrl;
  }





  const categoryUpdateData = {
    name,
    desc,
    sortOrder,
    image: imageUrl,
    isFeatured,
     taxRate, 
    taxType
  };

  try {
    await adminDb.collection("category").doc(id).set(categoryUpdateData);

    //  REVALIDATE TAG SO /api/categories UPDATES IMMEDIATELY
     revalidateTag("categories", "max");

    return { message: { success: "Category updated" } };
  } catch (error) {
    console.log("error", error);
    return { errors: "Cannot update" };
  }
}


export async function fetchCategoryById(id: string): Promise<categoryType> {
  const docSnap = await adminDb.collection("category").doc(id).get();
  if (!docSnap.exists) {
    throw new Error("No such document!");
  }
  const category = { id: docSnap.id, ...docSnap.data() } as categoryType;
  return category;
}

export async function updateCategoryFlag(
  categoryId: string,
  disablePickupDiscount: boolean
): Promise<void> {
  const categoryRef = adminDb.collection("category").doc(categoryId);
  const snapshot = await categoryRef.get();

  if (snapshot.exists) {
    await categoryRef.set({ disablePickupDiscount }, { merge: true });
  } else {
    await categoryRef.set({
      name: "Unnamed Category",
      disablePickupDiscount,
    });
  }
}



// const categorySchema = z.object({
//   id: z.string().optional(),
//   name: z.string(),
//   desc: z.string(),
//   productDesc: z.string().optional(),
//   slug: z.string().optional(),
//   image: z.string().optional(),
//   isFeatured: z.coerce.boolean().optional(),
//   sortOrder: z.coerce.number().optional(),
//   disablePickupDiscount: z.coerce.boolean().optional(),
// });

export async function uploadCategoryFromCSV(data: any[]) {
 
console.log("First item keys:", Object.keys(data[0]));

  for (const item of data) {
    const parsed = categorySchema.safeParse(item);

    if (!parsed.success) {
      console.warn("Invalid category data:", parsed.error.format());
      continue; // skip invalid rows
    }

    const category = parsed.data as categoryType;

   

    const ref = category.id
      ? adminDb.collection("category").doc(category.id)
      : adminDb.collection("category").doc();

    await ref.set(category, { merge: true });
  }

  console.log(" All categories processed successfully.");
}




export async function uploadCategories1(rawData: any[]) {
  const batch = adminDb.batch();

  for (const item of rawData) {
    const parsed = categorySchema.safeParse(item);
    if (!parsed.success) continue;

    const data = parsed.data as categoryType;
    const ref = data.id
      ? adminDb.collection('category').doc(data.id)
      : adminDb.collection('category').doc();

    batch.set(ref, data, { merge: true });
  }

  await batch.commit();
}