"use server";
 import { adminDb } from "@/lib/firebaseAdmin";

import type { DistributionRoute } from "./getRoutes";

export async function getRouteById(
  routeId: string
): Promise<DistributionRoute | null> {
  try {
    if (!routeId) {
      return null;
    }

    const routeRef = adminDb
      .collection("distributionRoutes")
      .doc(routeId);

    const snapshot = await routeRef.get();

    if (!snapshot.exists) {
      return null;
    }

    const data = snapshot.data();

    if (!data) {
      return null;
    }

    return {
      id: snapshot.id,

      routeCode:
        data.routeCode || "",

      routeName:
        data.routeName || "",

      description:
        data.description || "",

      remarks:
        data.remarks || "",

      salesmanId:
        data.salesmanId || "",

      salesmanName:
        data.salesmanName || "",

      vehicleId:
        data.vehicleId || "",

      vehicleName:
        data.vehicleName || "",

      status:
        data.status === "INACTIVE"
          ? "INACTIVE"
          : "ACTIVE",

      createdAt:
        typeof data.createdAt === "number"
          ? data.createdAt
          : undefined,

      updatedAt:
        typeof data.updatedAt === "number"
          ? data.updatedAt
          : undefined,
    };
  } catch (error: any) {
    console.error(
      "❌ getRouteById:",
      error
    );

    return null;
  }
}