"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { newModifierGroupSchema } from "@/lib/types/modifierGroupType";

export async function updateModifierGroup(id: string, formData: FormData) {
  try {
    const data = {
      name: formData.get("name"),
      minSelection: Number(formData.get("minSelection")),
      maxSelection: Number(formData.get("maxSelection")),
      sortOrder: Number(formData.get("sortOrder")),
      status: formData.get("status"),
    };

    const parsed = newModifierGroupSchema.safeParse(data);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((e) => {
        errors[e.path[0]] = e.message;
      });
      return { errors };
    }

    await adminDb
      .collection("modifierGroups")
      .doc(id)
      .update({
        ...parsed.data,
        updatedAt: new Date().toISOString(),
      });

    return { success: true };
  } catch (e) {
    console.error(e);
    return { errors: { general: "Failed to update" } };
  }
}