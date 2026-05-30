"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { InventoryItemType, newInventorySchema } from "@/lib/types/InventoryItemType";
import admin from "firebase-admin";


import { revalidatePath, revalidateTag } from "next/cache";

export async function addNewInventoryItem(
  formData: FormData
) {
  console.log("inventory save-------------");

  try {
    // FORM VALUES
    const name = formData.get("name") as string;

    const sku = formData.get("sku") as string | null;

    const barcode = formData.get("barcode") as string | null;

    const purchaseUnit = formData.get(
      "purchaseUnit"
    ) as
      | "pcs"
      | "kg"
      | "gm"
      | "ltr"
      | "ml";

    const consumptionUnit = formData.get(
      "consumptionUnit"
    ) as
      | "pcs"
      | "kg"
      | "gm"
      | "ltr"
      | "ml";

    const conversionFactorRaw =
      formData.get(
        "conversionFactor"
      ) as string | null;

    const conversionFactor =
      conversionFactorRaw
        ? parseFloat(
          conversionFactorRaw
        )
        : 1;

    const currentStockRaw = formData.get(
      "currentStock"
    ) as string | null;

    const minStockRaw = formData.get(
      "minStock"
    ) as string | null;

    const costPriceRaw = formData.get(
      "costPrice"
    ) as string | null;

    const sellingPriceRaw = formData.get(
      "sellingPrice"
    ) as string | null;

    const categoryId = formData.get(
      "categoryId"
    ) as string | null;

    const supplierId = formData.get(
      "supplierId"
    ) as string | null;

    const isActive =
      formData.get("isActive") === "true";

    // SAFE NUMBER CONVERSION
    const currentStock = currentStockRaw
      ? parseFloat(currentStockRaw)
      : 0;

    const minStock = minStockRaw
      ? parseFloat(minStockRaw)
      : 0;

    const costPrice = costPriceRaw
      ? parseFloat(costPriceRaw)
      : 0;

    const sellingPrice = sellingPriceRaw
      ? parseFloat(sellingPriceRaw)
      : 0;

    // VALIDATION OBJECT
    const receivedData = {
      name,
      sku: sku || "",
      barcode: barcode || "",
      purchaseUnit,
      consumptionUnit,
      conversionFactor,
      currentStock,
      minStock,
      costPrice,
      sellingPrice,
      categoryId: categoryId || "",
      supplierId: supplierId || "",
      isActive,
    };

    // ZOD VALIDATION
    const result =
      newInventorySchema.safeParse(receivedData);

    if (!result.success) {
      const zodErrors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        zodErrors[issue.path[0]] =
          issue.message;
      });

      return {
        errors: zodErrors,
      };
    }

    // FIRESTORE DATA
    const data = {
  name,

  sku: sku || "",

  barcode: barcode || "",

  purchaseUnit,

  consumptionUnit,

  conversionFactor,

  currentStock,

  minStock,

  costPrice,

  sellingPrice,

  categoryId: categoryId || "",

  supplierId: supplierId || "",

  isActive,

  createdAt:
    admin.firestore.FieldValue.serverTimestamp(),

  updatedAt:
    admin.firestore.FieldValue.serverTimestamp(),
};

    console.log(
      "inventory data-------------",
      data
    );

    // SAVE TO FIRESTORE
    const docRef = await adminDb
      .collection("inventoryItems")
      .add(data);

    // REVALIDATE
    revalidateTag("inventory-items", "max");

    revalidatePath("/admin/inventory");

    revalidatePath("/admin/inventory/form");

    return {
      success: true,

      message:
        "Inventory item saved successfully",

      id: docRef.id,
    };
  } catch (error) {
    console.error(
      "❌ Inventory save failed:",
      error
    );

    return {
      errors: {
        general:
          "Could not save inventory item",
      },
    };
  }
}



import { cache } from "react";

// FETCH ALL INVENTORY ITEMS
export const fetchInventoryItems = cache(
  async (): Promise<InventoryItemType[]> => {
    try {
      const snapshot = await adminDb
        .collection("inventoryItems")
        .orderBy("createdAt", "desc")
        .get();

      const inventoryItems =
        snapshot.docs.map((doc) => {
          const data = doc.data();

        return {
  id: doc.id,

  name: data.name || "",

  sku: data.sku || "",

  barcode: data.barcode || "",

  purchaseUnit:
    data.purchaseUnit || "pcs",

  consumptionUnit:
    data.consumptionUnit || "pcs",

  conversionFactor:
    data.conversionFactor || 1,

  currentStock:
    data.currentStock || 0,

  minStock:
    data.minStock || 0,

  costPrice:
    data.costPrice || 0,

  sellingPrice:
    data.sellingPrice || 0,

  categoryId:
    data.categoryId || "",

  supplierId:
    data.supplierId || "",

  isActive:
    data.isActive ?? true,

  createdAt:
    data.createdAt,

  updatedAt:
    data.updatedAt,
};
        }) as InventoryItemType[];

      return inventoryItems;
    } catch (error) {
      console.error(
        "❌ Error fetching inventory items:",
        error
      );

      return [];
    }
  }
);



// FETCH SINGLE INVENTORY ITEM
export async function fetchInventoryItemById(
  id: string
): Promise<InventoryItemType | null> {
  try {
    const docRef = await adminDb
      .collection("inventoryItems")
      .doc(id)
      .get();

    if (!docRef.exists) {
      return null;
    }

    return {
      id: docRef.id,
      ...docRef.data(),
    } as InventoryItemType;
  } catch (error) {
    console.error(
      "❌ Error fetching inventory item:",
      error
    );

    return null;
  }
}

