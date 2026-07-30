"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { RawInventoryUpdate } from "@/lib/types/inventory/RawInventoryUpdateType";
import { average } from "firebase/firestore";

export async function writeInventoryData_StoreAndDpt(
  tx: FirebaseFirestore.Transaction,
  updates: RawInventoryUpdate[],
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
    console.log("u----------------------u--",u)
    const dptAvgCost = Number(u.dptAvgCost || 0); //averageCost Dpt
    const sendQty = Number(u.sendQty || 0);//return qty
    const storeAvgCost = Number(u.storeAvgCost || 0); // avagCost inventory
    const storeStock = Number(u.storeStock || 0);

    //afterStock: afterStock,
    const storeStockValue = Number(u.storeStockValue || 0);

    // const movementValue = quantity * unitCost;
let newStockQty = 0;
let newStockValue = 0;
let newAvgPrice = 0;
let conversionFactor = u.conversionFactor

if (direction === "IN") {
  newStockQty = storeStock + sendQty;
  newStockValue =
  Number((storeStockValue + (sendQty * dptAvgCost)).toFixed(2));
newAvgPrice = newStockValue / (newStockQty/conversionFactor)
} else {
  if (sendQty > storeStock) {
    throw new Error("Stock underflow");
  }

  newStockQty = storeStock - sendQty;

newStockValue =  Number((newStockQty * storeAvgCost/conversionFactor).toFixed(2));
newAvgPrice = newStockValue / (newStockQty/conversionFactor)
}
  
// NOT USE ANYWHERE
 if (direction === "IN") {
  totalValue += sendQty * dptAvgCost;
} else {
  totalValue += sendQty * storeAvgCost;
}
  

 


 
 console.log("========== Inventory Update ==========");
 
  console.log("sendQty :", sendQty);
 console.log("currentStock :", u.storeStock);


console.log("newCurrentStock :", newStockQty);
console.log("stockValue   :", newStockValue);
console.log("averageCost  :", newAvgPrice);

console.log("======================================");

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