"use server";

import { adminDb } from "@/lib/firebaseAdmin";


export async function getVehicleLoadDetail(loadId: string) {
  try {
    if (!loadId) {
      return {
        success: false,
        message: "Load ID required.",
      };
    }

    // ============================================
    // LOAD MASTER
    // ============================================

    const loadRef = adminDb
      .collection("vehicleLoads")
      .doc(loadId);

    const loadSnap = await loadRef.get();

    if (!loadSnap.exists) {
      return {
        success: false,
        message: "Load not found.",
      };
    }

    const loadData = loadSnap.data()!;

    // ============================================
    // LOAD ITEMS
    // ============================================

    const itemsSnap = await adminDb
      .collection("vehicleLoadItems")
      .where("loadId", "==", loadId)
      .get();

    const items = itemsSnap.docs.map((doc) => {
      const d = doc.data();

      return {
        id: doc.id,
        loadId: d.loadId ?? "",
        tripId: d.tripId ?? "",
        productId: d.productId ?? "",
        productName: d.productName ?? "",
        quantity: Number(d.quantity || 0),
        costPerUnit: Number(d.costPerUnit || 0),
        lineValue: Number(d.lineValue || 0),
        sellingPrice: Number(d.sellingPrice || 0),
        wholesalePrice: Number(d.wholesalePrice || 0),
      };
    });

    // ============================================
    // CONVERT FIRESTORE VALUES
    // ============================================

    const serialize = (value: any): any => {
      if (value === null || value === undefined) {
        return null;
      }

      if (
        value &&
        typeof value.toDate === "function"
      ) {
        return value.toDate().toISOString();
      }

      if (value instanceof Date) {
        return value.toISOString();
      }

      if (Array.isArray(value)) {
        return value.map(serialize);
      }

      if (
        typeof value === "object" &&
        Object.getPrototypeOf(value) === Object.prototype
      ) {
        return Object.fromEntries(
          Object.entries(value).map(([key, val]) => [
            key,
            serialize(val),
          ])
        );
      }

      return value;
    };

    // ============================================
    // RETURN
    // ============================================

    return {
      success: true,

      data: serialize({
        load: {
          id: loadSnap.id,
          ...loadData,
        },
        items,
      }),
    };

  } catch (error: any) {
    console.error(
      "❌ getVehicleLoadDetail:",
      error
    );

    return {
      success: false,
      message:
        error?.message ||
        "Failed to get load details.",
    };
  }
}
