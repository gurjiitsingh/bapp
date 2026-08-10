"use server";

import { adminDb } from "@/lib/firebaseAdmin";

import { getStockLocation } from "./getStockLocationTx";
import { updateStockLocation } from "./updateStockLocation";
import { addStockLocation } from "./addStockLocationTx";
import { addStockMovement } from "./addStockMovement";

import { generateLoadNumber } from "../production/distribution/vehicleLoad/generateLoadNumber";
import { addVehicleLoadItem } from "../production/distribution/vehicleLoad/addVehicleLoadItem";
import { createVehicleLoadMaster } from "../production/distribution/vehicleLoad/createVehicleLoadMaster";

import { getActiveVehicleTrip } from "./getActiveVehicleTrip";
import { createDriverSettlement } from "./saleman/createDriverSettlement";

// =====================================================
// TYPES
// =====================================================

type LoadVehicleItem = {
  productId: string;
  quantity: number;
};

type LoadVehicleProps = {
  // ===================================================
  // ROUTE
  // ===================================================

  routeId: string;
  routeName: string;

  // ===================================================
  // VEHICLE
  // ===================================================

  vehicleId: string;
  vehicleName: string;
  locationCode: string;

  // ===================================================
  // SALESMAN
  // ===================================================

  salesmanId: string;
  salesmanName: string;

  // ===================================================
  // LEGACY DRIVER / RESPONSIBLE PERSON
  // ===================================================
  //
  // Keep these optional for compatibility with older
  // code/data. New records should use salesman fields.
  //

  driverId?: string;
  driverName?: string;
  responsiblePerson?: string;

  // ===================================================
  // OTHER
  // ===================================================

  remarks?: string;
  createdBy?: string;

  items: LoadVehicleItem[];
};

// =====================================================
// LOAD VEHICLE
// =====================================================

