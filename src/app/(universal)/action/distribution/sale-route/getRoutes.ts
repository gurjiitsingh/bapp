"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import {
  revalidatePath,
  revalidateTag,
} from "next/cache";

export type DistributionRoute = {
  id: string;

  routeCode: string;
  routeName: string;

  description?: string;
  remarks?: string;

  salesmanId?: string;
  salesmanName?: string;

  vehicleId?: string;
  vehicleName?: string;

  status: "ACTIVE" | "INACTIVE";

  createdAt?: number;
  updatedAt?: number;
};

export async function getRoutes(): Promise<
  DistributionRoute[]
> {
  try {
    const snapshot = await adminDb
      .collection("distributionRoutes")
      .orderBy("routeName", "asc")
      .get();

    const routes: DistributionRoute[] =
      snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,

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
      });

    return routes;
  } catch (error: any) {
    console.error(
      "❌ getRoutes:",
      error
    );

    return [];
  }
}