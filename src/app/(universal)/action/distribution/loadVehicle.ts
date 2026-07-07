"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { getStockLocation } from "./getStockLocationTx";
import { updateStockLocation } from "./updateStockLocation";
import { addStockLocation } from "./addStockLocationTx";
import { addStockMovement } from "./addStockMovement";

type LoadVehicleItem = {
  productId: string;
  quantity: number;
};
type LoadVehicleProps = {
  vehicleId: string;
  vehicleName: string;
  locationCode: string;
  responsiblePerson: string;

  remarks?: string;
  createdBy?: string;

  items: LoadVehicleItem[];
};

export async function loadVehicle({ 
  vehicleId,
  vehicleName,
  locationCode,
  responsiblePerson,
  remarks,
  createdBy,
  items,
}: LoadVehicleProps) {
  const db = adminDb;



  try {
    if (!vehicleId) {
      return {
        success: false,
        message: "Vehicle is required",
      };
    }

    if (!items.length) {
      return {
        success: false,
        message: "No products selected",
      };
    }

    await db.runTransaction(async (tx) => {
      // =========================
      // 1. READ
      // =========================

      const factoryStocks = [];

      for (const item of items) {
        const factory = await getStockLocation({
          tx,
          productId: item.productId,
          locationType: "STORE",
          locationRef: "MAIN",
        });

        if (!factory) {
          throw new Error("Factory stock not found");
        }




        const van = await getStockLocation({
          tx,
          productId: item.productId,
          locationType: "TRUCK",
          locationRef: vehicleId,
        });

        factoryStocks.push({
          item,
          factory,
          van,
        });



      }

      // =========================
      // 2. VALIDATE
      // =========================

      for (const row of factoryStocks) {


        if (row.factory.quantity < row.item.quantity) {
          throw new Error(
            `${row.factory.productName} has insufficient stock.`
          );
        }
      }

      // =========================
      // 3. WRITE
      // =========================

      for (const row of factoryStocks) {
        await updateStockLocation({
          tx,
          snap: row.factory,
          quantity: -row.item.quantity,
        });




        await addStockLocation({
          tx,
          existing: row.van,
          productId: row.factory.productId,
          productName: row.factory.productName,
            sellingPrice: row.factory.sellingPrice, 
      wholesalePrice: row.factory.wholesalePrice,
      costPrice: row.factory.costPrice,
      avgCost: row.factory.avgCost,
          // productMode: row.factory.productMode as
          //   | "raw_stock"
          //   | "finished_stock"
          //   | "simple",
          locationType: "TRUCK",
          locationRef: vehicleId,
          quantity: row.item.quantity,
        });


        
        // createDistributionLedger 

        await addStockMovement({
          tx,

          movementType: "TRANSFER",

          productId: row.factory.productId,
          productName: row.factory.productName,
          name: vehicleName,
          locationCode,
          responsiblePerson,
          //productMode: row.factory.productMode,

          quantity: row.item.quantity,

          fromLocationType: "STOCK",
          fromLocationRef: "MAIN",

          toLocationType: "TRUCK",
          toLocationRef: vehicleId,

          remarks,

          createdBy,
        });


      }
    });

    return {
      success: true,
      message: "Vehicle loaded successfully.",
    };
  } catch (error: any) {
    console.error(error);

    return {
      success: false,
      message: error.message,
    };
  }
}