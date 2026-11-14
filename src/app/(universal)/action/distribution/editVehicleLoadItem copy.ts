
"use server";

import { adminDb } from "@/lib/firebaseAdmin";

type EditVehicleLoadItemInput = {
  loadId: string;
  tripId: string;
  vehicleId: string;

  productId: string;
  newQuantity: number;
};

export async function editVehicleLoadItem(
  input: EditVehicleLoadItemInput
) {
  try {
    const {
      loadId,
      tripId,
      vehicleId,
      productId,
      newQuantity,
    } = input;

    if (
      !loadId ||
      !tripId ||
      !vehicleId ||
      !productId ||
      !Number.isInteger(newQuantity) ||
      newQuantity < 0
    ) {
      throw new Error("Invalid load item details.");
    }

    await adminDb.runTransaction(async (tx) => {

      // 1. Find existing load item
      const itemQuery = adminDb
        .collection("vehicleLoadItems")
        .where("loadId", "==", loadId)
        .where("productId", "==", productId);

      const itemSnapshot = await tx.get(itemQuery);

      if (itemSnapshot.empty) {
        throw new Error("Load item not found.");
      }

      if (itemSnapshot.size > 1) {
        throw new Error("Multiple matching load items found.");
      }

      const itemDoc = itemSnapshot.docs[0];
      const item = itemDoc.data();

      const oldQuantity = Number(item.quantity || 0);
      const difference = newQuantity - oldQuantity;

      if (difference === 0) return;

      // 2. Read existing load master
      const loadRef = adminDb
        .collection("vehicleLoads")
        .doc(loadId);

      const loadSnap = await tx.get(loadRef);

      if (!loadSnap.exists) {
        throw new Error("Vehicle load not found.");
      }

      const load = loadSnap.data()!;

      if (
        load.tripId !== tripId ||
        load.vehicleId !== vehicleId
      ) {
        throw new Error("Load reference mismatch.");
      }

      // 3. Read existing trip
      const tripRef = adminDb
        .collection("distributionTrips")
        .doc(tripId);

      const tripSnap = await tx.get(tripRef);

      if (!tripSnap.exists) {
        throw new Error("Distribution trip not found.");
      }

      const trip = tripSnap.data()!;

      // 4. Stock updates go here.
      // Factory stock: subtract difference.
      // Van stock: add difference.
      //
      // Use your existing stock-location helper here.

      // 5. Update existing load item
      const costPerUnit = Number(item.costPerUnit || 0);

      tx.update(itemDoc.ref, {
        quantity: newQuantity,
        lineValue: newQuantity * costPerUnit,
        updatedAt: new Date(),
      });

      // 6. Update load master totals
      tx.update(loadRef, {
        totalQuantity:
          Number(load.totalQuantity || 0) + difference,

        totalValue:
          Number(load.totalValue || 0) +
          difference * costPerUnit,

        updatedAt: new Date(),
      });

      // 7. Update trip totals
      tx.update(tripRef, {
        totalLoadedQuantity:
          Number(trip.totalLoadedQuantity || 0) + difference,

        totalLoadedValue:
          Number(trip.totalLoadedValue || 0) +
          difference * costPerUnit,

        updatedAt: new Date(),
      });
    });

    return {
      success: true,
      message: "Van stock updated successfully.",
    };

  } catch (error: any) {
    console.error("editVehicleLoadItem:", error);

    return {
      success: false,
      message:
        error?.message || "Failed to update van stock.",
    };
  }
}
