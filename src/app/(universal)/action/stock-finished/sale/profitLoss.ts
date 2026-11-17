
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

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

type ProfitLossPeriod = {
  period: string;
  periodLabel: string;
  totalQuantity: number;
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  saleLines: number;
  saleIds: Set<string>;
};

type ProfitLossProps = {
  startDate?: string;
  endDate?: string;
};

function parseISTDate(dateString?: string): Date | null {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return null;
  }

  const [year, month, day] = dateString.split("-").map(Number);

  const checkDate = new Date(Date.UTC(year, month - 1, day));

  if (
    checkDate.getUTCFullYear() !== year ||
    checkDate.getUTCMonth() !== month - 1 ||
    checkDate.getUTCDate() !== day
  ) {
    return null;
  }

  return new Date(`${dateString}T00:00:00+05:30`);
}

function getCreatedAtDate(value: any): Date | null {
  if (!value) return null;

  if (typeof value.toDate === "function") {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "number") {
    return new Date(value);
  }

  if (typeof value._seconds === "number") {
    return new Date(value._seconds * 1000);
  }

  return null;
}

function getISTParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value || "";
  const month = parts.find((part) => part.type === "month")?.value || "";
  const day = parts.find((part) => part.type === "day")?.value || "";

  return {
    year,
    month,
    day,
    dateKey: `${year}-${month}-${day}`,
    monthKey: `${year}-${month}`,
  };
}

function getDailyLabel(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getMonthlyLabel(monthKey: string) {
  const date = new Date(`${monthKey}-01T00:00:00+05:30`);

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "long",
    year: "numeric",
  }).format(date);
}

export async function getFinishedProductsProfitLoss({
  startDate,
  endDate,
}: ProfitLossProps = {}) {
  try {
    const start = parseISTDate(startDate);
    const end = parseISTDate(endDate);

    if (startDate && !start) {
      throw new Error("Invalid start date.");
    }

    if (endDate && !end) {
      throw new Error("Invalid end date.");
    }

    if (start && end && start > end) {
      throw new Error("Start date cannot be after end date.");
    }

    const collection = adminDb.collection("salesLedger");

    let snapshot;

    // End date is inclusive.
    // Firestore query uses the beginning of the following day.
    const endExclusive = end
      ? new Date(end.getTime() + 24 * 60 * 60 * 1000)
      : null;

    if (start && endExclusive) {
      snapshot = await collection
        .where("createdAt", ">=", Timestamp.fromDate(start))
        .where("createdAt", "<", Timestamp.fromDate(endExclusive))
        .orderBy("createdAt", "desc")
        .get();
    } else if (start) {
      snapshot = await collection
        .where("createdAt", ">=", Timestamp.fromDate(start))
        .orderBy("createdAt", "desc")
        .get();
    } else if (endExclusive) {
      snapshot = await collection
        .where("createdAt", "<", Timestamp.fromDate(endExclusive))
        .orderBy("createdAt", "desc")
        .get();
    } else {
      snapshot = await collection
        .orderBy("createdAt", "desc")
        .get();
    }

    let totalSales = 0;
    let totalCost = 0;
    let totalProfit = 0;

    const saleIds = new Set<string>();

    const productMap = new Map<string, ProfitLossProduct>();
    const sourceMap = new Map<string, ProfitLossSource>();

    const dailyMap = new Map<string, ProfitLossPeriod>();
    const monthlyMap = new Map<string, ProfitLossPeriod>();

    for (const doc of snapshot.docs) {
      const data = doc.data();

      const productId = String(data.productId || doc.id);
      const productName = String(data.productName || "Unknown Product");

      const quantity = Number(data.quantity || 0);
      const sales = Number(data.totalAmount || 0);
      const cost = Number(data.totalCost || 0);

      const profit =
        data.profit !== undefined && data.profit !== null
          ? Number(data.profit)
          : sales - cost;

      const saleId = String(data.saleId || "");

      totalSales += sales;
      totalCost += cost;
      totalProfit += profit;

      if (saleId) {
        saleIds.add(saleId);
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

      // =====================================
      // DATE-WISE AND MONTH-WISE PROFIT
      // =====================================

      const createdAt = getCreatedAtDate(data.createdAt);

      // Records without createdAt cannot be grouped by date.
      if (!createdAt || Number.isNaN(createdAt.getTime())) {
        continue;
      }

      const { dateKey, monthKey } = getISTParts(createdAt);

      // DAILY
      const existingDay = dailyMap.get(dateKey);

      if (existingDay) {
        existingDay.totalQuantity += quantity;
        existingDay.totalSales += sales;
        existingDay.totalCost += cost;
        existingDay.totalProfit += profit;
        existingDay.saleLines += 1;

        if (saleId) existingDay.saleIds.add(saleId);
      } else {
        dailyMap.set(dateKey, {
          period: dateKey,
          periodLabel: getDailyLabel(createdAt),
          totalQuantity: quantity,
          totalSales: sales,
          totalCost: cost,
          totalProfit: profit,
          saleLines: 1,
          saleIds: new Set(saleId ? [saleId] : []),
        });
      }

      // MONTHLY
      const existingMonth = monthlyMap.get(monthKey);

      if (existingMonth) {
        existingMonth.totalQuantity += quantity;
        existingMonth.totalSales += sales;
        existingMonth.totalCost += cost;
        existingMonth.totalProfit += profit;
        existingMonth.saleLines += 1;

        if (saleId) existingMonth.saleIds.add(saleId);
      } else {
        monthlyMap.set(monthKey, {
          period: monthKey,
          periodLabel: getMonthlyLabel(monthKey),
          totalQuantity: quantity,
          totalSales: sales,
          totalCost: cost,
          totalProfit: profit,
          saleLines: 1,
          saleIds: new Set(saleId ? [saleId] : []),
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

    const daily = Array.from(dailyMap.values())
      .sort((a, b) => b.period.localeCompare(a.period))
      .map(({ saleIds: ids, ...item }) => ({
        ...item,
        totalSalesCount: ids.size,
      }));

    const monthly = Array.from(monthlyMap.values())
      .sort((a, b) => b.period.localeCompare(a.period))
      .map(({ saleIds: ids, ...item }) => ({
        ...item,
        totalSalesCount: ids.size,
      }));

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
      daily,
      monthly,
    };
  } catch (error) {
    console.error("Error fetching finished products P&L:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to load profit and loss report.",

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
      daily: [],
      monthly: [],
    };
  }
}
