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


  const newStockValue = Number(
    (
      (update.newQuantity! * update.newPurchaseUnitCost) /
      update.conversionFactor
    ).toFixed(2)
  );

  console.log("========== Department Stock Update ==========");
  console.log("Quantity New value        :", update.newQuantity);
  console.log("Average Cost      :", update.newPurchaseUnitCost); // or update.newAverageCost
  console.log("Average Cost      :", update.newPurchaseUnitCost);
  console.log("update.conversionFactor       :", update.conversionFactor);
  console.log("Purchase Unit Cost:", update.newPurchaseUnitCost);
  console.log("Current Stock     :", update.newQuantity);
  console.log("Stock Value       :", newStockValue);

    let averageCost = update.newPurchaseUnitCost;
  let purchaseUnitCost = update.newPurchaseUnitCost;

  if (update.newQuantity == 0) {
    averageCost = 0;
    purchaseUnitCost = 0;
  }


  const data = {
    quantity: update.newQuantity,
    averageCost: averageCost,
    purchaseUnitCost: purchaseUnitCost,
    currentStock: update.newQuantity,
    stockValue: newStockValue,
    updatedAt: now,
  };

  console.log("Updating Firestore with:", data);





  if (update.exists && update.ref) {

    tx.update(update.ref, data);
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
    averageCost: update.newPurchaseUnitCost,
    purchaseUnitCost:  update.newPurchaseUnitCost,
    stockValue: newStockValue,
    purchaseUnit: update.purchaseUnit,
    consumptionUnit: update.consumptionUnit,
    conversionFactor: update.conversionFactor,

    updatedAt: now,
  });
}