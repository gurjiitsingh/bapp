"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function getDistributionTripDetail(
  tripId: string
) {
  try {
    if (!tripId) {
      return {
        success: false,
        message: "Trip ID required.",
      };
    }

    // ============================================
    // TRIP
    // ============================================

    const tripRef = adminDb
      .collection("distributionTrips")
      .doc(tripId);

    const tripSnap = await tripRef.get();

    if (!tripSnap.exists) {
      return {
        success: false,
        message: "Trip not found.",
      };
    }

    const tripData = tripSnap.data()!;


    // ============================================
    // VEHICLE LOADS
    // ============================================

    const loadsSnap = await adminDb
      .collection("vehicleLoads")
      .where("tripId", "==", tripId)
      .orderBy("createdAt", "desc")
      .get();

    const loads = loadsSnap.docs.map((doc) => {

      const d = doc.data();

      return {
        loadId: doc.id,

        loadNo:
          d.loadNo || doc.id,

        tripId: d.tripId || tripId,

        vehicleId:
          d.vehicleId || "",

        vehicleName:
          d.vehicleName || "",

        totalItems:
          Number(d.totalItems || 0),

        totalQuantity:
          Number(d.totalQuantity || 0),

        totalValue:
          Number(d.totalValue || 0),

        status:
          d.status || "LOADED",

        createdAt:
          d.createdAt?.toDate
            ? d.createdAt.toDate()
            : d.createdAt
              ? new Date(d.createdAt)
              : undefined,
      };
    });


    // ============================================
    // TRUCK SALES
    // ============================================

    const salesSnap = await adminDb
      .collection("truckSales")
      .where("tripId", "==", tripId)
      .orderBy("createdAt", "desc")
      .get();

    const sales = salesSnap.docs.map((doc) => {

      const d = doc.data();

      return {
        saleId: doc.id,

        tripId:
          d.tripId || tripId,

        vehicleId:
          d.vehicleId || "",

        vehicleName:
          d.vehicleName || "",

        customerId:
          d.wholeSaleCutomerId || "",

        customerName:
          d.wholeSaleCutomerName || "",

        totalAmount:
          Number(d.totalAmount || 0),

        paidAmount:
          Number(d.paidAmount || 0),

        dueAmount:
          Number(d.dueAmount || 0),

        paymentStatus:
          d.paymentStatus || "CREDIT",

        paymentMethod:
          d.paymentMethod || null,

        totalItems:
          Number(d.totalItems || 0),

        totalQuantity:
          Number(d.totalQuantity || 0),

        status:
          d.status || "COMPLETED",

        remarks:
          d.remarks || "",

        createdAt:
          d.createdAt?.toDate
            ? d.createdAt.toDate()
            : d.createdAt
              ? new Date(d.createdAt)
              : undefined,
      };
    });


    // ============================================
    // RETURN
    // ============================================

    return {
      success: true,

      data: {

        trip: {
          id: tripSnap.id,

          ...tripData,

          createdAt:
            tripData.createdAt?.toDate
              ? tripData.createdAt.toDate()
              : tripData.createdAt
                ? new Date(tripData.createdAt)
                : undefined,

          updatedAt:
            tripData.updatedAt?.toDate
              ? tripData.updatedAt.toDate()
              : tripData.updatedAt
                ? new Date(tripData.updatedAt)
                : undefined,
        },

        loads,

        sales,
      },
    };

  } catch (error: any) {

    console.error(
      "❌ getDistributionTripDetail:",
      error
    );

    return {
      success: false,

      message:
        error?.message ||
        "Failed to get trip details.",
    };
  }
}