"use server";


//RED CUSOTMER DATA    readCustomerAccountData

import { adminDb } from "@/lib/firebaseAdmin";
import { getStockLocation } from "../getStockLocationTx";
import { updateStockLocation } from "../updateStockLocation";
import { addStockLocation } from "../addStockLocationTx";
import { addStockMovement } from "../addStockMovement";

import { readStockLocationsForItems } from "../redDataForSale/readStockLocationsForItems";
import { readCustomerAccountData } from "../redDataForSale/readCustomerAccountData";
import { addItemSaleTruck } from "../addItemSaleTruck";
import { readFinishedProductData } from "../redDataForSale/readFinishedProductData";

type deliveryTruckSaleItem = {
  productId: string;
  quantity: number;
};

type deliveryTruckSaleProps = {
  vehicleId: string;
  vehicleName: string;
  locationCode: string;
  responsiblePerson: string;

  wholeSaleCutomerId: string;
  wholeSaleCutomerName: string;

  remarks?: string;
  createdBy?: string;

  items: deliveryTruckSaleItem[];
};

export async function deiveryTruckSale({
  vehicleId,
  vehicleName,
  locationCode,
  responsiblePerson,

  wholeSaleCutomerId,
  wholeSaleCutomerName,

  remarks,
  createdBy,
  items,
}: deliveryTruckSaleProps) {

  if (!wholeSaleCutomerId) {
    return {
      success: false,
      message: "Customer is required.",
    };
  }



  try {
    if (!vehicleId) {
      return {
        success: false,
        message: "Vehicle is required.",
      };
    }

    if (!items.length) {
      return {
        success: false,
        message: "No products selected.",
      };
    }

    await adminDb.runTransaction(async (tx) => {

      let stocks = [];

      // =========================
      // READ
      // =========================

      stocks = await readStockLocationsForItems({
        tx,
        items,

        fromLocationType: "TRUCK",
        fromLocationRef: vehicleId,

        toLocationType: "FACTORY",
        toLocationRef: "MAIN",
      });


      //CUSTOMER DATA
      const {
        currentBalance,
        currentCreditBalance,
      } = await readCustomerAccountData({
        tx,
        wholeSaleCutomerId,
      });

      console.log("coust data--------------", currentBalance, currentCreditBalance)
      // =========================
      // VALIDATE
      // =========================

      for (const row of stocks) {
        if (row.vehicle.quantity < row.item.quantity) {
          throw new Error(
            `${row.vehicle.productName} has insufficient vehicle stock.`
          );
        }
      }


   const finishedProducts = new Map();

for (const row of stocks) {
  const product = await readFinishedProductData({
    tx,
    productId: row.vehicle.productId,
  });

  finishedProducts.set(row.vehicle.productId, product);
}

      // =========================
      // WRITE
      // =========================

      for (const row of stocks) {
        // Remove from vehicle
        await updateStockLocation({
          tx,
          snap: row.vehicle,
          quantity: -row.item.quantity,
        });

  

        // Movement history
        await addStockMovement({
          tx,

          movementType: "SALE",

          productId: row.vehicle.productId,
          productName: row.vehicle.productName,
          //productMode: row.van.productMode,
          name: vehicleName,
          locationCode,
          responsiblePerson: responsiblePerson,
          quantity: row.item.quantity,

          fromLocationType: "TRUCK",
          fromLocationRef: vehicleId,

          toLocationType: "CUSTOMER",
          toLocationRef: wholeSaleCutomerId,
          customerName: wholeSaleCutomerName,
          remarks,
          createdBy,
        });

        let runningBalance = currentBalance;
        let runningCreditBalance = currentCreditBalance;

        // NOW PROCESS SALE
        const finishedProduct =
  finishedProducts.get(row.vehicle.productId);

        let result = await addItemSaleTruck({
          tx,
finishedProduct,
          id: row.vehicle.productId,

          wholeSaleCutomerId,
          wholeSaleCutomerName,

          currentBalance: runningBalance,
          currentCreditBalance: runningCreditBalance,

          type: "SALE",
          direction: "OUT",

          quantity: row.item.quantity,
          transactionUnit: 'kg',// row.vehicle.transactionUnit,

          unitPrice: 0,

          paymentStatus: "PAID",
          paymentMethod: "CASH",

          paidAmount: 0,
          dueAmount: 0,

          note: remarks,
          createdBy,

          referenceType: "SALE",
        });
        runningBalance = result.currentBalance!;
        runningCreditBalance = result.currentCreditBalance!;

      }
    });

    return {
      success: true,
      message: "Truck delivery sale recorded successfully.",
    };
  } catch (error: any) {
    console.error(error);

    return {
      success: false,
      message: error.message || "Failed to record sale.",
    };
  }
}