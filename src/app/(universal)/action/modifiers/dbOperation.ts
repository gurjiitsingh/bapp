"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { newModifierItemSchema } from "@/lib/types/modifierItemType";

export async function addModifierItem(formData: FormData) {
  try {
    const data = {
      name: formData.get("name"),
      groupId: formData.get("groupId"),
      price: Number(formData.get("price")),
      sortOrder: Number(formData.get("sortOrder")),
      status: formData.get("status"),
      isDefault: formData.get("isDefault") === "true",
    };

    const parsed = newModifierItemSchema.safeParse(data);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((e) => {
        errors[e.path[0]] = e.message;
      });
      return { errors };
    }

    await adminDb.collection("modifierItems").add({
      ...parsed.data,
      priceMap: {},
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (e) {
    console.error(e);
    return { errors: { general: "Failed to save" } };
  }
}