"use server";

import admin from "firebase-admin";

import { adminDb } from "@/lib/firebaseAdmin";

import { revalidatePath, revalidateTag } from "next/cache";
import { InventoryTransactionNameType } from "@/lib/types/InventoryTransactionType";

type AdjustInventoryStockType = {
  inventoryItemId: string;

  supplierId?: string;

  transactionType:InventoryTransactionNameType;
  

  stockDirection:
  | "IN"
  | "OUT";

  quantity: number;

  note?: string;

  createdBy?: string;

  referenceId?: string;

  referenceType?:
  | "PURCHASE"
  | "MANUAL";
};

export async function adjustInventoryStock({
  inventoryItemId,
  supplierId,
  transactionType,
  stockDirection,
  quantity,
  note,
  createdBy,
  referenceId, 
  referenceType = "MANUAL",
}: AdjustInventoryStockType) {
  try {
    // =====================================================
    // VALIDATION
    // =====================================================

    console.log("inventoryItemId,  supplierId,  transactionType,  stockDirection,  quantity,  note,  createdBy,  referenceId,  referenceType, -------",inventoryItemId,  supplierId,  transactionType,  stockDirection,  quantity,  note,  createdBy,  referenceId,  referenceType)

    if (!inventoryItemId) {
      return {
        success: false,
        message: "Inventory item required",
      };
    }

    if (!quantity || quantity <= 0) {
      return {
        success: false,
        message: "Quantity must be greater than 0",
      };
    }

    // =====================================================
    // GET INVENTORY ITEM
    // =====================================================

    const inventoryRef = adminDb
      .collection("inventoryItems")
      .doc(inventoryItemId);

    const inventorySnap =
      await inventoryRef.get();

    if (!inventorySnap.exists) {
      return {
        success: false,
        message: "Inventory item not found",
      };
    }

    const inventoryData =
      inventorySnap.data();

    const previousStock =
      Number(
        inventoryData?.currentStock
      ) || 0;

    // =====================================================
    // CALCULATE NEW STOCK
    // =====================================================

    let afterStock = previousStock;

    if (stockDirection === "IN") {
      afterStock =
        previousStock + quantity;
    } else {
      afterStock =
        previousStock - quantity;
    }

    // =====================================================
    // UPDATE INVENTORY
    // =====================================================

    await inventoryRef.update({
      currentStock: afterStock,

      updatedAt:
        admin.firestore.FieldValue.serverTimestamp(),
    });

    // =====================================================
    // CREATE TRANSACTION
    // =====================================================

    await adminDb
      .collection(
        "inventoryTransactions"
      )
      .add({
        inventoryItemId,

        supplierId:
          supplierId || "",

        inventoryItemName:
          inventoryData?.name || "",

        transactionType,

        stockDirection,

        quantity,

        beforeStock:
          previousStock,

        afterStock,

        unit:
  inventoryData?.consumptionUnit ||
  "pcs",

        referenceType,

        referenceId:
          referenceId || "",

        note:
          note ||
          "Manual inventory adjustment",

        createdBy:
          createdBy || "admin",

        createdAt:
          admin.firestore.FieldValue.serverTimestamp(),
      });

    // =====================================================
    // REVALIDATE
    // =====================================================

    revalidateTag(
      "inventory-items",
      "max"
    );

    revalidatePath(
      "/admin/inventory"
    );

    revalidatePath(
      "/admin/inventory/dashboard"
    );

    return {
      success: true,
      message:
        "Inventory updated successfully",
    };
  } catch (error) {
    console.error(
      "❌ adjustInventoryStock failed:",
      error
    );

    return {
      success: false,
      message:
        "Failed to update inventory",
    };
  }
}

// "use server";

// import { adminDb } from "@/lib/firebaseAdmin";

// import admin from "firebase-admin";

// import { createInventoryTransaction } from "./createInventoryTransaction";

// type AdjustInventoryStockParams = {
//   inventoryItemId: string;

//   newStock: number;

//   reason:
//     | "adjustment"
//     | "wastage"
//     | "damage"
//     | "expired"
//     | "manual";

//   note?: string;

//   createdBy?: string;
// };

// export async function adjustInventoryStock(
//   params: AdjustInventoryStockParams
// ) {
//   try {
//     const {
//       inventoryItemId,

//       newStock,

//       reason,

//       note,

//       createdBy,
//     } = params;

//     // =====================================================
//     // VALIDATION
//     // =====================================================

//     if (newStock < 0) {
//       return {
//         success: false,

//         error:
//           "Stock cannot be negative",
//       };
//     }

//     // =====================================================
//     // GET INVENTORY ITEM
//     // =====================================================

//     const inventoryRef = adminDb
//       .collection("inventoryItems")
//       .doc(inventoryItemId);

//     const inventorySnap =
//       await inventoryRef.get();

//     if (!inventorySnap.exists) {
//       return {
//         success: false,

//         error:
//           "Inventory item not found",
//       };
//     }

//     const inventory =
//       inventorySnap.data();

//     const previousStock =
//       Number(
//         inventory?.currentStock
//       ) || 0;

//     // =====================================================
//     // CALCULATE DIFFERENCE
//     // =====================================================

//     const difference =
//       newStock - previousStock;

//     // NO CHANGE
//     if (difference === 0) {
//       return {
//         success: false,

//         error:
//           "No stock change detected",
//       };
//     }

//     // =====================================================
//     // UPDATE INVENTORY
//     // =====================================================

//     await inventoryRef.update({
//       currentStock: newStock,

//       updatedAt:
//         admin.firestore.FieldValue.serverTimestamp(),
//     });

//     // =====================================================
//     // CREATE TRANSACTION
//     // =====================================================

//     await createInventoryTransaction({
//       inventoryItemId,

//       type:
//         difference > 0
//           ? "adjustment"
//           : "wastage",

//       quantity: Math.abs(
//         difference
//       ),

//       previousStock,

//       newStock,

//       note:
//         note ||
//         `Stock adjusted (${reason})`,

//       referenceType: reason,

//       createdBy:
//         createdBy || "admin",
//     });

//     return {
//       success: true,

//       previousStock,

//       newStock,

//       difference,
//     };
//   } catch (error) {
//     console.error(
//       "❌ adjustInventoryStock failed:",
//       error
//     );

//     return {
//       success: false,

//       error:
//         "Could not adjust stock",
//     };
//   }
// }