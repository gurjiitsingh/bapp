"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { InventoryItemType } from "@/lib/types/InventoryItemType";

export const repairFetchInventoryItemById = async (
  inventoryItemId: string
): Promise<InventoryItemType | null> => {


  try {
    if (!inventoryItemId) {
      console.error("❌ Inventory item ID is empty");
      return null;
    }

    const id = inventoryItemId.trim();

    console.log("🔍 ID after trim:", id);

    console.log("🔍 Firestore collection:", "inventoryItems");
    console.log("🔍 Firestore document ID:", id);

    const docRef = adminDb
      .collection("inventoryItems")
      .doc(id);

    console.log("🔍 Document path:", docRef.path);

    const doc = await docRef.get();

    console.log("📄 Document exists:", doc.exists);
    console.log("📄 Document ID returned:", doc.id);

    if (!doc.exists) {
      console.error("❌ INVENTORY ITEM NOT FOUND");
      console.error("❌ Requested ID:", id);
      console.error("❌ Document path:", docRef.path);

      return null;
    }

    const data = doc.data();

    console.log("✅ INVENTORY ITEM FOUND");
    console.log("📄 Firestore doc.id:", doc.id);
    console.log("📄 Firestore data:", data);

    if (!data) {
      console.error("❌ Document exists but data is empty");
      return null;
    }

    const purchaseMappings = Array.isArray(data.purchaseMappings)
      ? data.purchaseMappings.map((mapping: any) => ({
          purchaseUnit:
            mapping.purchaseUnit ||
            data.purchaseUnit ||
            data.consumptionUnit ||
            "pcs",

          consumptionUnit:
            mapping.consumptionUnit ||
            data.consumptionUnit ||
            "pcs",

          factor:
            Number(mapping.factor) || 1,
        }))
      : [];

    const result = {
      id: doc.id,

      name: data.name || "",
      sku: data.sku || "",
      barcode: data.barcode || "",

      consumptionUnit:
        data.consumptionUnit || "pcs",

      purchaseMappings,

      currentStock:
        Number(data.currentStock) || 0,

      minStock:
        Number(data.minStock) || 0,

      averageCost:
        Number(data.averageCost) || 0,

      conversionFactor:
        Number(data.conversionFactor) || 0,

      purchaseUnit:
        data.purchaseUnit || "",

      purchaseUnitCost:
        Number(data.purchaseUnitCost) || 0,

      stockValue:
        Number(data.stockValue) || 0,

      sellingPrice:
        Number(data.sellingPrice) || 0,

      categoryId:
        data.categoryId || "",

      supplierId:
        data.supplierId || "",

      supplierIds:
        data.supplierIds || [],

      isActive:
        data.isActive ?? true,

      createdAt:
        data.createdAt?.toDate?.().toISOString() || null,

      updatedAt:
        data.updatedAt?.toDate?.().toISOString() || null,
    } as InventoryItemType;

  

    return result;

  } catch (error) {

   

    return null;
  }
};