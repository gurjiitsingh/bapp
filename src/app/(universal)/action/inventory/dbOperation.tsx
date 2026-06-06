"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { InventoryItemType, InventoryUnit, newInventorySchema } from "@/lib/types/InventoryItemType";
import admin from "firebase-admin";


import { revalidatePath, revalidateTag } from "next/cache";



export async function addNewInventoryItem(
  formData: FormData
) {
  console.log(
    "inventory save-------------",
    formData
  );

  try {
    // FORM VALUES
    const name =
      (formData.get("name") as string)?.trim() ||
      "";

    const cleanedSku =
      (
        formData.get("sku") as string | null
      )?.trim() || "";

    const cleanedBarcode =
      (
        formData.get(
          "barcode"
        ) as string | null
      )?.trim() || "";

    const purchaseUnit = formData.get(
      "purchaseUnit"
    ) as InventoryUnit;

    const consumptionUnit = formData.get(
      "consumptionUnit"
    ) as InventoryUnit;

    const conversionFactor =
      Number(
        formData.get("conversionFactor")
      ) || 1;

    let currentStock =
      Number(
        formData.get("currentStock")
      ) || 0;

    let minStock =
      Number(
        formData.get("minStock")
      ) || 0;

    const costPrice =
      Number(
        formData.get("costPrice")
      ) || 0;

    const sellingPrice =
      Number(
        formData.get("sellingPrice")
      ) || 0;

    const categoryId =
      (
        formData.get(
          "categoryId"
        ) as string | null
      ) || "";

   const supplierIds =
  formData.getAll(
    "supplierIds"
  ) as string[];


    const isActive =
      formData.get("isActive") === "true";

    // STORE STOCK IN CONSUMPTION UNIT
    if (
      purchaseUnit !== consumptionUnit &&
      conversionFactor > 0
    ) {
      currentStock =
        currentStock * conversionFactor;

         minStock =
        minStock * conversionFactor;
    }

console.log("currentStock--------------", currentStock)

    // VALIDATION OBJECT
 const receivedData = {
  name,
  sku: cleanedSku,
  barcode: cleanedBarcode,

  purchaseUnit,
  consumptionUnit,
  conversionFactor,

  currentStock,
  minStock,

  costPrice,
  sellingPrice,

  categoryId,

  supplierIds,

  isActive,
};
    // ZOD VALIDATION
    const result =
      newInventorySchema.safeParse(
        receivedData
      );

    if (!result.success) {
      const zodErrors: Record<
        string,
        string
      > = {};

      result.error.issues.forEach(
        (issue) => {
          zodErrors[
            issue.path[0] as string
          ] = issue.message;
        }
      );

      return {
        errors: zodErrors,
      };
    }

    // NORMALIZED NAME
    const normalizedName =
      name.toLowerCase();

    // DUPLICATE SKU CHECK
    if (cleanedSku) {
      const skuCheck =
        await adminDb
          .collection(
            "inventoryItems"
          )
          .where(
            "sku",
            "==",
            cleanedSku
          )
          .limit(1)
          .get();

      if (!skuCheck.empty) {
        return {
          errors: {
            sku: "SKU already exists",
          },
        };
      }
    }

    // DUPLICATE BARCODE CHECK
    if (cleanedBarcode) {
      const barcodeCheck =
        await adminDb
          .collection(
            "inventoryItems"
          )
          .where(
            "barcode",
            "==",
            cleanedBarcode
          )
          .limit(1)
          .get();

      if (!barcodeCheck.empty) {
        return {
          errors: {
            barcode:
              "Barcode already exists",
          },
        };
      }
    }

    // DUPLICATE NAME CHECK
    const existingItem =
      await adminDb
        .collection("inventoryItems")
        .where(
          "nameLower",
          "==",
          normalizedName
        )
        .limit(1)
        .get();

    if (!existingItem.empty) {
      return {
        errors: {
          name:
            "Inventory item already exists",
        },
      };
    }

    // FIRESTORE DATA
    const data = {
      name,
      nameLower: normalizedName,

      sku: cleanedSku,
      barcode: cleanedBarcode,

      purchaseUnit,
      consumptionUnit,
      conversionFactor,

      currentStock,
      minStock,

      costPrice,
      sellingPrice,

      categoryId,
   //   supplierId,

      isActive,

      createdAt:
        admin.firestore.FieldValue.serverTimestamp(),

      updatedAt:
        admin.firestore.FieldValue.serverTimestamp(),
    };

 console.log("data--------------------",data)

 // SAVE TO FIRESTORE
const docRef = await adminDb
  .collection("inventoryItems")
  .add(data);

const inventoryItemId =
  docRef.id;

// Create supplier mapping
for (const supplierId of supplierIds) {
  const supplierFormData =
    new FormData();

  supplierFormData.append(
    "inventoryItemId",
    docRef.id
  );

  supplierFormData.append(
    "supplierId",
    supplierId
  );

  supplierFormData.append(
    "preferred",
    "false"
  );

  supplierFormData.append(
    "isActive",
    "true"
  );

  await addInventoryItemSupplier(
    supplierFormData
  );
}

// REVALIDATE
revalidateTag(
  "inventory-items",
  "max"
);

    revalidatePath(
      "/admin/inventory"
    );

    revalidatePath(
      "/admin/inventory/form"
    );

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
import { addInventoryItemSupplier } from "../inventoryItemSupplier/addInventoryItemSupplier";

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
              data.createdAt?.toDate?.().toISOString() ||
              null,

            updatedAt:
              data.updatedAt?.toDate?.().toISOString() ||
              null,
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





export async function deleteInventoryItem(
  id: string
) {
  try {
    // ==========================
    // CHECK RECIPES
    // ==========================

    const recipeSnapshot =
      await adminDb
        .collection("productRecipes")
        .where(
          "inventoryItemId",
          "==",
          id
        )
        .limit(1)
        .get();

    if (!recipeSnapshot.empty) {
      return {
        success: false,
        message:
          "Inventory item is used in recipes. Remove recipes first.",
      };
    }

    // ==========================
    // CHECK TRANSACTIONS
    // ==========================

    const transactionSnapshot =
      await adminDb
        .collection(
          "inventoryTransactions"
        )
        .where(
          "inventoryItemId",
          "==",
          id
        )
        .limit(1)
        .get();

    if (
      !transactionSnapshot.empty
    ) {
      return {
        success: false,
        message:
          "Inventory item has transaction history and cannot be deleted.",
      };
    }

    // ==========================
    // DELETE INVENTORY
    // ==========================

    await adminDb
      .collection("inventoryItems")
      .doc(id)
      .delete();

    // ==========================
    // REVALIDATE
    // ==========================

    revalidateTag(
      "inventory-items",
      "max"
    );

    revalidatePath(
      "/admin/inventory"
    );

    revalidatePath(
      "/admin/inventory/form"
    );

    revalidatePath(
      "/admin/inventory/editform"
    );

    return {
      success: true,
      message:
        "Inventory item deleted successfully",
    };
  } catch (error) {
    console.error(
      "❌ Error deleting inventory item:",
      error
    );

    return {
      success: false,
      message:
        "Failed to delete inventory item",
    };
  }
}



export async function updateInventoryItem(
  id: string,
  formData: FormData
) {
  try {
    const name =
      (formData.get("name") as string)?.trim() ||
      "";

    const cleanedSku =
      (
        formData.get("sku") as string | null
      )?.trim() || "";

    const cleanedBarcode =
      (
        formData.get(
          "barcode"
        ) as string | null
      )?.trim() || "";

    const purchaseUnit = formData.get(
      "purchaseUnit"
    ) as InventoryUnit;

    const consumptionUnit = formData.get(
      "consumptionUnit"
    ) as InventoryUnit;

    const conversionFactor =
      Number(
        formData.get("conversionFactor")
      ) || 1;

    let currentStock =
      Number(
        formData.get("currentStock")
      ) || 0;

    const minStock =
      Number(
        formData.get("minStock")
      ) || 0;

    const costPrice =
      Number(
        formData.get("costPrice")
      ) || 0;

    const sellingPrice =
      Number(
        formData.get("sellingPrice")
      ) || 0;

    const categoryId =
      (
        formData.get(
          "categoryId"
        ) as string | null
      ) || "";

    // const supplierId =
    //   (
    //     formData.get(
    //       "supplierId"
    //     ) as string | null
    //   ) || "";

const supplierIds =
  formData.getAll(
    "supplierIds"
  ) as string[];

    const isActive =
      formData.get("isActive") === "true";

    // STORE STOCK IN CONSUMPTION UNIT
    if (
      purchaseUnit !== consumptionUnit &&
      conversionFactor > 0
    ) {
      currentStock =
        currentStock * conversionFactor;
    }

    // VALIDATION
    const receivedData = {
      name,
      sku: cleanedSku,
      barcode: cleanedBarcode,

      purchaseUnit,
      consumptionUnit,
      conversionFactor,

      currentStock,
      minStock,

      costPrice,
      sellingPrice,

      categoryId,
      supplierIds,

      isActive,
    };

    const result =
      newInventorySchema.safeParse(
        receivedData
      );

    if (!result.success) {
      const zodErrors: Record<
        string,
        string
      > = {};

      result.error.issues.forEach(
        (issue) => {
          zodErrors[
            issue.path[0] as string
          ] = issue.message;
        }
      );

      return {
        errors: zodErrors,
      };
    }

    const normalizedName =
      name.toLowerCase();

    // DUPLICATE NAME CHECK
    const nameCheck =
      await adminDb
        .collection("inventoryItems")
        .where(
          "nameLower",
          "==",
          normalizedName
        )
        .get();

    const duplicateName =
      nameCheck.docs.find(
        (doc) => doc.id !== id
      );

    if (duplicateName) {
      return {
        errors: {
          name:
            "Inventory item already exists",
        },
      };
    }

    // DUPLICATE SKU CHECK
    if (cleanedSku) {
      const skuCheck =
        await adminDb
          .collection(
            "inventoryItems"
          )
          .where(
            "sku",
            "==",
            cleanedSku
          )
          .get();

      const duplicateSku =
        skuCheck.docs.find(
          (doc) => doc.id !== id
        );

      if (duplicateSku) {
        return {
          errors: {
            sku: "SKU already exists",
          },
        };
      }
    }

    // DUPLICATE BARCODE CHECK
    if (cleanedBarcode) {
      const barcodeCheck =
        await adminDb
          .collection(
            "inventoryItems"
          )
          .where(
            "barcode",
            "==",
            cleanedBarcode
          )
          .get();

      const duplicateBarcode =
        barcodeCheck.docs.find(
          (doc) => doc.id !== id
        );

      if (duplicateBarcode) {
        return {
          errors: {
            barcode:
              "Barcode already exists",
          },
        };
      }
    }

    const data = {
      name,
      nameLower: normalizedName,

      sku: cleanedSku,
      barcode: cleanedBarcode,

      purchaseUnit,
      consumptionUnit,
      conversionFactor,

      currentStock,
      minStock,

      costPrice,
      sellingPrice,

      categoryId,
      

      isActive,

      updatedAt:
        admin.firestore.FieldValue.serverTimestamp(),
    };

    await adminDb
      .collection("inventoryItems")
      .doc(id)
      .update(data);

      // ==========================
// UPDATE SUPPLIER MAPPINGS
// ==========================

const existingMappings =
  await adminDb
    .collection(
      "inventoryItemSuppliers"
    )
    .where(
      "inventoryItemId",
      "==",
      id
    )
    .get();

const batch =
  adminDb.batch();

existingMappings.docs.forEach(
  (doc) => {
    batch.delete(
      doc.ref
    );
  }
);

await batch.commit();

for (const supplierId of supplierIds) {
  const supplierFormData =
    new FormData();

  supplierFormData.append(
    "inventoryItemId",
    id
  );

  supplierFormData.append(
    "supplierId",
    supplierId
  );

  supplierFormData.append(
    "preferred",
    "false"
  );

  supplierFormData.append(
    "isActive",
    "true"
  );

  await addInventoryItemSupplier(
    supplierFormData
  );
}

    revalidateTag(
      "inventory-items",
      "max"
    );

    revalidatePath(
      "/admin/inventory"
    );

    revalidatePath(
      "/admin/inventory/editform"
    );

    return {
      success: true,
      message:
        "Inventory updated successfully",
    };
  } catch (error) {
    console.error(
      "❌ Inventory update failed:",
      error
    );

    return {
      success: false,
      message:
        "Failed to update inventory",
    };
  }
}


// FETCH SINGLE INVENTORY ITEM
export async function fetchInventoryItemById(
  id: string
): Promise<InventoryItemType | null> {

  console.log("id----------------",id)
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



export async function getInventoryItemById(
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

    const data = docRef.data();

    return {
      id: docRef.id,

      ...data,

      createdAt: data?.createdAt
        ? data.createdAt.toMillis()
        : null,

      updatedAt: data?.updatedAt
        ? data.updatedAt.toMillis()
        : null,
    } as any;
  } catch (error) {
    console.error(
      "❌ Error fetching inventory item:",
      error
    );

    return null;
  }
}

