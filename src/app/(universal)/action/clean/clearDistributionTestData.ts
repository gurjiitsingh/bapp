"use server";


// distribution test reset, you can clear all of these:
// truckSales + truckSales/{saleId}/items
// vehicleLoads + vehicleLoads/{loadId}/items
// vehicleLoadItems legacy collection
// distributionTrips
// driverSettlements
// customerLedger
// customerAccounts
// stockLocations only where it is NOT:
// locationType == "STORE"
// locationRef == "MAIN"



import { adminDb } from "@/lib/firebaseAdmin";

const BATCH_SIZE = 400;


// =====================================================
// DELETE QUERY
// =====================================================

async function deleteQuery(
  query: FirebaseFirestore.Query
) {
  let deleted = 0;

  while (true) {

    const snapshot =
      await query
        .limit(BATCH_SIZE)
        .get();

    if (snapshot.empty) {
      break;
    }

    const batch =
      adminDb.batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    deleted += snapshot.size;

    if (snapshot.size < BATCH_SIZE) {
      break;
    }
  }

  return deleted;
}


// =====================================================
// DELETE SUBCOLLECTION
// =====================================================

async function deleteSubcollection(
  collectionRef: FirebaseFirestore.CollectionReference
) {
  return deleteQuery(collectionRef);
}


// =====================================================
// TRUCK SALES
// =====================================================

async function clearTruckSales() {

  const snapshot =
    await adminDb
      .collection("truckSales")
      .get();

  let deletedItems = 0;

  for (const saleDoc of snapshot.docs) {

    // ---------------------------------------------
    // truckSales/{saleId}/items
    // ---------------------------------------------

    deletedItems +=
      await deleteSubcollection(
        saleDoc.ref.collection("items")
      );

    // ---------------------------------------------
    // SALE MASTER
    // ---------------------------------------------

    await saleDoc.ref.delete();
  }

  return {
    masters: snapshot.size,
    items: deletedItems,
  };
}


// =====================================================
// VEHICLE LOADS
// =====================================================

async function clearVehicleLoads() {

  const snapshot =
    await adminDb
      .collection("vehicleLoads")
      .get();

  let deletedItems = 0;

  for (const loadDoc of snapshot.docs) {

    // ---------------------------------------------
    // vehicleLoads/{loadId}/items
    // ---------------------------------------------

    deletedItems +=
      await deleteSubcollection(
        loadDoc.ref.collection("items")
      );

    // ---------------------------------------------
    // LOAD MASTER
    // ---------------------------------------------

    await loadDoc.ref.delete();
  }

  return {
    masters: snapshot.size,
    items: deletedItems,
  };
}


// =====================================================
// MAIN CLEANUP
// =====================================================

export async function clearDistributionTestData() {

  try {

    console.log(
      "🧹 Starting distribution test data cleanup..."
    );


    // =================================================
    // 1. TRUCK SALES
    // =================================================

    const truckSalesDeleted =
      await clearTruckSales();


    // =================================================
    // 2. VEHICLE LOADS
    // =================================================

    const vehicleLoadsDeleted =
      await clearVehicleLoads();


    // =================================================
    // 3. OLD VEHICLE LOAD ITEMS
    // =================================================
    //
    // Legacy collection:
    //
    // vehicleLoadItems
    //
    // Current system uses:
    //
    // vehicleLoads/{loadId}/items
    //
    // But delete old records too.
    //

    const vehicleLoadItemsDeleted =
      await deleteQuery(
        adminDb.collection(
          "vehicleLoadItems"
        )
      );


    // =================================================
    // 4. DISTRIBUTION TRIPS
    // =================================================

    const distributionTripsDeleted =
      await deleteQuery(
        adminDb.collection(
          "distributionTrips"
        )
      );


    // =================================================
    // 5. DRIVER SETTLEMENTS
    // =================================================

    const driverSettlementsDeleted =
      await deleteQuery(
        adminDb.collection(
          "driverSettlements"
        )
      );


    // =================================================
    // 6. CUSTOMER LEDGER
    // =================================================
    //
    // WARNING:
    // This clears ALL customer ledger records.
    //

    const customerLedgerDeleted =
      await deleteQuery(
        adminDb.collection(
          "customerLedger"
        )
      );


    // =================================================
    // 7. CUSTOMER ACCOUNTS
    // =================================================
    //
    // WARNING:
    // This clears ALL customer accounts.
    //
    // If customerAccounts contains permanent
    // customer master records, DON'T delete them.
    //
    // Instead reset their balances.
    //

    const customerAccountsDeleted =
      await deleteQuery(
        adminDb.collection(
          "customerAccounts"
        )
      );


    // =================================================
    // 8. STOCK LOCATIONS
    // =================================================
    //
    // IMPORTANT:
    //
    // KEEP:
    //
    // locationType = STORE
    // locationRef  = MAIN
    //
    // DELETE:
    //
    // TRUCK stock
    // other test locations
    //
    // Example that will remain:
    //
    // STORE / MAIN
    //
    // Example that will be deleted:
    //
    // TRUCK / vehicleId
    //

    const stockLocationsQuery =
      adminDb
        .collection("stockLocation")
        .where(
          "locationType",
          "!=",
          "STORE"
        );


    const stockLocationsDeleted =
      await deleteQuery(
        stockLocationsQuery
      );


    // =================================================
    // RESULT
    // =================================================

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
          distributionTripsDeleted,

        driverSettlements:
          driverSettlementsDeleted,

        customerLedger:
          customerLedgerDeleted,

        customerAccounts:
          customerAccountsDeleted,

        stockLocations:
          stockLocationsDeleted,
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