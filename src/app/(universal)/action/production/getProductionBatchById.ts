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
    const getItemTotal = (item: any) =>
      item.quantity * item.averageCost * item.conversionFactor;

    

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
        costPerUnit: Number(d.costPerUnit) || 0,
        conversionFactor: Number(d.conversionFactor) || 0,
        purchaseUnit: d.purchaseUnit || "",
        consumptionUnit: d.consumptionUnit || "",
        averageCost: Number(d.averageCost) || 0,
        totalCost: Number(d.totalCost) || 0,

      };
    });

  return {
  success: true,
  data: {
    id: batchSnap.id,
    departmentName: batchData.departmentName || "",

    avgCostPerUnit: batchData.avgCostPerUnit || 0,
    outputQty: batchData.outputQty || 0,
    totalCost: batchData.totalCost || 0,
    sellingPrice: batchData.sellingPrice || 0,

    note: batchData.note || "",

    status: batchData.status || "OPEN",

    startTime: batchData.startTime
      ? batchData.startTime.toMillis()
      : null,

    endTime: batchData.endTime
      ? batchData.endTime.toMillis()
      : null,

    items,

    calculatedTotalCost: items.reduce(
      (sum, item) => sum + getItemTotal(item),
      0
    ),
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