export async function loadVehicle({
  // Route
  routeId,
  routeName,

  // Vehicle
  vehicleId,
  vehicleName,
  locationCode,

  // Salesman
  salesmanId,
  salesmanName,

  // Legacy
  driverId = "",
  driverName = "",
  responsiblePerson = "",

  // Other
  remarks,
  createdBy,

  items,
}: LoadVehicleProps) {

  const db = adminDb;

  try {

    // =================================================
    // BASIC VALIDATION
    // =================================================

    if (!routeId) {
      return {
        success: false,
        message: "Route is required.",
      };
    }

    if (!routeName?.trim()) {
      return {
        success: false,
        message: "Route name is required.",
      };
    }

    if (!vehicleId) {
      return {
        success: false,
        message: "Vehicle is required.",
      };
    }

    if (!vehicleName?.trim()) {
      return {
        success: false,
        message: "Vehicle name is required.",
      };
    }

    if (!salesmanId) {
      return {
        success: false,
        message: "Salesman is required.",
      };
    }

    if (!salesmanName?.trim()) {
      return {
        success: false,
        message: "Salesman name is required.",
      };
    }

    if (!items || items.length === 0) {
      return {
        success: false,
        message: "No products selected.",
      };
    }

    // Remove zero / invalid quantities
    const validItems = items.filter(
      (item) =>
        item.productId &&
        Number(item.quantity) > 0
    );

    if (validItems.length === 0) {
      return {
        success: false,
        message: "No valid products selected.",
      };
    }

    // =================================================
    // CREATE UNIQUE LOAD ID
    // =================================================

    const loadRef = db
      .collection("vehicleLoads")
      .doc();

    const loadId = loadRef.id;

    const loadNo = generateLoadNumber();

    // =================================================
    // TRANSACTION
    // =================================================
  const now = new Date();
       const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = now.getFullYear();
    let createdTripId = "";
    let tripNo = `TRIP-${year}${month}-${day}-${vehicleName}`;
    await db.runTransaction(async (tx) => {

    

      let totalQuantity = 0;
      let totalValue = 0;

      // =================================================
      // 1. READ ACTIVE VEHICLE TRIP
      // =================================================

      const activeTrip =
        await getActiveVehicleTrip(
          tx,
          vehicleId
        );

      // =================================================
      // 2. DETERMINE TRIP
      // =================================================

      let tripId: string;
     
      let isNewTrip = false;

      if (activeTrip) {

        // -----------------------------------------------
        // EXISTING JOURNEY
        // -----------------------------------------------

        tripId = activeTrip.tripId;
        tripNo = activeTrip.tripNo;

      } else {

        // -----------------------------------------------
        // NEW JOURNEY
        // -----------------------------------------------

        const tripRef = db
          .collection("distributionTrips")
          .doc();

        tripId = tripRef.id;
      
        isNewTrip = true;
      }
      console.log("tripId------------------", tripId)
      createdTripId = tripId;

      // =================================================
      // 3. READ FACTORY + VEHICLE STOCK
      // =================================================

      const factoryStocks: Array<{
        item: LoadVehicleItem;
        factory: any;
        van: any;
      }> = [];

      for (const item of validItems) {

        // ---------------------------------------------
        // FACTORY / MAIN STOCK
        // ---------------------------------------------

        const factory =
          await getStockLocation({
            tx,

            productId:
              item.productId,

            locationType:
              "STORE",

            locationRef:
              "MAIN",
          });

        if (!factory) {
          throw new Error(
            `Factory stock not found for product ${item.productId}`
          );
        }

        // ---------------------------------------------
        // VEHICLE STOCK
        // ---------------------------------------------

        const van =
          await getStockLocation({
            tx,

            productId:
              item.productId,

            locationType:
              "TRUCK",

            locationRef:
              vehicleId,
          });

        factoryStocks.push({
          item,
          factory,
          van,
        });
      }

      // =================================================
      // 4. VALIDATE FACTORY STOCK
      // =================================================

      for (const row of factoryStocks) {

        const requestedQty =
          Number(
            row.item.quantity || 0
          );

        const availableQty =
          Number(
            row.factory.quantity || 0
          );

        if (requestedQty <= 0) {
          throw new Error(
            `${row.factory.productName} has invalid quantity.`
          );
        }

        if (availableQty < requestedQty) {
          throw new Error(
            `${row.factory.productName} has insufficient stock. ` +
            `Available: ${availableQty}, Required: ${requestedQty}`
          );
        }
      }

      // =================================================
      // 5. MOVE STOCK MAIN → VEHICLE
      // =================================================

      for (const row of factoryStocks) {

        const quantity =
          Number(row.item.quantity);

        // ---------------------------------------------
        // REMOVE FROM MAIN STOCK
        // ---------------------------------------------

        await updateStockLocation({
          tx,

          snap:
            row.factory,

          quantity:
            -quantity,
        });

        // ---------------------------------------------
        // ADD TO VEHICLE STOCK
        // ---------------------------------------------

        await addStockLocation({
          tx,

          existing:
            row.van,

          productId:
            row.factory.productId,

          productName:
            row.factory.productName,

          sellingPrice:
            row.factory.sellingPrice,

          wholesalePrice:
            row.factory.wholesalePrice,

          costPrice:
            row.factory.costPrice,

          avgCost:
            row.factory.avgCost,

          locationType:
            "TRUCK",

          locationRef:
            vehicleId,

          quantity,
        });

        // =================================================
        // STOCK MOVEMENT
        // =================================================

        await addStockMovement({
          tx,

          // Loading operation
          batchId:
            loadId,

          // Entire journey
          tripId,
          tripNo,

          movementType:
            "TRANSFER",

          productId:
            row.factory.productId,

          productName:
            row.factory.productName,

          // Vehicle
          name:
            vehicleName,

          vehicleId,

          locationCode,

          // New responsible person
          responsiblePerson:
            salesmanName,

          wholesalePrice:
            row.factory.wholesalePrice,

          quantity,

          fromLocationType:
            "STOCK",

          fromLocationRef:
            "MAIN",

          toLocationType:
            "TRUCK",

          toLocationRef:
            vehicleId,

          remarks,

          createdBy,
        });

        // =================================================
        // LOAD REPORT VALUES
        // =================================================

        const costPerUnit =
          Number(
            row.factory.avgCost || 0
          );

        const lineValue =
          quantity *
          costPerUnit;

        totalQuantity +=
          quantity;

        totalValue +=
          lineValue;

        // =================================================
        // LOAD ITEM
        // =================================================

        await addVehicleLoadItem(tx, {

          loadId,

          tripId,

          productId:
            row.factory.productId,

          productName:
            row.factory.productName,

          quantity,

          costPerUnit,

          lineValue,

          sellingPrice:
            row.factory.sellingPrice,

          wholesalePrice:
            row.factory.wholesalePrice,
        });
      }

      // =================================================
      // 6. CREATE NEW TRIP
      // =================================================

      if (isNewTrip) {

        const tripRef =
          db
            .collection(
              "distributionTrips"
            )
            .doc(tripId);


        


        



        tx.set(tripRef, {

          id:
            tripId,

          tripNo,

          // =============================================
          // ROUTE
          // =============================================

          routeId,

          routeName,

          // =============================================
          // VEHICLE
          // =============================================

          vehicleId,

          vehicleName,

          locationCode,

          // =============================================
          // SALESMAN
          // =============================================

          salesmanId,

          salesmanName,

          saleSequence: 0,
          // =============================================
          // LEGACY DRIVER FIELDS
          // =============================================
          //
          // Keep these so old reports/code don't break.
          // New system treats salesman as the responsible
          // person.
          //

          driverId:
            driverId ||
            salesmanId,

          driverName:
            driverName ||
            salesmanName,

          responsiblePerson:
            responsiblePerson ||
            salesmanName,

          // =============================================
          // STATUS
          // =============================================

          status:
            "LOADED",

          // =============================================
          // LOAD TOTALS
          // =============================================

          totalLoadedQuantity:
            totalQuantity,

          totalLoadedValue:
            totalValue,

          // =============================================
          // SALES / RETURNS
          // =============================================

          totalSalesAmount:
            0,

          totalReturnAmount:
            0,

          totalCashCollected:
            0,

          totalPreviousCreditCollected:
            0,

          totalCreditAmount:
            0,

          // =============================================
          // SETTLEMENT
          // =============================================

          totalExpenses:
            0,

          totalAmountHandedOver:
            0,

          settlementDifference:
            0,

          // =============================================
          // META
          // =============================================

          remarks:
            remarks || "",

          createdBy:
            createdBy || "ADMIN",

          createdAt:
            now,

          updatedAt:
            now,
        });

        // =================================================
        // CREATE SALESMAN MONEY ACCOUNT
        // =================================================
        //
        // Existing helper is still named
        // createDriverSettlement for legacy reasons.
        //

        await createDriverSettlement({
          tx,

          tripId,

          vehicleId,

          vehicleName,

          driverId:
            driverId ||
            salesmanId,

          driverName:
            driverName ||
            salesmanName,

          openingCash:
            0,
        });

      } else {

        // =================================================
        // 7. EXISTING TRIP → ADD NEW LOAD TOTALS
        // =================================================

        const tripRef =
          db
            .collection(
              "distributionTrips"
            )
            .doc(tripId);

        tx.update(
          tripRef,
          {

            totalLoadedQuantity:
              (
                activeTrip
                  ?.totalLoadedQuantity ||
                0
              ) +
              totalQuantity,

            totalLoadedValue:
              (
                activeTrip
                  ?.totalLoadedValue ||
                0
              ) +
              totalValue,

            updatedAt:
              now,

            // New load means vehicle has stock
            status:
              "LOADED",
          }
        );
      }

      // =================================================
      // 8. CREATE LOAD MASTER
      // =================================================

      await createVehicleLoadMaster(
        tx,
        {

          // =============================================
          // LOAD
          // =============================================

          loadId,

          loadNo,

          // =============================================
          // TRIP
          // =============================================

          tripId,

          // =============================================
          // ROUTE
          // =============================================

          routeId,

          routeName,

          // =============================================
          // VEHICLE
          // =============================================

          vehicleId,

          vehicleName,

          locationCode,

          // =============================================
          // SALESMAN
          // =============================================

          driverId:
            driverId ||
            salesmanId,

          driverName:
            driverName ||
            salesmanName,

          // =============================================
          // LEGACY RESPONSIBLE PERSON
          // =============================================

          responsiblePerson:
            responsiblePerson ||
            salesmanName,

          // =============================================
          // META
          // =============================================

          remarks,

          createdBy,

          businessDate:
            now
              .toISOString()
              .slice(0, 10),

          // =============================================
          // TOTALS
          // =============================================

          totalItems:
            validItems.length,

          totalQuantity,

          totalValue,

          // =============================================
          // STATUS
          // =============================================

          status:
            "LOADED",
        }
      );

    });

    // =================================================
    // SUCCESS
    // =================================================

    return {

      success:
        true,

      tripId:
        createdTripId,

      loadId,

      loadNo,

      message:
        "Vehicle loaded successfully.",
    };

  } catch (error: any) {

    console.error(
      "❌ loadVehicle:",
      error
    );

    return {

      success:
        false,

      message:
        error?.message ||
        "Failed to load vehicle.",
    };
  }
}