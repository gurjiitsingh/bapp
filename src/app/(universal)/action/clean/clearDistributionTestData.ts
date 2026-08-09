"use server";

import { adminDb } from "@/lib/firebaseAdmin";

const BATCH_SIZE = 400;

async function deleteQuery(
  query: FirebaseFirestore.Query
) {
  while (true) {
    const snapshot = await query.limit(BATCH_SIZE).get();

    if (snapshot.empty) {
      break;
    }

    const batch = adminDb.batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    if (snapshot.size < BATCH_SIZE) {
      break;
    }
  }
}


// =====================================================
// DELETE SUBCOLLECTION
// =====================================================

async function deleteSubcollection(
  collectionRef: FirebaseFirestore.CollectionReference
) {
  while (true) {
    const snapshot =
      await collectionRef
        .limit(BATCH_SIZE)
        .get();

    if (snapshot.empty) {
      break;
    }

    const batch = adminDb.batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    if (snapshot.size < BATCH_SIZE) {
      break;
    }
  }
}


// =====================================================
// TRUCK SALES
// =====================================================

async function clearTruckSales() {
  const snapshot = await adminDb
    .collection("truckSales")
    .get();

  for (const saleDoc of snapshot.docs) {

    // Delete truckSales/{saleId}/items/*
    await deleteSubcollection(
      saleDoc.ref.collection("items")
    );

    // Delete sale master
    await saleDoc.ref.delete();
  }

  return snapshot.size;
}


// =====================================================
// VEHICLE LOADS
// =====================================================

async function clearVehicleLoads() {
  const snapshot = await adminDb
    .collection("vehicleLoads")
    .get();

  for (const loadDoc of snapshot.docs) {

    // Delete vehicleLoads/{loadId}/items/*
    await deleteSubcollection(
      loadDoc.ref.collection("items")
    );

    // Delete load master
    await loadDoc.ref.delete();
  }

  return snapshot.size;
}


// =====================================================
// MAIN CLEANUP
// =====================================================

export async function clearDistributionTestData() {
  try {

    console.log(
      "🧹 Starting distribution test data cleanup..."
    );


    // ================================================
    // 1. TRUCK SALES
    // ================================================

    const truckSalesDeleted =
      await clearTruckSales();


    // ================================================
    // 2. VEHICLE LOADS
    // ================================================

    const vehicleLoadsDeleted =
      await clearVehicleLoads();


    // ================================================
    // 3. OLD / SEPARATE VEHICLE LOAD ITEMS
    // ================================================
    //
    // Your current code stores items inside:
    //
    // vehicleLoads/{loadId}/items
    //
    // But if old testing data exists in:
    //
    // vehicleLoadItems
    //
    // delete that collection too.
    //

    const vehicleLoadItemsQuery =
      adminDb.collection("vehicleLoadItems");

    const vehicleLoadItemsDeleted =
      await deleteQuery(
        vehicleLoadItemsQuery
      );


    // ================================================
    // 4. DISTRIBUTION TRIPS
    // ================================================

    const tripsDeleted =
      await deleteQuery(
        adminDb.collection("distributionTrips")
      );


    console.log(
      "✅ Distribution test data cleared."
    );


    return {
      success: true,

      deleted: {
        truckSales:
          truckSalesDeleted,

        vehicleLoads:
          vehicleLoadsDeleted,

        vehicleLoadItems:
          vehicleLoadItemsDeleted,

        distributionTrips:
          tripsDeleted,
      },

      message:
        "Distribution test data cleared successfully.",
    };

  } catch (error: any) {

    console.error(
      "❌ clearDistributionTestData:",
      error
    );

    return {
      success: false,

      message:
        error?.message ||
        "Failed to clear distribution test data.",
    };
  }
}