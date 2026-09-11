"use server";

import { adminDb } from "@/lib/firebaseAdmin";

type InventoryField =
  | "currentStock"
  | "consumptionUnit"
  | "purchaseUnit"
  | "conversionFactor"
  | "averageCost"
  | "purchaseUnitCost"
  | "stockValue";

export async function updateInventoryFieldNew(
  itemId: string,
  field: InventoryField,
  value: string | number
) {
  try {
    const ref = adminDb
      .collection("inventoryItems")
      .doc(itemId);

    const snap = await ref.get();

    if (!snap.exists) {
      return {
        success: false,
        message: `Item not found: ${itemId}`,
      };
    }

    const data = snap.data() || {};

    // ---------------------------------------------------------
    // CURRENT VALUES
    // ---------------------------------------------------------

    let currentStock = Number(data.currentStock || 0);
    let averageCost = Number(data.averageCost || 0);
    let conversionFactor = Number(
      data.conversionFactor || 0
    );

    // ---------------------------------------------------------
    // APPLY CHANGED VALUE
    // ---------------------------------------------------------

    if (field === "currentStock") {
      currentStock = Number(value);
    }

    if (field === "averageCost") {
      averageCost = Number(value);
    }

    if (field === "conversionFactor") {
      conversionFactor = Number(value);
    }

    // ---------------------------------------------------------
    // VALIDATE NUMBERS
    // ---------------------------------------------------------

    if (!Number.isFinite(currentStock)) {
      return {
        success: false,
        message: "Invalid current stock.",
      };
    }

    if (!Number.isFinite(averageCost)) {
      return {
        success: false,
        message: "Invalid average cost.",
      };
    }

    if (
      !Number.isFinite(conversionFactor) ||
      conversionFactor <= 0
    ) {
      return {
        success: false,
        message: "Invalid conversion factor.",
      };
    }

    // ---------------------------------------------------------
    // STOCK VALUE
    //
    // currentStock is in consumption units.
    //
    // Example:
    //
    // 146925000 gm
    // / 50000 gm per bag
    // = 2938.5 bags
    //
    // 2938.5 × ₹4800
    // = ₹14,104,800
    // ---------------------------------------------------------

    const stockValue =
      Number(((currentStock / conversionFactor) *
      averageCost).toFixed(2));

    if (!Number.isFinite(stockValue)) {
      return {
        success: false,
        message: "Stock value calculation is invalid.",
      };
    }

    // ---------------------------------------------------------
    // UPDATE FIRESTORE
    // ---------------------------------------------------------

    await ref.update({
      [field]: value,
      stockValue,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      stockValue,
    };
  } catch (error: any) {
    console.error(
      "❌ updateInventoryField error:",
      error
    );

    return {
      success: false,
      message:
        error?.message ?? "Update failed",
    };
  }
}