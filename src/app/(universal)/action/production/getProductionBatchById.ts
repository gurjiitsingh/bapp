"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function getProductionBatchById(batchId: string) {
    console.log("bathid------", batchId)
  try {
    const batchRef = adminDb
      .collection("production_batches")
      .doc(batchId);

    const batchSnap = await batchRef.get();

    if (!batchSnap.exists) {
      return { success: false, message: "Batch not found" };
    }

    const batchData = batchSnap.data()!;

    // ✅ Fetch items
    const itemsSnap = await adminDb
      .collection("production_batch_items")
      .where("batchId", "==", batchId)
      .get();

    const items = itemsSnap.docs.map((doc) => {
      const d = doc.data();

      return {
        id: doc.id,
        inventoryItemName: d.inventoryItemName || "",
        quantity: Number(d.quantity) || 0,
        unit: d.transactionUnit || "",
        costPerUnit: Number(d.unitCost) || 0,
        totalCost:
          (Number(d.quantity) || 0) *
          (Number(d.unitCost) || 0),
      };
    });

    return {
      success: true,
      data: {
        id: batchSnap.id,
        departmentName: batchData.departmentName || "",
        note: batchData.note || "",
        isClosed: batchData.isClosed || false,

        // ✅ FIX timestamp
        createdAt: batchData.createdAt?.toMillis?.() || 0,

        items,
      },
    };
  } catch (error: any) {
    console.error(error);

    return {
      success: false,
      message: error.message || "Failed to load batch",
    };
  }
}