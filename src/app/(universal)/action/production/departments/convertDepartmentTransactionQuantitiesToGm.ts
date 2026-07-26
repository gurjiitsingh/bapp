"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function convertDepartmentTransactionQuantitiesToGm() {
  try {
    const db = adminDb;

    const snapshot = await db
      .collection("departmentStockTransactions")
      .where("type", "in", [
        "ISSUE_TO_DEPARTMENT",
        "RETURN_TO_MAIN_STORE",
      ])
      .get();

    if (snapshot.empty) {
      return {
        success: true,
        updated: 0,
        message: "No matching transactions found.",
      };
    }

    const batch = db.batch();

    let updated = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();

      const quantity = Number(data.quantity) || 0;
      const conversionFactor =
        Number(data.conversionFactor) || 1;

      if (quantity <= 0) {
        continue;
      }

      // Current quantity is wrongly stored
      // in purchase units.
      //
      // Convert:
      // purchase quantity × conversion factor
      //
      // Example:
      // 2 kg × 1000 = 2000 gm

      const newQuantity =
        quantity * conversionFactor;

      console.log(
        "========== CONVERT TRANSACTION =========="
      );

      console.log("Document ID:", doc.id);
      console.log("Type:", data.type);
      console.log(
        "Inventory:",
        data.inventoryItemName
      );
      console.log("Old Quantity:", quantity);
      console.log(
        "Purchase Unit:",
        data.purchaseUnit
      );
      console.log(
        "Consumption Unit:",
        data.consumptionUnit
      );
      console.log(
        "Conversion Factor:",
        conversionFactor
      );
      console.log("New Quantity:", newQuantity);
      console.log("==========================================");

      batch.update(doc.ref, {
        quantity: newQuantity,
      });

      updated++;
    }

    if (updated > 0) {
      await batch.commit();
    }

    return {
      success: true,
      updated,
      message: `${updated} transaction(s) converted successfully.`,
    };
  } catch (error: any) {
    console.error(
      "convertDepartmentTransactionQuantitiesToGm:",
      error
    );

    return {
      success: false,
      updated: 0,
      message:
        error.message ||
        "Failed to convert transaction quantities.",
    };
  }
}