"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { FieldPath } from "firebase-admin/firestore";

type GetVehicleLoadReportParams = {
  dateFrom?: string;
  dateTo?: string;
  vehicleId?: string;
};

function toISOString(value: any): string | null {
  if (!value) return null;

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return null;
}

export async function getVehicleLoadReport(
  params: GetVehicleLoadReportParams
) {
  try {
    const { dateFrom, dateTo, vehicleId } = params;

    let query: FirebaseFirestore.Query =
      adminDb.collection("vehicleLoads");

    // Date filters use the businessDate field (YYYY-MM-DD).
    if (dateFrom) {
      query = query.where("businessDate", ">=", dateFrom);
    }

    if (dateTo) {
      query = query.where("businessDate", "<=", dateTo);
    }

    if (vehicleId && vehicleId !== "ALL") {
      query = query.where("vehicleId", "==", vehicleId);
    }

    const loadSnapshot = await query
      .orderBy("businessDate", "desc")
      .orderBy("createdAt", "desc")
      .limit(500)
      .get();

    if (loadSnapshot.empty) {
      return {
        success: true,
        loads: [],
      };
    }

    const loads = loadSnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        ...data,
        loadId: data.loadId || doc.id,
        createdAt: toISOString(data.createdAt),
        updatedAt: toISOString(data.updatedAt),
        items: [] as any[],
      };
    });

    // Fetch product lines in groups of 30 load IDs.
    // Firestore "in" queries support up to 30 values.
    const loadIds = loads.map((load) => load.loadId);

    const itemSnapshots: FirebaseFirestore.QueryDocumentSnapshot[] = [];

    for (let i = 0; i < loadIds.length; i += 30) {
      const batchLoadIds = loadIds.slice(i, i + 30);

      const snapshot = await adminDb
        .collection("vehicleLoadItems")
        .where("loadId", "in", batchLoadIds)
        .get();

      itemSnapshots.push(...snapshot.docs);
    }

    const itemsByLoadId = new Map<string, any[]>();

    for (const doc of itemSnapshots) {
      const data = doc.data();
      const loadId = data.loadId;

      if (!itemsByLoadId.has(loadId)) {
        itemsByLoadId.set(loadId, []);
      }

      itemsByLoadId.get(loadId)!.push({
        ...data,
        id: data.id || doc.id,
        createdAt: toISOString(data.createdAt),
      });
    }

    const result = loads.map((load) => ({
      ...load,
      items: itemsByLoadId.get(load.loadId) || [],
    }));

    return {
      success: true,
      loads: result,
    };

  } catch (error) {
    console.error("getVehicleLoadReport error:", error);

    return {
      success: false,
      message: "Failed to fetch vehicle load report.",
      loads: [],
    };
  }
}