"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { tableDataT } from "@/lib/types/tableType";
import admin from "firebase-admin";

export async function saveTables(formData: FormData) {
  try {
    const tableCount = Number(formData.get("tableCount") || 0);
    if (!tableCount || tableCount <= 0) {
      return { success: false, error: "Invalid table count" };
    }

    for (let i = 1; i <= tableCount; i++) {
      const id = `T${i}`;
      const tableData: Partial<tableDataT> = {
        id,
        tableName: `Table ${i}`,
        status: "AVAILABLE",
          createdAt: admin.firestore.FieldValue.serverTimestamp(), // ✅ Firestore handles
        updatedAt: admin.firestore.FieldValue.serverTimestamp(), // ✅ Firestore handles
        synced: true,
      };

      await adminDb.collection("tables").doc(id).set(tableData, { merge: true });
      console.log(`✅ Added ${id}`);
    }

    revalidatePath("/admin/settings/tables");
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to save tables:", error);
    return { success: false, error: "Failed to create tables" };
  }
}




export async function getTables(): Promise<tableDataT[]> {
  const snapshot = await adminDb.collection("tables").get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: data.id ?? doc.id,
      tableName: data.tableName ?? doc.id,
      status: data.status ?? "AVAILABLE",
      waiterName: data.waiterName ?? "",
      waiterId: data.waiterId ?? "",
      activeOrderId: data.activeOrderId ?? "",
      guestsCount: data.guestsCount ?? 0,
      createdAt: data.createdAt?.toDate?.() ?? null,
      updatedAt: data.updatedAt?.toDate?.() ?? null,
      notes: data.notes ?? "",
      synced: data.synced ?? false,
    };
  });
}