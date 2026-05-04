"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { newModifierGroupSchema } from "@/lib/types/modifierGroupType";

export async function addModifierGroup(formData: FormData) {
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

    await adminDb.collection("modifierGroups").add({
      ...parsed.data,
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (e) {
    console.error(e);
    return { errors: { general: "Failed to save" } };
  }
}


export async function getModifierGroups() {
  try {
    const snap = await adminDb
      .collection("modifierGroups")
      .where("status", "==", "published")
     // .orderBy("sortOrder", "asc")
      .get();

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (e) {
    console.error("Failed to fetch modifier groups", e);
    return [];
  }
}