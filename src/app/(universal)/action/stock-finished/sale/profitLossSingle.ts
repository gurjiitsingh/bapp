
"use server";

import { adminDb } from "@/lib/firebaseAdmin";

type ProfitLossProduct = {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  saleLines: number;
};

type ProfitLossSource = {
  saleSource: string;
  saleSourceName: string;
  totalQuantity: number;
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  saleLines: number;
};

export async function getFinishedProductsProfitLossSingle() {
  try {
    const snapshot = await adminDb
      .collection("salesLedger")
      .orderBy("createdAt", "desc")
      .get();

    let totalSales = 0;
    let totalCost = 0;
    let totalProfit = 0;

    const saleIds = new Set<string>();

    const productMap = new Map<string, ProfitLossProduct>();
    const sourceMap = new Map<string, ProfitLossSource>();

    for (const doc of snapshot.docs) {
      const data = doc.data();

      const productId = String(data.productId || "");
      const productName = String(data.productName || "Unknown Product");

      const quantity = Number(data.quantity || 0);
      const sales = Number(data.totalAmount || 0);
      const cost = Number(data.totalCost || 0);

      // Use saved historical profit.
      // Fallback supports older records without a profit field.
      const profit =
        data.profit !== undefined && data.profit !== null
          ? Number(data.profit)
          : sales - cost;

      totalSales += sales;
      totalCost += cost;
      totalProfit += profit;

      if (data.saleId) {
        saleIds.add(String(data.saleId));
      }

      // =====================================
      // PRODUCT-WISE PROFIT
      // =====================================

      const existingProduct = productMap.get(productId);

      if (existingProduct) {
        existingProduct.totalQuantity += quantity;
        existingProduct.totalSales += sales;
        existingProduct.totalCost += cost;
        existingProduct.totalProfit += profit;
        existingProduct.saleLines += 1;
      } else {
        productMap.set(productId, {
          productId,
          productName,
          totalQuantity: quantity,
          totalSales: sales,
          totalCost: cost,
          totalProfit: profit,
          saleLines: 1,
        });
      }

      // =====================================
      // SOURCE-WISE PROFIT
      // =====================================

      const saleSource = String(data.saleSource || "UNKNOWN");
      const saleSourceName = String(
        data.saleSourceName || saleSource
      );

      const existingSource = sourceMap.get(saleSource);

      if (existingSource) {
        existingSource.totalQuantity += quantity;
        existingSource.totalSales += sales;
        existingSource.totalCost += cost;
        existingSource.totalProfit += profit;
        existingSource.saleLines += 1;
      } else {
        sourceMap.set(saleSource, {
          saleSource,
          saleSourceName,
          totalQuantity: quantity,
          totalSales: sales,
          totalCost: cost,
          totalProfit: profit,
          saleLines: 1,
        });
      }
    }

    const profitMargin =
      totalSales > 0
        ? (totalProfit / totalSales) * 100
        : 0;

    const products = Array.from(productMap.values()).sort(
      (a, b) => b.totalProfit - a.totalProfit
    );

    const sources = Array.from(sourceMap.values()).sort(
      (a, b) => b.totalProfit - a.totalProfit
    );

    return {
      success: true,

      summary: {
        totalSales,
        totalCost,
        totalProfit,
        profitMargin,
        totalSaleLines: snapshot.size,
        totalSalesCount: saleIds.size,
      },

      products,
      sources,
    };
  } catch (error) {
    console.error("Error fetching finished products P&L:", error);

    return {
      success: false,
      summary: {
        totalSales: 0,
        totalCost: 0,
        totalProfit: 0,
        profitMargin: 0,
        totalSaleLines: 0,
        totalSalesCount: 0,
      },
      products: [],
      sources: [],
    };
  }
}
