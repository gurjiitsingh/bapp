
"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { ProductStockType } from "@/lib/types/productStockType";

type SaleSourceType = "FACTORY" | "STORE" | "VEHICLE";

type ApplyFinishedMovementType = {
  productId: string;
  finishedProduct: ProductStockType;
  productName?: string;

  type: string;
  direction: "IN" | "OUT";

  quantity: number;
  transactionUnit: InventoryUnit;

  unitPrice?: number;

  // Required for SALE, to calculate actual profit correctly
  costPriceAtSale?: number;

  customerId?: string;
  customerName?: string;

  totalAmount?: number;
  paidAmount?: number;
  dueAmount?: number;
  returnProductAmount?: number;

  paymentStatus?: string;
  paymentMethod?: string | null;

  referenceType?: string;
  referenceId?: string;

  // Same saleId must be passed for every product line in one sale
  saleId?: string;

  // Sale origin
  saleSource?: SaleSourceType;
  saleSourceId?: string;
  saleSourceName?: string;

  // Person responsible for the sale
  salespersonId?: string;
  salespersonName?: string;

  // Optional driver information
  driverId?: string;
  driverName?: string;

  // Optional vehicle information
  vehicleId?: string;
  vehicleName?: string;

  note?: string;
  createdBy?: string;
  source?: string;
};

export async function writeProductSaleBulkTransactions(
  tx: FirebaseFirestore.Transaction,
  {
    productId,
    finishedProduct,
    productName,

    type,
    direction,

    quantity,
    transactionUnit,

    unitPrice,
    costPriceAtSale,

    customerId,
    customerName,

    totalAmount = 0,
    returnProductAmount = 0,
    paidAmount = 0,
    dueAmount = 0,

    paymentStatus = "PAID",
    paymentMethod = null,

    referenceType = "MANUAL",
    referenceId = "",

    saleId,

    saleSource,
    saleSourceId,
    saleSourceName,

    salespersonId,
    salespersonName,

    driverId,
    driverName,

    vehicleId,
    vehicleName,

    note = "",
    createdBy = "system",

    source = "SYSTEM",
  }: ApplyFinishedMovementType
) {
  const now = admin.firestore.FieldValue.serverTimestamp();

  const productRef = adminDb
    .collection("productStock")
    .doc(productId);

  const product = finishedProduct;

  const finalProductName = productName || product.name || "";

  const beforeStock = Number(product.currentStock) || 0;

  const afterStock =
    direction === "IN"
      ? beforeStock + quantity
      : beforeStock - quantity;

  // ==========================================
  // VALIDATION
  // ==========================================

  if (!productId) {
    throw new Error("Product ID is required.");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Invalid stock quantity.");
  }

  if (
    direction === "OUT" &&
    afterStock < 0 &&
    !product.allowNegativeStock
  ) {
    throw new Error(`${finalProductName} has insufficient stock.`);
  }

  const finalUnitPrice =
    unitPrice ?? Number(product.sellingPrice) ?? 0;

  const isSale = type === "SALE" && direction === "OUT";

  // ==========================================
  // SALE VALIDATION
  // ==========================================

  if (isSale) {
    if (!Number.isFinite(totalAmount) || totalAmount < 0) {
      throw new Error("Invalid sale amount.");
    }

    if (
      costPriceAtSale === undefined ||
      !Number.isFinite(costPriceAtSale) ||
      costPriceAtSale < 0
    ) {
      throw new Error(
        `Valid costPriceAtSale is required for ${finalProductName}.`
      );
    }

    if (!saleSource || !saleSourceId || !saleSourceName) {
      throw new Error("Sale source information is required.");
    }
  }

  // ==========================================
  // STOCK LEDGER
  // ==========================================

  const stockLedgerRef = adminDb
    .collection("stockLedgerFinished")
    .doc();

  // Use the supplied saleId to connect all product lines
  // belonging to the same sale.
  const finalSaleId = isSale
    ? saleId || stockLedgerRef.id
    : "";

  tx.update(productRef, {
    currentStock: afterStock,
    stockStatus: afterStock > 0 ? "in_stock" : "out_of_stock",
    updatedAt: now,
  });

  tx.set(stockLedgerRef, {
    transactionId: stockLedgerRef.id,

    productId,
    productName: finalProductName,

    type,
    direction,

    quantity,
    transactionUnit,

    unitPrice: finalUnitPrice,
    productSnapshotPrice: Number(product.sellingPrice) || 0,
    totalAmount,

    beforeStock,
    afterStock,

    customerId: customerId || "",
    customerName: customerName || "",

    paidAmount,
    dueAmount,
    returnProductAmount,

    paymentStatus,
    paymentMethod,

    referenceType,
    referenceId: isSale
      ? referenceId || finalSaleId
      : referenceId,

    note,
    createdBy,

    createdAt: now,
    source,
  });

  // ==========================================
  // SALES LEDGER
  // Only for actual sales (OUT)
  // ==========================================

  let saleLedgerResult:
    | {
        saleLineId: string;
        saleId: string;
        totalCost: number;
        profit: number;
      }
    | undefined;

  if (isSale) {
    const finalCostPrice = Number(costPriceAtSale);

    const totalCost = Number(
      (quantity * finalCostPrice).toFixed(2)
    );

    const profit = Number(
      (totalAmount - totalCost).toFixed(2)
    );

    const saleLedgerRef = adminDb
      .collection("salesLedger")
      .doc();

    tx.set(saleLedgerRef, {
      // Unique document / line ID
      id: saleLedgerRef.id,

      // Shared ID across all product lines in this sale
      saleId: finalSaleId,

      // Product information
      productId,
      productName: finalProductName,

      quantity,
      transactionUnit,

      // Selling information
      unitPrice: finalUnitPrice,
      totalAmount,

      // Cost and profit snapshot at the time of sale
      costPriceAtSale: finalCostPrice,
      totalCost,
      profit,

      // Customer
      customerId: customerId || "",
      customerName: customerName || "",

      // Where the sale originated
      saleSource,
      saleSourceId,
      saleSourceName,

      // Person responsible for the sale
      salespersonId: salespersonId || "",
      salespersonName: salespersonName || createdBy,

      // Optional driver
      driverId: driverId || "",
      driverName: driverName || "",

      // Optional vehicle
      vehicleId: vehicleId || "",
      vehicleName: vehicleName || "",

      // Payment
      paymentStatus,
      paymentMethod,
      paidAmount,
      dueAmount,

      // Reference and audit information
      referenceType,
      referenceId: finalSaleId,

      note,
      createdBy,
      source,

      createdAt: now,
    });

    saleLedgerResult = {
      saleLineId: saleLedgerRef.id,
      saleId: finalSaleId,
      totalCost,
      profit,
    };
  }

  // ==========================================
  // RETURN RESULT
  // ==========================================

  return {
    transactionId: stockLedgerRef.id,

    beforeStock,
    afterStock,

    unitPrice: finalUnitPrice,

    saleLedger: saleLedgerResult,
  };
}
