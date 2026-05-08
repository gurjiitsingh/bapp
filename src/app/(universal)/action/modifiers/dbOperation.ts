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




// export async function getModifierGroupsWithItems(productId: string) {
//   try {
//     // 1. Get mapping (product → groupIds)
//     const mappingSnap = await adminDb
//       .collection("productModifiers")
//       .where("productId", "==", productId)
//       .get();

//     const groupIds = mappingSnap.docs.map((doc) => doc.data().groupId);

//     if (groupIds.length === 0) return [];

//     // 2. Get groups
//     const groupSnap = await adminDb
//       .collection("modifierGroups")
//       .where("__name__", "in", groupIds)
//       .get();

//     const groups = groupSnap.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));

//     // 3. Get all items for these groups
//     const itemsSnap = await adminDb
//       .collection("modifierItems")
//       .where("groupId", "in", groupIds)
//       .get();

//     const items = itemsSnap.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));

//     // 4. Map group → items
//     const result = groups.map((group) => ({
//       group,
//       items: items
//         .filter((item) => item.groupId === group.id)
//         .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
//     }));
    

//     return result;
//   } catch (error) {
//     console.error("Error fetching modifiers:", error);
//     return [];
//   }
// }