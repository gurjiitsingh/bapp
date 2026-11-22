
"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function getExpenseMasterAll() {
  try {
    const snapshot = await adminDb
      .collection("expenseMaster")
      .get();

    const expenses = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        name: data.name ?? "",
        cost: data.cost ?? 0,
        unit: data.unit ?? "",
        description: data.description ?? "",
        isFavourite: data.isFavourite ?? false,
        isActive: data.isActive ?? true,

        createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
        modifiedAt: data.modifiedAt?.toDate?.().toISOString() ?? null,
      };
    });

    return {
      success: true,
      data: expenses,
    };

  } catch (error) {
    console.error("Error fetching expense master:", error);

    return {
      success: false,
      message: "Failed to fetch expense master",
      data: [],
    };
  }
}
