"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

export async function writeInventoryData_StoreAndDpt(
  tx: FirebaseFirestore.Transaction,
  updates: any[],
  referenceId: string,
  direction: "IN" | "OUT" = "IN" // default should be IN for return
) {
  const now = admin.firestore.FieldValue.serverTimestamp();

  // sendQty: sendQty,
  //  storeAvgCost:
  //storeStockValue
  //conversionFactor

  let totalValue = 0;

  for (const u of updates) {
    const dptAvgCost = Number(u.dptAvgCost || 0); //averageCost Dpt
    const sendQty = Number(u.sendQty || 0);//return qty
    const storeAvgCost = Number(u.storeAvgCost || 0); // avagCost inventory
    const storeStock = Number(u.storeStock || 0);

    //afterStock: afterStock,
    const storeStockValue = Number(u.storeStockValue || 0);

    // const movementValue = quantity * unitCost;
let newStockQty = 0;
let newStockValue = 0;

if (direction === "IN") {
  newStockQty = storeStock + sendQty;
  newStockValue =
  Number((storeStockValue + (sendQty * dptAvgCost)).toFixed(2));

} else {
  if (sendQty > storeStock) {
    throw new Error("Stock underflow");
  }

  newStockQty = storeStock - sendQty;
newStockValue =
  Number((storeStockValue - (sendQty * storeAvgCost)).toFixed(2));
}
   
// NOT USE ANYWHERE
 if (direction === "IN") {
  totalValue += sendQty * dptAvgCost;
} else {
  totalValue += sendQty * storeAvgCost;
}
  
const newAvgPrice =
  newStockQty > 0
    ? Number((newStockValue / newStockQty).toFixed(4))
    : 0;




    // console.log("dptAvgCost:", dptAvgCost)
    // console.log("sendQty:", sendQty)
    // console.log("storeAvgCost:", storeAvgCost)
    // console.log("storeStock:", storeStock)
    // console.log("convertionfactor:", u.conversionFactor)


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