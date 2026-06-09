
"use server";

import { adminDb } from "@/lib/firebaseAdmin";

import admin from "firebase-admin";


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
    // ===============================
    // 1️⃣ MAIN QUERY (ASC for correct calculation)
    // ===============================
    let query = adminDb
      .collection("customerLedger")
      .where("supplierId", "==", supplierId)
      .orderBy("createdAt", "asc"); // ✅ IMPORTANT

    // ===============================
    // 2️⃣ DATE FILTER
    // ===============================
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

    // ===============================
    // 3️⃣ OPENING BALANCE (before fromDate)
    // ===============================
    let openingBalance = 0;

    if (fromDate) {
      const prevSnap = await adminDb
        .collection("customerLedger")
        .where("supplierId", "==", supplierId)
        .where("createdAt", "<", new Date(fromDate))
        .get();

      prevSnap.forEach((doc) => {
        const d = doc.data();

        const credit =
          d.type === "PURCHASE"
            ? Number(d.dueAmount || 0)
            : 0;

        const debit =
          d.type === "PAYMENT"
            ? Number(d.paidAmount || 0)
            : d.type === "RETURN"
            ? Number(d.totalAmount || 0)
            : 0;

        openingBalance += credit - debit;
      });
    }

    // ===============================
    // 4️⃣ FETCH DATA
    // ===============================
    const snap = await query.get();

    let runningBalance = openingBalance;

    const transactions: any[] = [];

    let totalPurchase = 0;
    let totalPaid = 0;
    let totalReturn = 0;

    // ===============================
    // 5️⃣ PROCESS TRANSACTIONS
    // ===============================
    snap.forEach((doc) => {
      const d = doc.data();

      const isPurchase = d.type === "PURCHASE";
      const isPayment = d.type === "PAYMENT";
      const isReturn = d.type === "RETURN";

      const credit = isPurchase
        ? Number(d.dueAmount || 0)
        : 0;

      const debit = isPayment
        ? Number(d.paidAmount || 0)
        : isReturn
        ? Number(d.totalAmount || 0)
        : 0;

      runningBalance += credit - debit;

      // ✅ SUMMARY
      if (isPurchase) {
        totalPurchase += Number(d.totalAmount || 0);
      }

      if (isPayment) {
        totalPaid += Number(d.paidAmount || 0);
      }

      if (isReturn) {
        totalReturn += Number(d.totalAmount || 0);
      }

     transactions.push({
  id: doc.id,

  date:
    d.createdAt?.toDate?.() || null,

  type: d.type,

  note: d.note || "",

  paymentMethod:
    d.paymentMethod || "",

  totalAmount:
    Number(d.totalAmount || 0),

  paidAmount:
    Number(d.paidAmount || 0),

  dueAmount:
    Number(d.dueAmount || 0),

  credit,
  debit,

  balance: runningBalance,
});
    });

    // ===============================
    // 6️⃣ SHOW LATEST FIRST (UI FIX)
    // ===============================
    transactions.reverse(); // ✅ IMPORTANT

    // ===============================
    // 7️⃣ RETURN
    // ===============================
    return {
      success: true,
      data: {
        openingBalance, // ✅ useful for UI
        transactions,
        summary: {
          totalPurchase,
          totalPaid,
          totalReturn,
          balance: runningBalance, // final balance
        },
      },
    };
  } catch (error) {
    console.error("❌ getSupplierLedger failed:", error);
    return { success: false };
  }
}

// export async function getSupplierLedger({
//   supplierId,
//   fromDate,
//   toDate,
// }: {
//   supplierId: string;
//   fromDate?: string;
//   toDate?: string;
// }) {
//   console.log("supplierId------------", supplierId);
//   try {
//     let query = adminDb
//       .collection("inventoryTransactions")
//       .where("supplierId", "==", supplierId)
//       .orderBy("createdAt", "asc");

//     // ✅ Date filter
//     if (fromDate) {
//       query = query.where(
//         "createdAt",
//         ">=",
//         new Date(fromDate)
//       );
//     }

//     if (toDate) {
//       const end = new Date(toDate);
//       end.setHours(23, 59, 59, 999);

//       query = query.where(
//         "createdAt",
//         "<=",
//         end
//       );
//     }

//     const snap = await query.get();

//     let runningBalance = 0;

//     const transactions: any[] = [];

//     let totalPurchase = 0;
//     let totalPaid = 0;
//     let totalReturn = 0;

//     snap.forEach((doc) => {
//       const d = doc.data();

//       const credit = d.dueAmount || 0; // increases balance
//       const debit =
//         d.transactionType === "PAYMENT"
//           ? d.paidAmount
//           : d.transactionType === "SUPPLIER_RETURN"
//           ? d.totalAmount
//           : 0;

//       runningBalance += credit - debit;

//       if (d.transactionType === "PURCHASE") {
//         totalPurchase += d.totalAmount || 0;
//       }

//       if (d.transactionType === "PAYMENT") {
//         totalPaid += d.paidAmount || 0;
//       }

//       if (d.transactionType === "SUPPLIER_RETURN") {
//         totalReturn += d.totalAmount || 0;
//       }

//       transactions.push({
//         id: doc.id,
//         date: d.createdAt?.toDate?.() || null,
//         type: d.transactionType,
//         note: d.note || "",
//         totalAmount: d.totalAmount || 0,
//         paidAmount: d.paidAmount || 0,
//         dueAmount: d.dueAmount || 0,
//         balance: runningBalance,
//       });
//     });

//     return {
//       success: true,
//       data: {
//         transactions,
//         summary: {
//           totalPurchase,
//           totalPaid,
//           totalReturn,
//           balance: runningBalance,
//         },
//       },
//     };
//   } catch (error) {
//     console.error("❌ getSupplierLedger failed:", error);
//     return { success: false };
//   }
// }