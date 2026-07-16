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

  tx.update(inventoryRef, {
    currentStock: afterStock,
    stockValue: afterStockValue,
    averageCost: afterAverageCost,
    costPrice: afterAverageCost,
    purchaseUnit ,
    purchaseUnitCost ,
    updatedAt: now,
});

     


    // =====================================================
    // CREATE INVENTORY LEDGER TRANSACTION
    // Stores immutable history of every inventory movement.
    // This NEVER updates inventory totals.
    // =====================================================

    const purchaseQty =
        purchaseQuantity ??
        quantity /
        Number(
            conversionFactor ??
            inventory.conversionFactor ??
            1
        );



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
        
          purchaseUnit:
            purchaseUnit ||
            inventory.purchaseUnit ||
            inventory.consumptionUnit,
        
          purchaseUnitCost: isCostMovement
            ? (purchaseUnitCost ?? finalUnitCost)
            : 0,
        
          // =====================================================
          // TRANSACTION DETAILS
          // =====================================================
          conversionFactor:
            conversionFactor ??
            inventory.conversionFactor ??
            1,
        
          transactionQuantity: quantity,
        
          transactionUnit:
            inventory.consumptionUnit || "pcs",
        
          transactionUnitCost: finalUnitCost,
        
          // =====================================================
          // STOCK
          // =====================================================
          beforeStock,
          afterStock,
        
          // =====================================================
          // VALUE
          // =====================================================
          totalAmount: isCostMovement ? totalAmount : 0,
        
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

    // tx.set(ledgerRef, {
    //     transactionId: ledgerRef.id,

    //     inventoryItemId,
    //     inventoryItemName: inventory.name || "",

    //     supplierId: supplierId || "",
    //     supplierName: supplierName || "",

    //     type,
    //     direction,

    //     purchaseQuantity: purchaseQty,

    //     purchaseUnit:
    //         purchaseUnit ||
    //         inventory.purchaseUnit ||
    //         inventory.consumptionUnit,

    //     purchaseUnitCost: isCostMovement
    //         ? (purchaseUnitCost ?? finalUnitCost)
    //         : 0,

    //     conversionFactor:
    //         conversionFactor ??
    //         inventory.conversionFactor ??
    //         1,

    //     quantity,
    //     unit:
    //         inventory.consumptionUnit || "pcs",

    //     unitCost: finalUnitCost,

    //     beforeStock,
    //     afterStock,

    //     totalAmount: isCostMovement ? totalAmount : 0,
    //     paidAmount: isCostMovement ? paidAmount : 0,
    //     dueAmount: isCostMovement ? dueAmount : 0,
    //     paymentStatus: isCostMovement ? paymentStatus : null,
    //     paymentMethod: isCostMovement ? paymentMethod : null,

    //     referenceType,
    //     referenceId,

    //     note,
    //     createdBy,

    //     createdAt: now,
    //     source,
    // });

    return {
        beforeStock,
        afterStock,
        unitCost: finalUnitCost,
    };



}