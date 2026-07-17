"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { DepartmentStockUpdate } from "@/lib/types/department/DepartmentStockUpdate";

interface DepartmentStockRequest {
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number;
  averageCost: number;
  purchaseUnit: string;
  purchaseUnitCostInv?: number;
  purchaseUnitCost?: number
  consumptionUnit: string;
  conversionFactor: number;
}


export async function getDepartmentStockData(
  tx: FirebaseFirestore.Transaction,
  departmentId: string,
  dirction: "IN" | "OUT",
  items: DepartmentStockRequest[]
): Promise<DepartmentStockUpdate[]> {
  const updates: DepartmentStockUpdate[] = [];

  for (const item of items) {


    // Department Stock
    const query = adminDb
      .collection("departmentStock")
      .where("departmentId", "==", departmentId)
      .where("inventoryItemId", "==", item.inventoryItemId)
      .limit(1);

    const snap = await tx.get(query);

    const exists = !snap.empty;
    const doc = exists ? snap.docs[0] : null;
    const data = doc?.data();

    const currentQuantity = Number(data?.quantity ?? 0);

 

    
const DPTpurchaseUnitCost = Number(data?.purchaseUnitCost);

const safePurchaseUnitCost = Number.isFinite(DPTpurchaseUnitCost)
  ? DPTpurchaseUnitCost
  : 0;

console.log("item.purchaseUnitCostInv-------------------------------------", item.purchaseUnitCost)
    let newQuantity = 0;
    let currentStockInPurchaseUnit = 0;
    let newStockInPurchaseUnit = 0;

    if (dirction === "OUT" && item.quantity > currentQuantity) {
      throw new Error(
        `Insufficient department stock for ${item.inventoryItemName}`
      );
    }

    if (dirction == "IN") {
      newQuantity = currentQuantity + item.quantity;
    }
    else {
      newQuantity = currentQuantity - item.quantity;
    }

    let newAverageCost = 0;
    let newStockValue = 0;
    let newPurchaseUnitCost = 0;



    
 if (dirction === "IN") {
  // Existing stock expressed in purchase units (bags, boxes, etc.)
  currentStockInPurchaseUnit =
    Number(data?.currentStock ?? 0) /
    Number(data?.conversionFactor ?? item.conversionFactor ?? 1);

  // Incoming stock expressed in purchase units
  newStockInPurchaseUnit =
    Number(item.quantity) /
    Number(item.conversionFactor);

  const incomingPurchaseUnitCost =
    Number(item.purchaseUnitCost ?? 0);

  // First stock entry
  if (currentStockInPurchaseUnit === 0) {
    newPurchaseUnitCost = incomingPurchaseUnitCost;
  } else {
    // Weighted average purchase unit cost
    newPurchaseUnitCost =
      (
        currentStockInPurchaseUnit * safePurchaseUnitCost +
        newStockInPurchaseUnit * incomingPurchaseUnitCost
      ) /
      (
        currentStockInPurchaseUnit +
        newStockInPurchaseUnit
      );
  }

  // Round to 2 decimals
  newPurchaseUnitCost = Number(
    newPurchaseUnitCost.toFixed(2)
  );

  // Total stock in purchase units after transfer
  const totalStockInPurchaseUnit =
    Number(newQuantity) /
    Number(item.conversionFactor);

  newStockValue = Number(
    (
      totalStockInPurchaseUnit *
      newPurchaseUnitCost
    ).toFixed(2)
  );

  // Average cost per consumption unit (gm, ml, pcs)
  newAverageCost = Number(
    (
      newPurchaseUnitCost /
      Number(item.conversionFactor)
    ).toFixed(10)
  );
} else {
  // OUT transaction keeps the same cost
  newPurchaseUnitCost = safePurchaseUnitCost;

  newAverageCost =
    Number(data?.averageCost ?? 0);

  const remainingPurchaseQty =
    Number(newQuantity) /
    Number(item.conversionFactor);

  newStockValue = Number(
    (
      remainingPurchaseQty *
      newPurchaseUnitCost
    ).toFixed(2)
  );
}

console.log("=================================");
console.log("Item:", item.inventoryItemName);
console.log("Current Stock:", currentQuantity);
console.log("Transfer Qty:", item.quantity);

currentStockInPurchaseUnit =
  Number(data?.currentStock ?? 0) /
  Number(data?.conversionFactor ?? 1);

newStockInPurchaseUnit =
  Number(item.quantity ?? 0) /
  Number(item.conversionFactor ?? 1);

console.log("Current Stock (Purchase Unit):", currentStockInPurchaseUnit);
console.log("Incoming Stock (Purchase Unit):", newStockInPurchaseUnit);
console.log("Current Purchase Unit Cost:", safePurchaseUnitCost);
console.log("Incoming Purchase Unit Cost:", item.purchaseUnitCost);
console.log("newPurchaseUnitCost---------------:", newPurchaseUnitCost);
console.log("newStockValue---------------:", newStockValue);



console.log("=================================");


    updates.push({
      ref: doc?.ref ?? null,
      exists,

      departmentId,

      inventoryItemId: item.inventoryItemId,
      inventoryItemName: item.inventoryItemName,

      quantityChange: item.quantity,
      currentQuantity,
      newQuantity,
      newPurchaseUnitCost,
      newAverageCost,
      newStockValue,

      purchaseUnit: item.purchaseUnit,
      consumptionUnit: item.consumptionUnit,
      conversionFactor: item.conversionFactor,


    });
  }

  return updates;
}