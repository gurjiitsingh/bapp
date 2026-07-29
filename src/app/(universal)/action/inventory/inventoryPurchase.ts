"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { ApplyInventoryTransactionType } from "@/lib/types/ApplyInventoryTransactionType";
import { InventoryLedgerType } from "@/lib/types/inventory/InventoryLedgerType";



const COST_TYPES = new Set([
    "PURCHASE",
    "OPENING_STOCK",
    "CUSTOMER_RETURN",
    "CLEAR",
]);

export async function inventoryPurchase(
    tx: FirebaseFirestore.Transaction,
    {
        inventoryItemId,

        type,
        direction,

        quantity,
        stockValue,
        unitCost,

        purchaseQuantity,
        purchaseUnit,
        purchaseUnitCost,
        conversionFactor,

        supplierId,
        supplierName,

        totalAmount = 0,
        paidAmount = 0,
        dueAmount = 0,
        paymentStatus = "PAID",
        paymentMethod = null,

        referenceType = "MANUAL",
        referenceId = "",

        note = "",
        createdBy = "system",

        source = "SYSTEM",
    }: ApplyInventoryTransactionType) {


    const now = admin.firestore.FieldValue.serverTimestamp();

    if (quantity <= 0) {
        throw new Error("Quantity must be greater than zero");
    }

    const inventoryRef =
        adminDb.collection("inventoryItems").doc(inventoryItemId);


    const snap = await tx.get(inventoryRef);

    if (!snap.exists) {
        throw new Error("Inventory item not found");
    }

    const inventory = snap.data()!;

    // =====================================================
    // UPDATE INVENTORY ITEM (MASTER STOCK)
    // =====================================================

    const beforeStock =
        Number(inventory.currentStock) || 0;

    const beforeAverageCost =
        Number(inventory.averageCost) || 0;

    const beforeStockValue =
        Number(inventory.stockValue) || 0;

    const purchaseUnitCostN = Number(purchaseUnitCost) || 0;

    const totalPurchaseAmount = purchaseUnitCostN * purchaseQuantity!;

    let afterStock = beforeStock;
    let afterAverageCost = beforeAverageCost;
    let afterStockValue = beforeStockValue;

    const isCostMovement = COST_TYPES.has(type);

    // Use entered cost, otherwise current average cost
    const finalUnitCost = Number(unitCost || beforeAverageCost);


    afterStock = beforeStock + quantity;

    // afterStockValue =
    //     beforeStockValue + totalAmount;
    afterStockValue = beforeStockValue + stockValue!;

    afterAverageCost =
        afterStock > 0
            ? afterStockValue / afterStock
            : 0;


    // Final safety
    afterStockValue = Number(
        afterStockValue.toFixed(2)
    );

    // afterAverageCost = Number(
    //     afterAverageCost.toFixed(8)
    // );
    afterAverageCost = afterAverageCost;

// =====================================================
// PURCHASE UNIT DEBUG
// =====================================================

console.log("==============================================");
console.log("🟦 INVENTORY PURCHASE COST CALCULATION");
console.log("==============================================");

console.log("📦 Inventory Item:", inventoryItemId);

console.log("----------- EXISTING INVENTORY -----------");
console.log("Existing currentStock:", inventory.currentStock);
console.log(
    "Existing purchaseUnit:",
    inventory.purchaseUnit
);
console.log(
    "Existing purchaseUnitCost:",
    inventory.purchaseUnitCost
);
console.log(
    "Existing consumptionUnit:",
    inventory.consumptionUnit
);


console.log("----------- NEW PURCHASE -----------");
console.log(
    "New purchaseQuantity:",
    purchaseQuantity
);
console.log(
    "New purchaseUnit:",
    purchaseUnit
);
console.log(
    "New purchaseUnitCost:",
    purchaseUnitCostN
);
console.log(
    "New conversionFactor:",
    conversionFactor
);

console.log("----------- TRANSACTION -----------");
console.log("Transaction quantity:", quantity);
console.log(
    "Transaction unit:",
    inventory.consumptionUnit
);


// =====================================================
// EXISTING VALUES
// =====================================================

const existingConversionFactor =
    Number(inventory.conversionFactor) || 1;

const newConversionFactor =
    Number(conversionFactor) || 1;

const existingStockQty =
    Number(inventory.currentStock) || 0;

const existingPurchaseUnitCost =
    Number(inventory.purchaseUnitCost) || 0;

const newPurchaseQuantity =
    Number(purchaseQuantity) || 0;

let newPurchaseUnitCost =
    Number(purchaseUnitCostN) || 0;


// =====================================================
// EXISTING STOCK IN EXISTING PURCHASE UNIT
// =====================================================

const existingStockInPurchaseUnit =
    existingStockQty /
    existingConversionFactor;


// =====================================================
// NEW PURCHASE QUANTITY
// =====================================================
//
// purchaseQuantity is already in the NEW purchase unit.
//
// Example:
// 2 kg = 2 kg
// 3 bag(15) = 3 bag(15)
//
// Do NOT divide purchaseQuantity by conversionFactor.
//
// =====================================================

const newPurchaseQtyInPurchaseUnit =
    newPurchaseQuantity;



    // =====================================================
// NEW PURCHASE VALUE
// =====================================================

const newPurchaseStockValue =
    newPurchaseQtyInPurchaseUnit *
    newPurchaseUnitCost;

// =====================================================
// EXISTING STOCK VALUE
// =====================================================

const existingStockValue = inventory.stockValue;
const newInventorySotckValue = inventory.stockValue + newPurchaseStockValue
     




// =====================================================
// TOTAL PURCHASE UNIT QUANTITY
// =====================================================

const newConsumptionUnitQuantity = purchaseQuantity! * conversionFactor!


// =====================================================
// NEW AVERAGE PURCHASE UNIT COST
// =====================================================

const newPurchaseUnitCostAverage =
    newConsumptionUnitQuantity > 0
        ? (
            existingStockValue +
            newPurchaseStockValue
        ) /
        newConsumptionUnitQuantity
        : newPurchaseUnitCost;


// =====================================================
// VALUES USED BELOW
// =====================================================

const newPurchaseUnitCostStockValue =
    Number(
        (
            existingStockValue +
            newPurchaseStockValue
        ).toFixed(2)
    );

 newPurchaseUnitCost =
    Number(
        purchaseUnitCost
    );


// =====================================================
// DEBUG RESULT
// =====================================================

console.log("==============================================");
console.log("🧮 PURCHASE UNIT CALCULATION");
console.log("==============================================");

console.log(
    "Existing purchase unit:",
    inventory.purchaseUnit
);
console.log(
    "Existing Inventory conversionFactor:",
    existingConversionFactor
);



console.log(
    "Existing stock:",
    existingStockQty
);

// console.log(
//     "Existing stock in purchase unit:",
//     existingStockInPurchaseUnit
// );



 

console.log(
    "Existing stock purchase value:",
    existingStockValue
);

console.log("----------------")

console.log(
    "New purchase unit:",
    purchaseUnit
);
console.log(
    "New conversionFactor:",
    newConversionFactor
);
console.log(
    "New purchase quantity:",
    newPurchaseQuantity
);
console.log(
    "New purchase unit cost:",
    newPurchaseUnitCost
);
console.log(
    "New purchase stock value:",
    newPurchaseStockValue
);
console.log(
    "New purchase in consumption quantity:",
    newConsumptionUnitQuantity
);

console.log(
    "New Stock in consumption quantity:",
    afterStock
);

const newStockInPurchaseUnit = afterStock/existingConversionFactor
const newAvgCostInPurchaseUnit = newInventorySotckValue/newStockInPurchaseUnit;




console.log("New stock in purchase unit--------------", newStockInPurchaseUnit)
console.log(
    "New avg cost in purchase quantity:",
    newAvgCostInPurchaseUnit
);
console.log("NEW INVENTORY STOCK VALUE:",newInventorySotckValue);
console.log("==============================================");


    tx.update(inventoryRef, {
        currentStock: afterStock,
        stockValue: newInventorySotckValue,//afterStockValue,
        consumptionUnit:inventory.consumptionUnit,
        averageCost: newAvgCostInPurchaseUnit,
        costPrice: newAvgCostInPurchaseUnit,
        // purchaseUnit,
        purchaseUnitCost: newAvgCostInPurchaseUnit,
        updatedAt: now,
    });



    // =====================================================
    // CREATE INVENTORY LEDGER TRANSACTION
    // Stores immutable history of every inventory movement.
    // This NEVER updates inventory totals.
    // =====================================================

    const purchaseQty =
        purchaseQuantity ??
        quantity

 

    const ledgerRef =
        adminDb.collection("stockLedgerInventory").doc();


    const ledger: InventoryLedgerType = {
        // =====================================================
        // DOCUMENT
        // =====================================================
        transactionId: ledgerRef.id,

        // =====================================================
        // INVENTORY ITEM
        // =====================================================
        inventoryItemId,
        inventoryItemName: inventory.name || "",

        // =====================================================
        // PARTY
        // =====================================================
        partyId: supplierId || "",
        partyName: supplierName || "",
        partyType: supplierId ? "SUPPLIER" : "SYSTEM",

        // =====================================================
        // PURCHASE DETAILS
        // =====================================================
        purchaseQuantity: purchaseQty,

        purchaseUnit: purchaseUnit || inventory.purchaseUnit || inventory.consumptionUnit,

        purchaseUnitCost: purchaseUnitCostN,
        quantity: quantity,
        consumptionUnit: inventory.consumptionUnit,
        unitCost: unitCost,
        // =====================================================
        // TRANSACTION DETAILS
        // =====================================================
        conversionFactor:
            conversionFactor ??
            inventory.conversionFactor ??
            1,

        transactionQuantity: quantity,

        transactionUnit:
            inventory.consumptionUnit || "gm",

        transactionUnitCost: finalUnitCost,

        // =====================================================
        // STOCK
        // =====================================================
        beforeStock,
        afterStock,

        // =====================================================
        // VALUE
        // =====================================================
        totalAmount: totalPurchaseAmount ? totalPurchaseAmount : 0,

        // =====================================================
        // PAYMENT
        // =====================================================
        paidAmount: isCostMovement ? paidAmount : 0,
        dueAmount: isCostMovement ? dueAmount : 0,

        paymentStatus: isCostMovement
            ? paymentStatus
            : null,

        paymentMethod: isCostMovement
            ? paymentMethod
            : null,

        // =====================================================
        // TRANSACTION INFO
        // =====================================================
        referenceType,
        referenceId,

        type,
        direction,

        note,

        // =====================================================
        // SOURCE
        // =====================================================
        sourceModule: source,

        // =====================================================
        // AUDIT
        // =====================================================
        createdById: createdBy,

        createdAt: now,
    };

    tx.set(ledgerRef, ledger);


    return {
        beforeStock,
        afterStock,
        unitCost: finalUnitCost,
    };



}