
"use server";

import { adminDb } from "@/lib/firebaseAdmin";

import { readCustomerAccountData } from "../../redDataForSale/readCustomerAccountData";
import { readFinishedProductData } from "../../redDataForSale/readFinishedProductData";

import { PaymentMethodType } from "@/lib/types/distribution/PaymentMethodType";

import { applyCustomerTransaction } from "../../../stock-finished/customer/applyCustomerTransaction";
import { updateCustomerAccountBulkSale } from "./updateCustomerAccountBulkSale";

import { writeProductSaleBulkTransactions } from "./writeProductSaleBulkTransactions";

type DeliveryTruckSaleProps = {
  wholeSaleCutomerId: string;
  wholeSaleCutomerName: string;

  totalAmount: number;

  paymentStatus: "PAID" | "PARTIAL" | "CREDIT";
  paymentMethod?: PaymentMethodType;

  paidAmount: number;
  dueAmount: number;

  remarks?: string;
  createdBy?: string;

  salespersonId?: string;
  salespersonName?: string;

  items: {
    productId: string;
    quantity: number;
    amount: number;
  }[];
};

export async function bulkSale_direct({
  wholeSaleCutomerId,
  wholeSaleCutomerName,
  totalAmount,
  paymentStatus,
  paymentMethod,
  paidAmount,
  dueAmount,
  remarks,
  createdBy,
  salespersonId,
  salespersonName,
  items,
}: DeliveryTruckSaleProps) {
  try {
    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    if (!wholeSaleCutomerId) {
      throw new Error("Customer is required.");
    }

    if (!items || items.length === 0) {
      throw new Error("No products selected.");
    }

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      throw new Error("Invalid total amount.");
    }

    if (
      !Number.isFinite(paidAmount) ||
      !Number.isFinite(dueAmount) ||
      paidAmount < 0 ||
      dueAmount < 0
    ) {
      throw new Error("Invalid payment amount.");
    }

    if (
      Math.round((paidAmount + dueAmount) * 100) !==
      Math.round(totalAmount * 100)
    ) {
      throw new Error(
        "Paid amount and due amount do not match total amount."
      );
    }

    for (const item of items) {
      if (!item.productId) {
        throw new Error("Product is missing.");
      }

      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        throw new Error("Invalid product quantity.");
      }

      if (!Number.isFinite(item.amount) || item.amount < 0) {
        throw new Error("Invalid product amount.");
      }
    }

    const itemsTotal = Number(
      items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)
    );

    if (Math.round(itemsTotal * 100) !== Math.round(totalAmount * 100)) {
      throw new Error(
        "Product amounts do not match the total sale amount."
      );
    }

    // One ID for the entire sale, shared by every product line.
    const saleId = adminDb.collection("salesLedger").doc().id;

    const finalCreatedBy = createdBy || "admin";

    await adminDb.runTransaction(async (tx) => {
      // ==========================================
      // READ AND VALIDATE ALL PRODUCTS
      // ==========================================

      const saleProducts = [];

      for (const item of items) {
        const product = await readFinishedProductData({
          tx,
          productId: item.productId,
        });

        if (product.beforeStock < item.quantity) {
          throw new Error(
            `${product.productName} has insufficient stock.`
          );
        }

        saleProducts.push({
          item,
          product,
        });
      }

      // ==========================================
      // READ CUSTOMER DATA
      // ==========================================

      const { currentBalance } = await readCustomerAccountData({
        tx,
        wholeSaleCutomerId,
      });

      let runningBalance = currentBalance;
      let runningCreditBalance = 0;

      // ==========================================
      // WRITE PRODUCT SALES + STOCK MOVEMENTS
      // ==========================================

      for (const row of saleProducts) {
        const lineTotal = row.item.amount;

        const unitPrice = Number(
          (lineTotal / row.item.quantity).toFixed(2)
        );

        // IMPORTANT:
        // Confirm whether averageCost or avgCost is your
        // authoritative inventory cost before using it.
        const costPrice = Number(row.product.costPrice) || 0;
        const avgCost = Number(row.product.avgCost) || 0;

        const costPriceAtSale =
          avgCost > 0 ? avgCost : costPrice;

        if (
          !Number.isFinite(costPriceAtSale) ||
          costPriceAtSale < 0
        ) {
          throw new Error(
            `Valid product cost is missing for ${row.product.productName}.`
          );
        }

        await writeProductSaleBulkTransactions(tx, {
          productId: row.product.id,
          finishedProduct: row.product,

          type: "SALE",
          direction: "OUT",

          quantity: row.item.quantity,
          transactionUnit: "kg",

          unitPrice,
          costPriceAtSale,

          customerId: wholeSaleCutomerId,
          customerName: wholeSaleCutomerName,

          totalAmount: lineTotal,

          paymentStatus,
          paymentMethod,

          saleId,

          saleSource: "FACTORY",
          saleSourceId: "MAIN",
          saleSourceName: "Main Factory",

          salespersonId,
          salespersonName: salespersonName || finalCreatedBy,

          referenceType: "SALE",
          referenceId: saleId,

          note: remarks,
          createdBy: finalCreatedBy,
          source: "ADMIN",
        });
      }

      // ==========================================
      // CUSTOMER LEDGER - ONE ENTRY FOR WHOLE SALE
      // ==========================================

      await applyCustomerTransaction(tx, {
        customerId: wholeSaleCutomerId,
        customerName: wholeSaleCutomerName,

        type: "SALE",

        totalAmount,
        returnProductAmount: 0,
        paidAmount,
        dueAmount,

        currentBalance,
        creditAmount: 0,

        paymentMethod,

        referenceId: saleId,
        referenceType: "SALE",

        note: remarks,

        createdBy: finalCreatedBy,
        source: "ADMIN",
      });

      // ==========================================
      // CUSTOMER ACCOUNT
      // ==========================================

      const account = await updateCustomerAccountBulkSale(tx, {
        wholeSaleCutomerId,
        wholeSaleCutomerName,

        type: "SALE",

        totalAmount,
        paidAmount,
        dueAmount,

        currentBalance: runningBalance,
        currentCreditBalance: runningCreditBalance,

        paymentMethod,
      });

      runningBalance = account.balance;
      runningCreditBalance = account.creditBalance;
    });

    return {
      success: true,
      saleId,
      message: "Bulk sale recorded successfully.",
    };
  } catch (error: unknown) {
    console.error("Bulk sale error:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to record sale.",
    };
  }
}
