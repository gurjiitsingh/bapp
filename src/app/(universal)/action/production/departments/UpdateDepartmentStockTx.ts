"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { DepartmentStockUpdate } from "@/lib/types/department/DepartmentStockUpdate";
 

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


  const newStockValue = update.newQuantity! * update.newAverageCost!;

  
 
  if (update.exists && update.ref) {

    tx.update(update.ref, {
      quantity: update.newQuantity, 
      averageCost: update.newAverageCost,
      currentStock: update.newQuantity,
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

    quantity: update.newQuantity,
    currentStock: update.newQuantity,
    averageCost: update.newAverageCost,
stockValue: newStockValue, 
    purchaseUnit: update.purchaseUnit,
    consumptionUnit: update.consumptionUnit,
    conversionFactor: update.conversionFactor,
     
    updatedAt: now,
  });
}