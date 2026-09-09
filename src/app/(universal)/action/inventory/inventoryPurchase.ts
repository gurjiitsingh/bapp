"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { ApplyInventoryTransactionType, InventoryTransactionPurchaseType } from "@/lib/types/ApplyInventoryTransactionType";
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


        purchaseUnit,
        purchaseQuantity,
        purchaseUnitCost,
        conversionFactor,

        supplierId,
        supplierName,



        referenceType = "MANUAL",
        referenceId = "",

        note = "",
        createdBy = "system",

        source = "SYSTEM",
    }: InventoryTransactionPurchaseType) {

    if (!Number.isFinite(purchaseQuantity!) || purchaseQuantity! <= 0) {
        throw new Error(
            `Invalid purchaseQuantity: ${purchaseQuantity}`
        );
    }
    if (!Number.isFinite(purchaseUnitCost!) || purchaseUnitCost! < 0) {
        throw new Error(
            `Invalid purchaseUnitCost: ${purchaseUnitCost}`
        );
    }
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
    //  INVENTORY ITEM (MASTER STOCK) DATA FETCH
    // =====================================================

    //     purchaseUnit,
    //     purchaseQuantity,
    //     purchaseUnitCost,
    //     conversionFactor,

    const purchaseQtyInConsumptionUint = purchaseQuantity * conversionFactor;

    const beforeStock =
        Number(inventory.currentStock) || 0;

    console.log('inventory.conversionFactor-----------------', inventory.conversionFactor)

   
    const newConversionFactor =  Number(inventory.conversionFactor) || conversionFactor ;

    // =====================================================
    //  PURCHASE DATA
    // =====================================================
    const totalPurchaseAmount = purchaseUnitCost * purchaseQuantity!;

    // =====================================================
    //  CALCULATIONS
    // =====================================================
    let purchaseStockValue = purchaseQuantity! * purchaseUnitCost!;
     
    
    const beforeStockValue = Number(inventory.stockValue) || 0;

    let afterStock = beforeStock + quantity;

    let afterStockValue = beforeStockValue + purchaseQuantity! * purchaseUnitCost!;
    let afterAverageCost = Number((afterStockValue / (afterStock / newConversionFactor)).toFixed(2));

    console.log("====================================");
    console.log("AVERAGE COST DEBUG");
    console.log("====================================");
    console.log("purchaseUnit:", purchaseUnit);
    console.log("purchaseUnitCost:", purchaseUnitCost);
    console.log("conversionFactor:", conversionFactor);
    
    console.log("Purchase QTY:", quantity);

    console.log("beforeStock:", inventory.currentStock);
    console.log("beforeStockValue:", inventory.stockValue);
    console.log("afterStockValue:", afterStockValue);
    console.log("afterStock:", afterStock);
    console.log("newConversionFactor:", newConversionFactor);
    console.log("New AverageCost: ", afterAverageCost)
    console.log("====================================");

const isFirstPurchase =
  !inventory.stockValue;


const updateData: Record<string, any> = {
  currentStock: afterStock,
  stockValue: afterStockValue,
  averageCost: afterAverageCost,
  updatedAt: now,
};

if (isFirstPurchase) {
  updateData.consumptionUnit =
    inventory.consumptionUnit || "gm";

  updateData.conversionFactor = conversionFactor;

  updateData.costPrice = afterAverageCost;

  updateData.purchaseUnit = purchaseUnit;

  updateData.purchaseUnitCost = purchaseUnitCost;
}

tx.update(inventoryRef, updateData);


    // tx.update(inventoryRef, {
    //     currentStock: afterStock,
    //     stockValue: afterStockValue,//afterStockValue,
    //     // consumptionUnit: inventory.consumptionUnit? inventory.consumptionUnit : "gm",
    //     averageCost: afterAverageCost,
    //   // conversionFactor: newConversionFactor,
    //     //  costPrice: afterAverageCost,
    //    //purchaseUnit: purchaseUnit,
    //   // purchaseUnitCost: purchaseUnitCost,// THIS IS RECENT  PURCHASE COST FOR
    //     updatedAt: now,
    // });


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
        purchaseQuantity: quantity,

        purchaseUnit: purchaseUnit,

        purchaseUnitCost: purchaseUnitCost,
        quantity: quantity,
        consumptionUnit: inventory.consumptionUnit,

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

        transactionUnitCost: purchaseUnitCost,

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
        // paidAmount: isCostMovement ? paidAmount : 0,
        // dueAmount: isCostMovement ? dueAmount : 0,

        // paymentStatus: isCostMovement
        //     ? paymentStatus
        //     : null,

        // paymentMethod: isCostMovement
        //     ? paymentMethod
        //     : null,

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
        unitCost: purchaseUnitCost,
    };



}