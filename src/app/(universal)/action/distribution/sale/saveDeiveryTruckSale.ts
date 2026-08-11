"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

import { updateStockLocation } from "../updateStockLocation";
import { addStockMovement } from "../addStockMovement";

import { readStockLocationsForItems } from "../redDataForSale/readStockLocationsForItems";
import { readCustomerAccountData } from "../redDataForSale/readCustomerAccountData";

import { recordTruckSaleLedger } from "../recordTruckSaleLedger";
import { readFinishedProductData } from "../redDataForSale/readFinishedProductData";

import { PaymentMethodType } from "@/lib/types/distribution/PaymentMethodType";

import { addTruckSaleItem } from "./addTruckSaleItem";
import { createTruckSaleMaster } from "./createTruckSaleMaster";

import { getActiveVehicleTrip } from "../getActiveVehicleTrip";
import { updateCustomerAccount } from "../../stock-finished/inventorySupplier/updateCustomerAccount";
import { applyCustomerTransaction } from "../../stock-finished/customer/applyCustomerTransaction";
import { applyCustomerTransactionNew } from "../../stock-finished/customer/applyCustomerTransactionNew";




// =====================================================
// TYPES
// =====================================================

type DeliveryTruckSaleProps = {
  vehicleId: string;
  vehicleName: string;

  locationCode: string;
  responsiblePerson: string;

  wholeSaleCutomerId: string;
  wholeSaleCutomerName: string;

  totalAmount: number;

  paymentStatus:
  | "PAID"
  | "PARTIAL"
  | "CREDIT";

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


// =====================================================
// SALE
// =====================================================

export async function saveDeiveryTruckSale({
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
}: DeliveryTruckSaleProps) {

  // ===================================================
  // BASIC VALIDATION
  // ===================================================

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

    if (!items || items.length === 0) {
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

    // -------------------------------------------------
    // Verify payment split
    // -------------------------------------------------

    // if (
    //   Math.round(
    //     (paidAmount + dueAmount) * 100
    //   ) !==
    //   Math.round(
    //     totalAmount * 100
    //   )
    // ) {
    //   return {
    //     success: false,
    //     message:
    //       "Paid amount and due amount do not match total amount.",
    //   };
    // }


    // ===================================================
    // CREATE SALE ID
    // ===================================================

    const saleId = crypto.randomUUID();

    let saleNo = "";
    // ===================================================
    // FIRESTORE TRANSACTION
    // ===================================================

    await adminDb.runTransaction(async (tx) => {

      // =================================================
      // 1. GET ACTIVE TRIP
      // =================================================

      const activeTrip =
        await getActiveVehicleTrip(
          tx,
          vehicleId
        );

      if (!activeTrip) {
        throw new Error(
          "No active trip found for this vehicle."
        );
      }

      const tripId =
        activeTrip.tripId;

      const tripNo =
        activeTrip.tripNo;
      // =================================================
      // CREATE HUMAN-READABLE SALE NUMBER
      // =================================================

      const nextSaleSequence =
        Number(activeTrip.saleSequence || 0) + 1;

      const vehicleCode =
        locationCode
          .replace(/\s+/g, "")
          .toUpperCase();

      const now = new Date();

      const year =
        now.getFullYear();

      const month =
        String(
          now.getMonth() + 1
        ).padStart(2, "0");

      const day =
        String(
          now.getDate()
        ).padStart(2, "0");

      saleNo =
        `SALE-${year}${month}${day}-${vehicleName}-${String(
          nextSaleSequence
        ).padStart(3, "0")}`;


      // =================================================
      // 2. READ VEHICLE STOCK
      // =================================================

      const stocks =
        await readStockLocationsForItems({
          tx,

          items,

          fromLocationType:
            "TRUCK",

          fromLocationRef:
            vehicleId,

          toLocationType:
            "FACTORY",

          toLocationRef:
            "MAIN",
        });


      // =================================================
      // 3. READ CUSTOMER ACCOUNT
      // =================================================

      const {
        currentBalance,
       
      } =
        await readCustomerAccountData({
          tx,

          wholeSaleCutomerId,
        });

      // =================================================
      // PAYMENT SPLIT LOGIC (NEW)
      // =================================================

      const salePaid = Math.min(paidAmount, totalAmount);
      const saleDue = totalAmount - salePaid;

      let remainingAmount = paidAmount - salePaid;

      // Old customer balance (positive = due, negative = advance)
      let updatedBalance = currentBalance;

      let newBalance = currentBalance - remainingAmount + saleDue;
 
      // Apply remaining to old due
      let appliedToOldDue = 0;

      if (remainingAmount > 0 && updatedBalance > 0) {
        appliedToOldDue = Math.min(remainingAmount, updatedBalance);

        remainingAmount -= appliedToOldDue;
        updatedBalance -= appliedToOldDue;
      }

      // Remaining becomes advance (negative balance)
      if (remainingAmount > 0) {
        updatedBalance -= remainingAmount;
      }



 
      // =================================================
      // 4. VALIDATE VEHICLE STOCK
      // =================================================

      for (const row of stocks) {

        const availableQuantity =
          Number(
            row.vehicle.quantity || 0
          );

        const requestedQuantity =
          Number(
            row.item.quantity || 0
          );

        if (
          availableQuantity <
          requestedQuantity
        ) {
          throw new Error(
            `${row.vehicle.productName} has insufficient vehicle stock.`
          );
        }
      }


      // =================================================
      // 5. TOTAL QUANTITY
      // =================================================

      const totalQuantity =
        items.reduce(
          (sum, item) =>
            sum +
            Number(
              item.quantity || 0
            ),
          0
        );


      // =================================================
      // 6. READ FINISHED PRODUCTS
      // =================================================

      const finishedProducts =
        new Map<
          string,
          any
        >();

      for (const row of stocks) {

        const product =
          await readFinishedProductData({
            tx,

            productId:
              row.vehicle.productId,
          });

        finishedProducts.set(
          row.vehicle.productId,
          product
        );
      }


      // =================================================
      // 7. CREATE SALE MASTER
      // =================================================

      await createTruckSaleMaster(
        tx,
        {
          saleId,
          saleNo,
          tripId,
          tripNo,
          vehicleId,
          vehicleName,

          locationCode,
          responsiblePerson,

          wholeSaleCutomerId,
          wholeSaleCutomerName,

          totalAmount,

          totalItems:
            items.length,

          totalQuantity,


          paidAmount: salePaid,
          dueAmount: saleDue,

          paymentStatus,
          paymentMethod,

          remarks,
          createdBy,
        }
      );


      // =================================================
      // 8. PROCESS SALE ITEMS
      // =================================================

      for (const row of stocks) {

        const quantity =
          Number(
            row.item.quantity || 0
          );

        const unitPrice =
          Number(
            row.item.wholesalePrice || 0
          );

        const lineValue =
          quantity *
          unitPrice;


        // ===============================================
        // REMOVE FROM VEHICLE STOCK
        // ===============================================

        await updateStockLocation({
          tx,

          snap:
            row.vehicle,

          quantity:
            -quantity,
        });


        // ===============================================
        // STOCK MOVEMENT
        // ===============================================

        await addStockMovement({
          tx,

          batchId:
            saleId,

          tripId,
          tripNo,
          movementType:
            "SALE",

          productId:
            row.vehicle.productId,

          productName:
            row.vehicle.productName,

          wholesalePrice:
            unitPrice,

          name:
            vehicleName,

          vehicleId,

          locationCode,

          responsiblePerson,

          quantity,

          fromLocationType:
            "TRUCK",

          fromLocationRef:
            vehicleId,

          toLocationType:
            "CUSTOMER",

          toLocationRef:
            wholeSaleCutomerId,

          customerName:
            wholeSaleCutomerName,

          customerId:
            wholeSaleCutomerId,

          remarks,

          createdBy,
        });


        // ===============================================
        // FINISHED PRODUCT LEDGER
        //
        // ITEM LEVEL ONLY
        //
        // No customer accounting here.
        // No payment here.
        // ===============================================

        const finishedProduct =
          finishedProducts.get(
            row.vehicle.productId
          );


        await recordTruckSaleLedger({
          tx,

          finishedProduct,

          id:
            row.vehicle.productId,

          type:
            "SALE",

          direction:
            "OUT",

          quantity,

          transactionUnit:
            "kg",

          unitPrice,

          note:
            remarks,

          createdBy,

          referenceId:
            saleId,

          referenceType:
            "SALE",
        });


        // ===============================================
        // COST / PROFIT SNAPSHOT
        // ===============================================

        const costPerUnit =
          Number(
            row.vehicle.avgCost || 0
          );

        const costValue =
          quantity *
          costPerUnit;

        const grossProfit =
          lineValue -
          costValue;


        // ===============================================
        // SALE ITEM
        // ===============================================

        await addTruckSaleItem(
          tx,
          {
            saleId,

            productId:
              row.vehicle.productId,

            productName:
              row.vehicle.productName,

            quantity,

            unitPrice,

            lineValue,

            costPerUnit,

            costValue,

            grossProfit,
          }
        );
      }


      // =================================================
      // 9. CUSTOMER ACCOUNT
      //
      // IMPORTANT:
      // ONE CUSTOMER TRANSACTION PER SALE
      // =================================================

      await updateCustomerAccount(tx, {
        wholeSaleCutomerId,
        wholeSaleCutomerName,

        type: "SALE",

        totalAmount,
        paidAmount,//: salePaid,
      
        currentBalance,
        

        paymentMethod,
      });

          // =================================================
      // 10A .EXTRA PAYMENT (OLD DUE / ADVANCE)
      // =================================================

      const extraPayment = paidAmount - salePaid;

      if (extraPayment > 0) {
        await applyCustomerTransactionNew(tx, {
          customerId: wholeSaleCutomerId,
          customerName: wholeSaleCutomerName,

          type: "PAYMENT",

          totalAmount: 0,
          returnProductAmount: 0,

          paidAmount: extraPayment,
          dueAmount: 0,

          currentBalance: updatedBalance,
newBalance,
          creditAmount: 0,
        

          paymentMethod,

          referenceId: saleId,
          referenceType: "EXTRA_PAYMENT",

          note: "Auto-adjusted extra payment",

          createdBy: createdBy || "admin",
          source: "ADMIN",
        });
      }


      // =================================================
      // 10. CUSTOMER TRANSACTION LEDGER
      // =================================================

      await applyCustomerTransactionNew(
        tx,
        {
          customerId:
            wholeSaleCutomerId,

          customerName:
            wholeSaleCutomerName,

          type:
            "SALE",

          totalAmount,

          returnProductAmount:
            0,

          paidAmount: salePaid,
          dueAmount: saleDue,

          currentBalance,
          newBalance,
          creditAmount:
            0,

       //   currentCreditBalance,

          paymentMethod,

          referenceId:
            saleId,

          referenceType:
            "SALE",

          note:
            remarks,

          createdBy:
            createdBy ||
            "admin",

          source:
            "ADMIN",
        }
      );


  
      // =================================================
      // 11. UPDATE TRIP SUMMARY
      //
      // IMPORTANT:
      // OUTSIDE ITEM LOOP
      // =================================================

      const tripRef =
        adminDb
          .collection(
            "distributionTrips"
          )
          .doc(tripId);


      tx.update(
        tripRef,
        {
          totalSalesAmount:
            admin.firestore.FieldValue.increment(
              totalAmount
            ),

          totalCashCollected:
            admin.firestore.FieldValue.increment(
              paidAmount
            ),

          totalCreditAmount:
            admin.firestore.FieldValue.increment(
              dueAmount
            ),
          saleSequence:
            admin.firestore.FieldValue.increment(1),

          updatedAt:
            new Date(),
        }
      );


      const settlementRef = adminDb
        .collection("salemanSettlements")
        .doc(tripId);

      tx.update(settlementRef, {

        totalSalesAmount:
          admin.firestore.FieldValue.increment(
            totalAmount
          ),

        newSaleCashCollected:
          admin.firestore.FieldValue.increment(
            paidAmount
          ),

        newSaleCreditAmount:
          admin.firestore.FieldValue.increment(
            dueAmount
          ),

        totalCashCollected:
          admin.firestore.FieldValue.increment(
            paidAmount
          ),

        amountPayableToManager:
          admin.firestore.FieldValue.increment(
            paidAmount
          ),

        updatedAt: new Date(),
      });

    });


    // ===================================================
    // SUCCESS
    // ===================================================

    return {
      success: true,
      saleId,
      saleNo,
      message:
        "Truck delivery sale recorded successfully.",
    };


  } catch (error: any) {

    console.error(
      "❌ deiveryTruckSale:",
      error
    );

    return {
      success: false,

      message:
        error?.message ||
        "Failed to record sale.",
    };
  }
}