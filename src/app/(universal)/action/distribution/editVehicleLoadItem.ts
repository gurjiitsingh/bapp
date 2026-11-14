
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { getStockLocation } from "../getStockLocationTx";
import { updateStockLocation } from "../updateStockLocation";

import { StockLocationType } from "@/lib/types/distribution/StockLocationType";

type EditVehicleLoadItemProps = {
  loadId: string;
  tripId: string;
  productId: string;

  newQuantity: number;

  // Exact location references used when loading the vehicle
  factoryLocationRef: string;
  vehicleLocationRef: string;
};

export async function editVehicleLoadItem({
  loadId,
  tripId,
  productId,
  newQuantity,
  factoryLocationRef,
  vehicleLocationRef,
}: EditVehicleLoadItemProps) {

  if (
    !Number.isInteger(newQuantity) ||
    newQuantity < 0
  ) {
    throw new Error("Invalid quantity.");
  }

  return await adminDb.runTransaction(async (tx) => {

    // -----------------------------------------
    // 1. FIND EXISTING LOAD ITEM
    // -----------------------------------------

    const itemQuery = adminDb
      .collection("vehicleLoadItems")
      .where("loadId", "==", loadId)
      .where("productId", "==", productId);

    const itemSnap = await tx.get(itemQuery);

    if (itemSnap.empty) {
      throw new Error("Vehicle load item not found.");
    }

    if (itemSnap.size > 1) {
      throw new Error(
        "Multiple load items found for this product. Please identify the exact load item."
      );
    }

    const itemDoc = itemSnap.docs[0];
    const itemData = itemDoc.data();

    const oldQuantity = Number(itemData.quantity || 0);
    const costPerUnit = Number(itemData.costPerUnit || 0);

    const difference = newQuantity - oldQuantity;

    if (difference === 0) {
      return { success: true, message: "No quantity change." };
    }

    // -----------------------------------------
    // 2. READ FACTORY AND VEHICLE STOCK
    // -----------------------------------------

    const factorySnap = await getStockLocation({
      tx,
      productId,
      locationType: "FACTORY",
      locationRef: factoryLocationRef,
    });

    const vehicleSnap = await getStockLocation({
      tx,
      productId,
      locationType: "VAN",
      locationRef: vehicleLocationRef,
    });

    if (!factorySnap.exists) {
      throw new Error("Factory stock not found.");
    }

    if (!vehicleSnap.exists) {
      throw new Error("Vehicle stock not found.");
    }

    const factoryData = {
      ...factorySnap.data(),
      id: factorySnap.id,
    } as StockLocationType;

    const vehicleData = {
      ...vehicleSnap.data(),
      id: vehicleSnap.id,
    } as StockLocationType;

    // -----------------------------------------
    // 3. VALIDATE STOCK
    // -----------------------------------------

    if (difference > 0) {

      // Increasing van quantity requires factory stock.
      if (Number(factoryData.quantity || 0) < difference) {
        throw new Error("Insufficient factory stock.");
      }

    } else {

      // Decreasing van quantity returns stock to factory.
      if (Number(vehicleData.quantity || 0) < Math.abs(difference)) {
        throw new Error("Insufficient vehicle stock.");
      }
    }

    // -----------------------------------------
    // 4. READ LOAD MASTER AND TRIP
    // -----------------------------------------

    const loadRef = adminDb
      .collection("vehicleLoads")
      .doc(loadId);

    const tripRef = adminDb
      .collection("distributionTrips")
      .doc(tripId);

    const [loadSnap, tripSnap] = await Promise.all([
      tx.get(loadRef),
      tx.get(tripRef),
    ]);

    if (!loadSnap.exists) {
      throw new Error("Vehicle load not found.");
    }

    if (!tripSnap.exists) {
      throw new Error("Distribution trip not found.");
    }

    const loadData = loadSnap.data()!;
    const tripData = tripSnap.data()!;

    // -----------------------------------------
    // 5. CALCULATE UPDATED TOTALS
    // -----------------------------------------

    const differenceValue = difference * costPerUnit;

    const updatedLoadQuantity =
      Number(loadData.totalQuantity || 0) + difference;

    const updatedLoadValue =
      Number(loadData.totalValue || 0) + differenceValue;

    const updatedTripQuantity =
      Number(tripData.totalLoadedQuantity || 0) + difference;

    const updatedTripValue =
      Number(tripData.totalLoadedValue || 0) + differenceValue;

    // -----------------------------------------
    // 6. UPDATE FACTORY AND VEHICLE STOCK
    // -----------------------------------------

    await updateStockLocation({
      tx,
      snap: factoryData,
      quantity: -difference,
    });

    await updateStockLocation({
      tx,
      snap: vehicleData,
      quantity: difference,
    });

    // -----------------------------------------
    // 7. UPDATE EXISTING LOAD ITEM
    // -----------------------------------------

    tx.update(itemDoc.ref, {
      quantity: newQuantity,
      lineValue: newQuantity * costPerUnit,
      updatedAt: Date.now(),
    });

    // -----------------------------------------
    // 8. UPDATE LOAD MASTER
    // -----------------------------------------

    tx.update(loadRef, {
      totalQuantity: updatedLoadQuantity,
      totalValue: updatedLoadValue,
      updatedAt: Date.now(),
    });

    // -----------------------------------------
    // 9. UPDATE DISTRIBUTION TRIP
    // -----------------------------------------

    tx.update(tripRef, {
      totalLoadedQuantity: updatedTripQuantity,
      totalLoadedValue: updatedTripValue,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      oldQuantity,
      newQuantity,
      difference,
    };
  });
}
