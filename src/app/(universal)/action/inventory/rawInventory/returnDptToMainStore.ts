"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

export async function returnDptToMainStore(
  tx: FirebaseFirestore.Transaction,
  updates: any[],
  referenceId: string,
  direction: "IN" | "OUT" = "IN" // default should be IN for return
) {
  const now = admin.firestore.FieldValue.serverTimestamp();

  // returnQty: returnQty,
  //  averageCostStore:
  //stockValueStore
  //conversionFactor

  let totalValue = 0;

  for (const u of updates) {
    const averageCostDpt = Number(u.averageCostDpt || 0); //averageCost Dpt
    const returnQty = Number(u.returnQty || 0);//return qty
    const averageCostStore = Number(u.averageCostStore || 0); // avagCost inventory
    const currentStockStore = Number(u.currentStockStore || 0);
 const modifistocke = Number(u.afterStock || 0);
    //afterStock: afterStock,
    const stockValueStore = Number(u.stockValueStore || 0);

    // const movementValue = quantity * unitCost;
  const newStockQty = currentStockStore + returnQty;
const newStockValue = averageCostDpt * returnQty + averageCostStore * currentStockStore;
const newAvgPrice = newStockValue / newStockQty;
    // ✅ Fix rounding + zero division
  
console.log("averageCostDpt:", averageCostDpt)
   console.log("returnQty:", returnQty)
   console.log("averageCostStore:", averageCostStore)
   console.log("currentStockStore:", currentStockStore)
   console.log("currentStockStore:", currentStockStore)

    // ✅ Update Inventory
    tx.update(u.ref, {
      currentStock: newStockQty,
      stockValue: newStockValue,
      averageCost: newAvgPrice,
      updatedAt: now,
    });

 
  }

  return Number(totalValue.toFixed(2));
}