"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";

export type UpdateRouteType = {
  id: string;

  routeCode: string;
  routeName: string;

  description?: string;
  remarks?: string;

  salesmanId?: string;
  salesmanName?: string;

  vehicleId?: string;
  vehicleName?: string;

  status?: "ACTIVE" | "INACTIVE";
};

export async function updateRoute({
  id,
  routeCode,
  routeName,
  description,
  remarks,

  salesmanId,
  salesmanName,

  vehicleId,
  vehicleName,

  status = "ACTIVE",
}: UpdateRouteType) {
  try {
    // =====================================================
    // VALIDATION
    // =====================================================

    if (!id) {
      return {
        success: false,
        message: "Route ID is required.",
      };
    }

    const normalizedCode =
      routeCode
        ?.replace(/\s+/g, "")
        .trim()
        .toUpperCase();

    if (!normalizedCode) {
      return {
        success: false,
        message: "Route code is required.",
      };
    }

    if (!routeName?.trim()) {
      return {
        success: false,
        message: "Route name is required.",
      };
    }

    // =====================================================
    // ROUTE REFERENCE
    // =====================================================

    const routeRef = adminDb
      .collection("distributionRoutes")
      .doc(id);

    // =====================================================
    // CHECK ROUTE EXISTS
    // =====================================================

    const routeSnap =
      await routeRef.get();

    if (!routeSnap.exists) {
      return {
        success: false,
        message: "Route not found.",
      };
    }

    // =====================================================
    // CHECK DUPLICATE ROUTE CODE
    // =====================================================

    const duplicateSnapshot =
      await adminDb
        .collection("distributionRoutes")
        .where(
          "routeCode",
          "==",
          normalizedCode
        )
        .limit(10)
        .get();

    const duplicate =
      duplicateSnapshot.docs.find(
        (doc) => doc.id !== id
      );

    if (duplicate) {
      return {
        success: false,
        message:
          "Another route already uses this route code.",
      };
    }

    // =====================================================
    // UPDATE
    // =====================================================

    const now = new Date();

    await routeRef.update({
      routeCode:
        normalizedCode,

      routeName:
        routeName.trim(),

      description:
        description?.trim() || "",

      remarks:
        remarks?.trim() || "",

      // ===================================================
      // SALESMAN
      // ===================================================

      salesmanId:
        salesmanId || "",

      salesmanName:
        salesmanName?.trim() || "",

      // ===================================================
      // VEHICLE
      // ===================================================

      vehicleId:
        vehicleId || "",

      vehicleName:
        vehicleName?.trim() || "",

      // ===================================================
      // STATUS
      // ===================================================

      status:
        status === "INACTIVE"
          ? "INACTIVE"
          : "ACTIVE",

      updatedAt:
        now,
    });

    // =====================================================
    // CACHE
    // =====================================================

    revalidateTag(
      "distribution-routes",
      "max"
    );

    revalidatePath(
      "/admin/distribution/routes"
    );

    revalidatePath(
      `/admin/distribution/route/edit/${id}`
    );

    // =====================================================
    // SUCCESS
    // =====================================================

    return {
      success: true,

      routeId: id,

      message:
        "Route updated successfully.",
    };
  } catch (error: any) {
    console.error(
      "❌ updateRoute:",
      error
    );

    return {
      success: false,

      message:
        error?.message ||
        "Failed to update route.",
    };
  }
}