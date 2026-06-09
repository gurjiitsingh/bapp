"use server";

import { adminDb } from "@/lib/firebaseAdmin";

type Props = {
  page?: number;
};

const PAGE_SIZE = 14;

export async function getfinishedStockTransactions({
  page = 1,
}: Props = {}) {

  console.log("page----------------", page);

  try {

    // ✅ Fetch more data (to filter SALE later)
    const snapshot = await adminDb
      .collection("finishedStockTransactions")
      .orderBy("createdAt", "desc")
      .limit(PAGE_SIZE * 3) // 🔥 important
      .get();

    // ✅ FILTER SALE ONLY
    const saleDocs = snapshot.docs.filter(
      (doc) => doc.data().transactionType === "SALE"
    );

    // ✅ PAGINATION (after filter)
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    const paginatedDocs = saleDocs.slice(start, end);

    const hasMore = saleDocs.length > end;

    const transactions = paginatedDocs.map((doc) => {

      const data = doc.data();

      return {
        id: doc.id,

        inventoryItemName:
          data.inventoryItemName || "",

        transactionType:
          data.transactionType || "",

        // ✅ FIXED: customer instead of supplier
        wholeSaleCutomerName:
          data.wholeSaleCutomerName || "",

        stockDirection:
          data.stockDirection || "",

        quantity:
          data.quantity || 0,

        unit:
          data.unit || "",

        unitCost:
          data.unitCost || 0,

        totalAmount:
          data.totalAmount || 0,

        beforeStock:
          data.beforeStock || 0,

        afterStock:
          data.afterStock || 0,

        purchaseUnit:
          data.purchaseUnit || "",

        conversionFactor:
          data.conversionFactor || 1,

        createdBy:
          data.createdBy || "",

        createdAt:
          data.createdAt?._seconds
            ? data.createdAt._seconds * 1000
            : null,
      };
    });

    return {
      success: true,
      data: transactions,
      hasMore,
    };

  } catch (error) {

    console.error(error);

    return {
      success: false,
      data: [],
      hasMore: false,
    };
  }
}