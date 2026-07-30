"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";


 

export async function updateAllDepartmentAverageCosts() {
  try {
    console.log(
      "=========================================="
    );
    console.log(
      "🔵 START: Updating ALL department stock costs"
    );
    console.log(
      "=========================================="
    );

    // ==========================================
    // GET ALL INVENTORY ITEMS
    // ==========================================

    const inventorySnapshot =
      await adminDb
        .collection("inventoryItems")
        .get();

    console.log(
      "📦 Total inventory items:",
      inventorySnapshot.size
    );

    if (inventorySnapshot.empty) {
      return {
        success: true,
        message: "No inventory items found.",
        updated: 0,
        inventoryItemsProcessed: 0,
      };
    }

    let totalUpdated = 0;
    let inventoryItemsProcessed = 0;
    let inventoryItemsWithoutDepartmentStock = 0;

    // ==========================================
    // PROCESS EACH INVENTORY ITEM
    // ==========================================

    for (
      const inventoryDoc
      of inventorySnapshot.docs
    ) {
      const inventoryItemId =
        inventoryDoc.id;

      const inventoryData =
        inventoryDoc.data();

      const inventoryAverageCost =
        Number(inventoryData.averageCost);

      console.log(
        "inventoryData ------------------------------------------",inventoryData
      );

      console.log(
        "📦 Inventory:",
        inventoryItemId
      );

      console.log(
        "📦 Name:",
        inventoryData.name
      );

      console.log(
        "💰 Inventory averageCost:",
        inventoryAverageCost
      );

      // ========================================
      // INVALID AVERAGE COST
      // ========================================

      if (
        !Number.isFinite(
          inventoryAverageCost
        )
      ) {
        console.warn(
          "⚠️ Invalid averageCost, skipping:",
          inventoryItemId
        );

        continue;
      }

      inventoryItemsProcessed++;

      // ========================================
      // FIND ALL DEPARTMENT STOCK
      // ========================================

      const departmentStockSnapshot =
        await adminDb
          .collection("departmentStock")
          .where(
            "inventoryItemId",
            "==",
            inventoryItemId
          )
          .get();

      console.log(
        "🏭 Matching department stocks:",
        departmentStockSnapshot.size
      );

      if (
        departmentStockSnapshot.empty
      ) {
        inventoryItemsWithoutDepartmentStock++;

        console.log(
          "⚠️ No department stock found."
        );

        continue;
      }

      // ========================================
      // BATCH UPDATE
      // ========================================

      let batch = adminDb.batch();
      let batchCount = 0;

      for (
        const departmentDoc
        of departmentStockSnapshot.docs
      ) {
        const departmentStock =
          departmentDoc.data();

        const oldAverageCost =
          Number(
            departmentStock.averageCost
          ) || 0;

        console.log(
          "🏭 Department Stock ID:",
          departmentDoc.id
        );

        console.log(
          "🏢 Department ID:",
          departmentStock.departmentId
        );

        console.log(
          "💰 Old averageCost:",
          oldAverageCost
        );

        console.log(
          "💰 New averageCost:",
          inventoryAverageCost
        );

        // ======================================
        // UPDATE DEPARTMENT STOCK
        // ======================================

        batch.update(
          departmentDoc.ref,
          {
            averageCost:inventoryData.averageCost,

          

            updatedAt:
              FieldValue.serverTimestamp(),
          }
        );

        batchCount++;
        totalUpdated++;

        // ======================================
        // FIRESTORE BATCH LIMIT
        // ======================================

        if (batchCount >= 450) {
          await batch.commit();

          console.log(
            "💾 Batch committed:",
            batchCount
          );

          batch = adminDb.batch();
          batchCount = 0;
        }
      }

      // ========================================
      // COMMIT REMAINING
      // ========================================

      if (batchCount > 0) {
        await batch.commit();

        console.log(
          "💾 Batch committed:",
          batchCount
        );
      }
    }

    // ==========================================
    // COMPLETE
    // ==========================================

    console.log(
      "=========================================="
    );

    console.log(
      "🟢 ALL DEPARTMENT COSTS UPDATED"
    );

    console.log(
      "Inventory items processed:",
      inventoryItemsProcessed
    );

    console.log(
      "Inventory items without department stock:",
      inventoryItemsWithoutDepartmentStock
    );

    console.log(
      "Total department records updated:",
      totalUpdated
    );

    console.log(
      "=========================================="
    );

    return {
      success: true,

      message:
        `Updated ${totalUpdated} department stock records.`,

      updated: totalUpdated,

      inventoryItemsProcessed,

      inventoryItemsWithoutDepartmentStock,
    };
  } catch (error: any) {
    console.error(
      "❌ updateAllDepartmentAverageCosts:",
      error
    );

    return {
      success: false,

      message:
        error?.message ||
        "Failed to update department stock costs.",

      updated: 0,

      inventoryItemsProcessed: 0,

      inventoryItemsWithoutDepartmentStock: 0,
    };
  }
}


