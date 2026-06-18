"use server";

import { adminDb } from "@/lib/firebaseAdmin";

type Props = {
  page?: number;
};

const PAGE_SIZE = 14;

export async function getInventoryTransactions({
  page = 1,
}: Props = {}) {

  console.log("page----------------", page);

  try {
//
    const snapshot = await adminDb
      //  .collection("inventoryTransactions")
        .collection("stockLedgerInventory")
      .orderBy("createdAt", "desc")
      .offset((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE + 1)
      .get();

    const docs = snapshot.docs;

    const hasMore = docs.length > PAGE_SIZE;

    const trimmedDocs =
      hasMore
        ? docs.slice(0, PAGE_SIZE)
        : docs;

    const transactions = trimmedDocs.map((doc) => {

      const data = doc.data();

      return {
        id: doc.id,

        inventoryItemName:
          data.inventoryItemName || "",

        transactionType:
          data.transactionType || "",

        supplierName:
          data.supplierName || "",

        direction:
          data.direction || "",

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