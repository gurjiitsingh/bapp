"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function getActiveVehicleTripAction(
  vehicleId: string
) {
  try {
    if (!vehicleId) {
      return {
        success: false,
        message: "Vehicle is required.",
      };
    }

    const snapshot = await adminDb
      .collection("distributionTrips")
      .where("vehicleId", "==", vehicleId)
      .where("status", "in", [
        "LOADED",
        "IN_ROUTE",
      ])
      .limit(1)
      .get();

    if (snapshot.empty) {
      return {
        success: false,
        message:
          "No active trip found for this vehicle.",
      };
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      success: true,

      tripId: doc.id,

      tripNo:
        data.tripNo || "",

      vehicleId:
        data.vehicleId || vehicleId,

      routeId:
        data.routeId || "",

      routeName:
        data.routeName || "",

      salesmanId:
        data.salesmanId ||
        data.driverId ||
        "",

      salesmanName:
        data.salesmanName ||
        data.driverName ||
        "",
    };

  } catch (error: any) {
    console.error(
      "❌ getActiveVehicleTripAction:",
      error
    );

    return {
      success: false,
      message:
        error?.message ||
        "Failed to find active vehicle trip.",
    };
  }
}