// export async function updateDepartmentAverageCostForInventoryItem(
//   inventoryItemId: string
// ) {
//   try {
//     if (!inventoryItemId) {
//       return {
//         success: false,
//         message: "Inventory item ID is required.",
//         updated: 0,
//       };
//     }

//     console.log(
//       "=========================================="
//     );
//     console.log(
//       "🔵 Updating department stock costs"
//     );
//     console.log(
//       "Inventory Item ID:",
//       inventoryItemId
//     );
//     console.log(
//       "=========================================="
//     );

//     // ==========================================
//     // GET INVENTORY MASTER
//     // ==========================================

//     const inventoryRef = adminDb
//       .collection("inventoryItems")
//       .doc(inventoryItemId);

//     const inventorySnap =
//       await inventoryRef.get();

//     if (!inventorySnap.exists) {
//       return {
//         success: false,
//         message:
//           `Inventory item not found: ${inventoryItemId}`,
//         updated: 0,
//       };
//     }

//     const inventoryData =
//       inventorySnap.data()!;

//     const inventoryAverageCost =
//       Number(inventoryData.averageCost);

//     if (
//       !Number.isFinite(
//         inventoryAverageCost
//       )
//     ) {
//       return {
//         success: false,
//         message:
//           `Invalid averageCost in inventory item: ${inventoryAverageCost}`,
//         updated: 0,
//       };
//     }

//     console.log(
//       "📦 Inventory averageCost:",
//       inventoryAverageCost
//     );

//     // ==========================================
//     // FIND ALL DEPARTMENT STOCK
//     // WHERE inventoryItemId MATCHES
//     // ==========================================

//     const departmentStockSnapshot =
//       await adminDb
//         .collection("departmentStock")
//         .where(
//           "inventoryItemId",
//           "==",
//           inventoryItemId
//         )
//         .get();

//     console.log(
//       "🏭 Matching department stock:",
//       departmentStockSnapshot.size
//     );

//     if (departmentStockSnapshot.empty) {
//       return {
//         success: true,
//         message:
//           "No department stock records found for this inventory item.",
//         updated: 0,
//       };
//     }

//     // ==========================================
//     // FIRESTORE BATCH
//     // ==========================================

//     let batch = adminDb.batch();
//     let batchCount = 0;
//     let updated = 0;

//     for (
//       const departmentDoc
//       of departmentStockSnapshot.docs
//     ) {
//       const departmentStock =
//         departmentDoc.data();

//       const oldAverageCost =
//         Number(
//           departmentStock.averageCost
//         ) || 0;

//       console.log(
//         "------------------------------------------"
//       );

//       console.log(
//         "🏭 Department Stock ID:",
//         departmentDoc.id
//       );

//       console.log(
//         "🏢 Department ID:",
//         departmentStock.departmentId
//       );

//       console.log(
//         "📦 Inventory Item ID:",
//         departmentStock.inventoryItemId
//       );

//       console.log(
//         "💰 Old averageCost:",
//         oldAverageCost
//       );

//       console.log(
//         "💰 New averageCost:",
//         inventoryAverageCost
//       );

//       // ========================================
//       // UPDATE ONLY COST FIELDS
//       // ========================================

//       batch.update(departmentDoc.ref, {
//         averageCost:
//           inventoryAverageCost,

//         purchaseUnitCost:
//           inventoryAverageCost,

//         updatedAt:
//           FieldValue.serverTimestamp(),
//       });

//       batchCount++;
//       updated++;

//       // ========================================
//       // FIRESTORE BATCH LIMIT
//       // ========================================

//       if (batchCount >= 450) {
//         await batch.commit();

//         console.log(
//           "💾 Batch committed:",
//           batchCount
//         );

//         batch = adminDb.batch();
//         batchCount = 0;
//       }
//     }

//     // ==========================================
//     // COMMIT REMAINING
//     // ==========================================

//     if (batchCount > 0) {
//       await batch.commit();

//       console.log(
//         "💾 Final batch committed:",
//         batchCount
//       );
//     }

//     console.log(
//       "=========================================="
//     );
//     console.log(
//       "🟢 UPDATE COMPLETE"
//     );
//     console.log(
//       "Inventory Item:",
//       inventoryItemId
//     );
//     console.log(
//       "New Average Cost:",
//       inventoryAverageCost
//     );
//     console.log(
//       "Departments Updated:",
//       updated
//     );
//     console.log(
//       "=========================================="
//     );

//     return {
//       success: true,
//       message:
//         `Updated ${updated} department stock records.`,
//       updated,
//     };
//   } catch (error: any) {
//     console.error(
//       "❌ updateDepartmentAverageCostForInventoryItem:",
//       error
//     );

//     return {
//       success: false,
//       message:
//         error?.message ||
//         "Failed to update department stock costs.",
//       updated: 0,
//     };
//   }
// }