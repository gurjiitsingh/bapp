"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

type AddRouteInput = {
  routeCode: string;
  routeName: string;

  description?: string;
  remarks?: string;

  // Current/default salesman
  salesmanId?: string;
  salesmanName?: string;

  // Current/default vehicle
  vehicleId?: string;
  vehicleName?: string;
};

export async function addRoute({
  routeCode,
  routeName,
  description = "",
  remarks = "",

  salesmanId = "",
  salesmanName = "",

  vehicleId = "",
  vehicleName = "",
}: AddRouteInput) {
  try {
    // =====================================================
    // VALIDATION
    // =====================================================

    const cleanRouteCode = routeCode?.trim();
    const cleanRouteName = routeName?.trim();

    if (!cleanRouteCode) {
      return {
        success: false,
        message: "Route code is required.",
      };
    }

    if (!cleanRouteName) {
      return {
        success: false,
        message: "Route name is required.",
      };
    }

    // =====================================================
    // CHECK DUPLICATE ROUTE CODE
    // =====================================================

    const existingSnapshot = await adminDb
      .collection("distributionRoutes")
      .where("routeCode", "==", cleanRouteCode)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      return {
        success: false,
        message: "A route with this route code already exists.",
      };
    }

    // =====================================================
    // CREATE ROUTE
    // =====================================================

    const routeRef = adminDb
      .collection("distributionRoutes")
      .doc();

    const now = new Date();

    const data = {
      id: routeRef.id,

      // ===================================================
      // ROUTE
      // ===================================================

      routeCode: cleanRouteCode,

      routeName: cleanRouteName,

      description:
        description?.trim() || "",

      remarks:
        remarks?.trim() || "",

      // ===================================================
      // CURRENT SALESMAN
      // ===================================================

      salesmanId:
        salesmanId || "",

      salesmanName:
        salesmanName?.trim() || "",

      // ===================================================
      // CURRENT VEHICLE
      // ===================================================

      vehicleId:
        vehicleId || "",

      vehicleName:
        vehicleName?.trim() || "",

      // ===================================================
      // STATUS
      // ===================================================

      status: "ACTIVE",

      // ===================================================
      // META
      // ===================================================

      createdAt: now,

      updatedAt: now,
    };

    await routeRef.set(data);

    return {
      success: true,

      routeId: routeRef.id,

      message: "Route created successfully.",
    };
  } catch (error: any) {
    console.error(
      "❌ addRoute:",
      error
    );

    return {
      success: false,

      message:
        error?.message ||
        "Failed to create route.",
    };
  }
}