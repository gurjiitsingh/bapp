"use server";


//RED CUSOTMER DATA    readCustomerAccountData

import { adminDb } from "@/lib/firebaseAdmin";
import { updateStockLocation } from "../updateStockLocation";
import { addStockMovement } from "../addStockMovement";

import { readStockLocationsForItems } from "../redDataForSale/readStockLocationsForItems";
import { readCustomerAccountData } from "../redDataForSale/readCustomerAccountData";
import { addItemSaleTruck } from "../addItemSaleTruck";
import { readFinishedProductData } from "../redDataForSale/readFinishedProductData";
import { PaymentMethodType } from "@/lib/types/distribution/PaymentMethodType";
import { addTruckSaleItem } from "./addTruckSaleItem";
import { createTruckSaleMaster } from "./createTruckSaleMaster";



type deliveryTruckSaleProps = {
  vehicleId: string;
  vehicleName: string;
  locationCode: string;
  responsiblePerson: string;

  wholeSaleCutomerId: string;
  wholeSaleCutomerName: string;

  totalAmount: number;

  paymentStatus: "PAID" | "PARTIAL" | "CREDIT";
  paymentMethod?: PaymentMethodType;

  paidAmount: number;
  dueAmount: number;

  remarks?: string;
  createdBy?: string;

  items: {
    productId: string;
    quantity: number;
    wholesalePrice: number;
  }[];
};

export async function deiveryTruckSale({
  vehicleId,
  vehicleName,
  locationCode,
  responsiblePerson,

  wholeSaleCutomerId,
  wholeSaleCutomerName,

  totalAmount,

  paymentStatus,
  paymentMethod,
  paidAmount,
  dueAmount,

  remarks,
  createdBy,
  items,

}: deliveryTruckSaleProps) {

  console.log("data------------",
    vehicleId,
    vehicleName,
    locationCode,
    responsiblePerson,

    wholeSaleCutomerId,
    wholeSaleCutomerName,

    totalAmount,

    paymentStatus,
    paymentMethod,
    paidAmount,
    dueAmount,

    remarks,
    createdBy,
    items,)

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

    if (totalAmount <= 0) {
      return {
        success: false,
        message: "Invalid total amount.",
      };
    }


    if (paidAmount < 0 || dueAmount < 0) {
      return {
        success: false,
        message: "Invalid payment amount.",
      };
    }


    if (
      Math.round((paidAmount + dueAmount) * 100) !==
      Math.round(totalAmount * 100)
    ) {
      return {
        success: false,
        message:
          "Paid amount and due amount do not match total amount.",
      };
    }

    const saleId = `SALE-${new Date()
      .toISOString()
      .replace(/[-:TZ.]/g, '')
      .slice(0, 14)}`;

    await adminDb.runTransaction(async (tx) => {



      // =========================
      // READ
      // =========================

      const stocks = await readStockLocationsForItems({
        tx,
        items,
        fromLocationType: 'TRUCK',
        fromLocationRef: vehicleId,
        toLocationType: 'FACTORY',
        toLocationRef: 'MAIN',
      });


      //CUSTOMER DATA
      const {
        currentBalance,
        currentCreditBalance,
      } = await readCustomerAccountData({
        tx,
        wholeSaleCutomerId,
      });




      // =========================
      // CREATE SALE HEADER
      // =========================



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




      const totalQuantity = items.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      );



  

      console.log("TOTAL SALE", totalAmount);

      const finishedProducts = new Map();

      for (const row of stocks) {
        const product = await readFinishedProductData({
          tx,
          productId: row.vehicle.productId,
        });

        finishedProducts.set(row.vehicle.productId, product);
      }
    
      
          // =========================
      // CREATE SALE HEADER
      // =========================

      await createTruckSaleMaster(tx, {
        saleId,

        vehicleId,
        vehicleName,
        locationCode,
        responsiblePerson,

        wholeSaleCutomerId,
        wholeSaleCutomerName,

        totalAmount,

        totalItems: items.length,
        totalQuantity,

        paidAmount,
        dueAmount,

        paymentStatus,
        paymentMethod,

        remarks,
        createdBy,
      });

      let runningBalance = currentBalance;
      let runningCreditBalance = currentCreditBalance;

      // =========================
      // WRITE
      // =========================
console.log("wholeSaleCutomerId---------------------", wholeSaleCutomerId)
      for (const row of stocks) {


        const wholesalePrice = row.item.wholesalePrice;
        await updateStockLocation({
          tx,
          snap: row.vehicle,
          quantity: -row.item.quantity,
        });

        console.log("data------------", 2)

        // Movement history
     await addStockMovement({
  tx,
  batchId: saleId,
  movementType: 'SALE',

  productId: row.vehicle.productId,
  productName: row.vehicle.productName,

  // add this line
  wholesalePrice: row.item.wholesalePrice,

  name: vehicleName,
  locationCode,
  responsiblePerson,
  quantity: row.item.quantity,

  fromLocationType: 'TRUCK',
  fromLocationRef: vehicleId,

  toLocationType: 'CUSTOMER',
  toLocationRef: wholeSaleCutomerId,

  customerName: wholeSaleCutomerName,
  customerId: wholeSaleCutomerId,

  remarks,
  createdBy,
});




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

          transactionUnit: "kg",

          unitPrice: row.item.wholesalePrice,

          paymentStatus,
          paymentMethod: paymentMethod as PaymentMethodType,

          paidAmount,
          dueAmount,

          note: remarks,

          createdBy,

          referenceType: "SALE",
        });

        // =========================
        // SAVE SALE ITEM
        // =========================
        const lineValue =
          Number(row.item.quantity || 0) *
          Number(row.item.wholesalePrice || 0);
        await addTruckSaleItem(tx, {
          saleId,
          productId: row.vehicle.productId,
          productName: row.vehicle.productName,
          quantity: row.item.quantity,
          unitPrice: row.item.wholesalePrice,
          lineValue,
        });




        // const itemRef = saleRef
        //   .collection('items')
        //   .doc();

        // tx.set(itemRef, {
        //   productId: row.vehicle.productId,
        //   productName: row.vehicle.productName,

        //   quantity: Number(row.item.quantity || 0),

        //   unitPrice: Number(row.item.wholesalePrice || 0),

        //   lineValue,

        //   createdAt: new Date(),
        // });


        runningBalance = result.currentBalance!;
        runningCreditBalance = result.currentCreditBalance!;




      }
    });
    console.log("data------------", 4)
    // return {
    //   success: true,
    //   message: "Truck delivery sale recorded successfully.",
    // };
    return {
      success: true,
      saleId,
      message: 'Truck delivery sale recorded successfully.',
    };
  } catch (error: any) {
    console.error(error);

    return {
      success: false,
      message: error.message || "Failed to record sale.",
    };
  }
}