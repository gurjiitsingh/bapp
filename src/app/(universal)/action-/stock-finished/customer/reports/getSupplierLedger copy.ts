"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function getSupplierLedger({
  supplierId,
  fromDate,
  toDate,
}: {
  supplierId: string;
  fromDate?: string;
  toDate?: string;
}) {
  try {
    let query = adminDb
      .collection("inventoryTransactions")
      .where("supplierId", "==", supplierId)
      .orderBy("createdAt", "asc");

    // ✅ Date filter
    if (fromDate) {
      query = query.where(
        "createdAt",
        ">=",
        new Date(fromDate)
      );
    }

    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);

      query = query.where(
        "createdAt",
        "<=",
        end
      );
    }

    const snap = await query.get();

    let runningBalance = 0;

    const transactions: any[] = [];

    let totalPurchase = 0;
    let totalPaid = 0;
    let totalReturn = 0;

    snap.forEach((doc) => {
      const d = doc.data();

      const credit = d.dueAmount || 0; // increases balance
      const debit =
        d.type === "PAYMENT"
          ? d.paidAmount
          : d.type === "SUPPLIER_RETURN"
          ? d.totalAmount
          : 0;

      runningBalance += credit - debit;

      if (d.type === "PURCHASE") {
        totalPurchase += d.totalAmount || 0;
      }

      if (d.type === "PAYMENT") {
        totalPaid += d.paidAmount || 0;
      }

      if (d.type === "SUPPLIER_RETURN") {
        totalReturn += d.totalAmount || 0;
      }

      transactions.push({
        id: doc.id,
        date: d.createdAt?.toDate?.() || null,
        type: d.type,
        note: d.note || "",
        totalAmount: d.totalAmount || 0,
        paidAmount: d.paidAmount || 0,
        dueAmount: d.dueAmount || 0,
        balance: runningBalance,
      });
    });

    return {
      success: true,
      data: {
        transactions,
        summary: {
          totalPurchase,
          totalPaid,
          totalReturn,
          balance: runningBalance,
        },
      },
    };
  } catch (error) {
    console.error("❌ getSupplierLedger failed:", error);
    return { success: false };
  }
}