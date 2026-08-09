"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export type DistributionTripReport = {
  tripId: string;
  tripNo: string;

  vehicleId: string;
  vehicleName: string;

  driverId: string;
  driverName: string;

  routeId: string;
  routeName: string;

  locationCode: string;
  responsiblePerson: string;

  status: string;

  totalLoadedQuantity: number;
  totalLoadedValue: number;

  totalSalesAmount: number;
  totalReturnAmount: number;

  totalCashCollected: number;
  totalCreditAmount: number;

  totalExpenses: number;
  totalAmountHandedOver: number;
  settlementDifference: number;

  remarks?: string;
  createdBy?: string;

  createdAt?: Date;
  updatedAt?: Date;
};

type Props = {
  vehicleId?: string;
  driverId?: string;
  routeId?: string;
  status?: string;
  limit?: number;
};

export async function getDistributionTrips({
  vehicleId,
  driverId,
  routeId,
  status,
  limit = 100,
}: Props = {}): Promise<{
  success: boolean;
  data: DistributionTripReport[];
  message?: string;
}> {
  try {
    let query: FirebaseFirestore.Query = adminDb
      .collection("distributionTrips")
      .orderBy("createdAt", "desc")
      .limit(limit);

    if (vehicleId) {
      query = adminDb
        .collection("distributionTrips")
        .where("vehicleId", "==", vehicleId)
        .orderBy("createdAt", "desc")
        .limit(limit);
    }

    if (driverId) {
      query = adminDb
        .collection("distributionTrips")
        .where("driverId", "==", driverId)
        .orderBy("createdAt", "desc")
        .limit(limit);
    }

    if (routeId) {
      query = adminDb
        .collection("distributionTrips")
        .where("routeId", "==", routeId)
        .orderBy("createdAt", "desc")
        .limit(limit);
    }

    if (status && status !== "ALL") {
      query = adminDb
        .collection("distributionTrips")
        .where("status", "==", status)
        .orderBy("createdAt", "desc")
        .limit(limit);
    }

    const snapshot = await query.get();

    const data: DistributionTripReport[] =
      snapshot.docs.map((doc) => {
        const d = doc.data();

        return {
          tripId: doc.id,

          tripNo: d.tripNo || doc.id,

          vehicleId: d.vehicleId || "",
          vehicleName: d.vehicleName || "",

          driverId: d.driverId || "",
          driverName: d.driverName || "",

          routeId: d.routeId || "",
          routeName: d.routeName || "",

          locationCode: d.locationCode || "",
          responsiblePerson:
            d.responsiblePerson || "",

          status: d.status || "LOADED",

          totalLoadedQuantity:
            Number(d.totalLoadedQuantity || 0),

          totalLoadedValue:
            Number(d.totalLoadedValue || 0),

          totalSalesAmount:
            Number(d.totalSalesAmount || 0),

          totalReturnAmount:
            Number(d.totalReturnAmount || 0),

          totalCashCollected:
            Number(d.totalCashCollected || 0),

          totalCreditAmount:
            Number(d.totalCreditAmount || 0),

          totalExpenses:
            Number(d.totalExpenses || 0),

          totalAmountHandedOver:
            Number(d.totalAmountHandedOver || 0),

          settlementDifference:
            Number(d.settlementDifference || 0),

          remarks: d.remarks,
          createdBy: d.createdBy,

          createdAt:
            d.createdAt?.toDate
              ? d.createdAt.toDate()
              : d.createdAt
                ? new Date(d.createdAt)
                : undefined,

          updatedAt:
            d.updatedAt?.toDate
              ? d.updatedAt.toDate()
              : d.updatedAt
                ? new Date(d.updatedAt)
                : undefined,
        };
      });

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error(
      "❌ getDistributionTrips:",
      error
    );

    return {
      success: false,
      data: [],
      message:
        error?.message ||
        "Failed to load distribution trips.",
    };
  }
}