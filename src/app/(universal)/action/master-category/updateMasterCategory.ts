"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidateTag } from "next/cache";

export async function updateMasterCategory(
  id: string,
  formData: FormData
) {
  try {
    const name = formData.get("name");
    const description =
      formData.get("description");

    const sortOrder =
      Number(formData.get("sortOrder")) || 0;

    const icon = formData.get("icon");

    const isActive =
      formData.get("isActive");

    await adminDb
      .collection("masterCategories")
      .doc(id)
      .update({
        name,
        description,
        sortOrder,
        icon,
        isActive,
        updatedAt: Date.now(),
      });

    revalidateTag(
      "masterCategories",
      "max"
    );

    return {
      success: true,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
    };
  }
}