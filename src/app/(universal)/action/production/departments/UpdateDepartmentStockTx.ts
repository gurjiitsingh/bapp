"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { DepartmentStockUpdate } from "./getDepartmentStockData";

interface UpdateDepartmentStockInput {
  transaction: FirebaseFirestore.Transaction;
  update: DepartmentStockUpdate;
}

export async function updateDepartmentStockTx({
  transaction: tx,
  update,
}: UpdateDepartmentStockInput) {
  const db = adminDb;
  const now = new Date();
  //  console.log("update---------------------",update)

  const newStockValue = update.newQuantity * update.newAverageCost!;

  if (update.exists && update.ref) {
  //  console.log("update.newQuantity----------",update.newQuantity)
    console.log("update.averageCost----------",update.averageCost)
   // console.log("update.newQuantity----------",update.newQuantity)
    tx.update(update.ref, {
      quantity: update.newQuantity,
      averageCost: update.newAverageCost,
      stockValue: newStockValue, 
      updatedAt: now,
    });

    return;
  }



  const ref = db.collection("departmentStock").doc();

  tx.set(ref, {
    id: ref.id,

    departmentId: update.departmentId,

    inventoryItemId: update.inventoryItemId,
    inventoryItemName: update.inventoryItemName,

    quantity: update.newQuantity * update.conversionFactor,
    currentStock: update.newQuantity * update.conversionFactor,
    averageCost: update.newAverageCost,

    purchaseUnit: update.purchaseUnit,
    consumptionUnit: update.consumptionUnit,
    conversionFactor: update.conversionFactor,
     
    updatedAt: now,
  });
}