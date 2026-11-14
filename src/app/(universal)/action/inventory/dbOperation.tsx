"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { InventoryItemType, InventoryUnit, newInventorySchema } from "@/lib/types/InventoryItemType";
import admin from "firebase-admin";


import { revalidatePath, revalidateTag } from "next/cache";






import { cache } from "react";
import { addInventoryItemSupplier } from "../inventoryItemSupplier/addInventoryItemSupplier";

// FETCH ALL INVENTORY ITEMS
export const fetchInventoryItems = cache(
  async (): Promise<InventoryItemType[]> => {
    try {
      const snapshot = await adminDb
        .collection("inventoryItems")
        //.orderBy("createdAt", "desc")
        .get();

      const inventoryItems = snapshot.docs.map((doc) => {
        const data = doc.data();


  //       purchaseMappings:
  // data.purchaseMappings?.length
  //   ? data.purchaseMappings
  //   : [
  //       {
  //         purchaseUnit:
  //           data.purchaseUnit ||
  //           data.consumptionUnit ||
  //           "pcs",
  //         consumptionUnit:
  //           data.consumptionUnit || "pcs",
  //         factor:
  //           Number(data.conversionFactor) || 1,
  //       },
  //     ],

      return {
  id: doc.id,

  name: data.name || "",

  sku: data.sku || "",

  barcode: data.barcode || "",

  consumptionUnit:
    data.consumptionUnit || "pcs",

  purchaseMappings:
    data.purchaseMappings || [],
purchaseUnit:data.purchaseUnit || "",
conversionFactor:data.conversionFactor || 1 ,
    
  currentStock:
    Number(data.currentStock) || 0,

  minStock:
    Number(data.minStock) || 0,

  averageCost:
    Number(data.averageCost) || 0,
purchaseUnitCost:  Number(data.purchaseUnitCost) || 0,
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


export async function deleteInventoryItem(id: string) {
  try {
    // ==========================
    // CHECK TRANSACTIONS
    // ==========================

    // const transactionSnapshot = await adminDb
    //   .collection("inventoryTransactions")
    //   .where("inventoryItemId", "==", id)
    //   .limit(1)
    //   .get();

    // if (!transactionSnapshot.empty) {
    //   return {
    //     success: false,
    //     message:
    //       "Inventory item has transaction history and cannot be deleted.",
    //   };
    // }

    // ==========================
    // FIND RELATED RECIPES
    // ==========================

    const recipeSnapshot = await adminDb
      .collection("productRecipes")
      .where("inventoryItemId", "==", id)
      .get();

    // ==========================
    // DELETE RECIPES + INVENTORY
    // ==========================

    const batch = adminDb.batch();

    // Remove all recipe entries using this inventory item
    recipeSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete inventory item
    const inventoryRef = adminDb
      .collection("inventoryItems")
      .doc(id);

    batch.delete(inventoryRef);

    await batch.commit();

    // ==========================
    // REVALIDATE
    // ==========================

    revalidateTag("inventory-items", "max");

    revalidatePath("/admin/stock-finished/");
    revalidatePath("/admin/stock-finished/form");
    revalidatePath("/admin/stock-finished/editform");

    return {
      success: true,
      message: recipeSnapshot.empty
        ? "Inventory item deleted successfully."
        : `Inventory item deleted successfully. ${recipeSnapshot.size} recipe entries were also removed.`,
    };
  } catch (error) {
    console.error("❌ Error deleting inventory item:", error);

    return {
      success: false,
      message: "Failed to delete inventory item.",
    };
  }
}


export async function deleteInventoryItem_(
  id: string,
  confirmRecipeRemoval = false
) {
  try {
    // CHECK TRANSACTION HISTORY
    // const transactionSnapshot = await adminDb
    //   .collection("inventoryTransactions")
    //   .where("inventoryItemId", "==", id)
    //   .limit(1)
    //   .get();

    // if (!transactionSnapshot.empty) {
    //   return {
    //     success: false,
    //     requiresConfirmation: false,
    //     recipeCount: 0,
    //     message:
    //       "Inventory item has transaction history and cannot be deleted.",
    //   };
    // }

    // FIND RELATED RECIPES
    const recipeSnapshot = await adminDb
      .collection("productRecipes")
      .where("inventoryItemId", "==", id)
      .get();

    // ASK FOR CONFIRMATION BEFORE REMOVING RECIPES
    if (!recipeSnapshot.empty && !confirmRecipeRemoval) {
      return {
        success: false,
        requiresConfirmation: true,
        recipeCount: recipeSnapshot.size,
        message: `This inventory item is used in ${recipeSnapshot.size} product recipe(s).`,
      };
    }

    // DELETE RECIPE ENTRIES AND INVENTORY
    const batch = adminDb.batch();

    recipeSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    const inventoryRef = adminDb
      .collection("inventoryItems")
      .doc(id);

    batch.delete(inventoryRef);

    await batch.commit();

    // REVALIDATE
    revalidateTag("inventory-items", "max");
    revalidatePath("/admin/stock-finished/");
    revalidatePath("/admin/stock-finished/form");
    revalidatePath("/admin/stock-finished/editform");

    return {
      success: true,
      requiresConfirmation: false,
      recipeCount: 0,
      message:
        "Inventory item and associated recipe entries deleted successfully.",
    };
  } catch (error) {
    console.error("❌ Error deleting inventory item:", error);

    return {
      success: false,
      requiresConfirmation: false,
      recipeCount: 0,
      message: "Failed to delete inventory item.",
    };
  }
}

export async function deleteInventoryItem_old(
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
    .collection("stockLedgerInventory")
    .where(
      "inventoryItemId",
      "==",
      id
    )
    .limit(1)
    .get();

if (!transactionSnapshot.empty) {

  transactionSnapshot.docs.forEach(
    (doc) => {
      console.log(
        "Inventory transaction found:",
        {
          id: doc.id,
          ...doc.data(),
        }
      );
    }
  );

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
console.log("data-------------------------")
    return {
      id: docRef.id,

      ...data,

createdAt:
  data?.createdAt &&
  typeof data.createdAt.toMillis === "function"
    ? data.createdAt.toMillis()
    : typeof data?.createdAt === "number"
    ? data.createdAt
    : null,

updatedAt:
  data?.updatedAt &&
  typeof data.updatedAt.toMillis === "function"
    ? data.updatedAt.toMillis()
    : typeof data?.updatedAt === "number"
    ? data.updatedAt
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

