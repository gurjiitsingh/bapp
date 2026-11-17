
"use server";

import { adminDb } from "@/lib/firebaseAdmin";

type Props = {
  page?: number;
};

const PAGE_SIZE = 14;

export async function getSaleTransactions({
  page = 1,
}: Props = {}) {
  try {
    const safePage = Math.max(1, Math.floor(page));

    const snapshot = await adminDb
      .collection("salesLedger")
      .orderBy("createdAt", "desc")
      .limit(PAGE_SIZE)
      .offset((safePage - 1) * PAGE_SIZE)
      .get();

    const transactions = snapshot.docs.map((doc) => {
      const data = doc.data();

      const createdAt = data.createdAt?.toMillis
        ? data.createdAt.toMillis()
        : data.createdAt?._seconds
          ? data.createdAt._seconds * 1000
          : null;

         

      return {
        id: doc.id,

        // Sale
        saleId: data.saleId || "",

        // Product
        productId: data.productId || "",
        productName: data.productName || "",

        // Quantity
        quantity: Number(data.quantity || 0),
        transactionUnit: data.transactionUnit || "",

        // Selling price
        unitPrice: Number(data.unitPrice || 0),
        totalAmount: Number(data.totalAmount || 0),

        // Cost snapshots
        costPriceAtSale: Number(data.costPriceAtSale || 0),
        productionCostAtSale: Number(
          data.productionCostAtSale || 0
        ),
        averageCostAtSale: Number(
          data.averageCostAtSale || 0
        ),

        // Actual cost and profit
        totalCost: Number(data.totalCost || 0),
        profit: Number(data.profit || 0),

        // Customer
        customerId: data.customerId || "",
        customerName: data.customerName || "",

        // Sale source
        saleSource: data.saleSource || "",
        saleSourceId: data.saleSourceId || "",
        saleSourceName: data.saleSourceName || "",

        // Responsible person
        salespersonId: data.salespersonId || "",
        salespersonName: data.salespersonName || "",

        // Driver
        driverId: data.driverId || "",
        driverName: data.driverName || "",

        // Vehicle
        vehicleId: data.vehicleId || "",
        vehicleName: data.vehicleName || "",

        // Payment
        paymentStatus: data.paymentStatus || "",
        paymentMethod: data.paymentMethod || "",
        paidAmount: Number(data.paidAmount || 0),
        dueAmount: Number(data.dueAmount || 0),

        // Reference
        referenceId: data.referenceId || "",
        referenceType: data.referenceType || "",

        // Other
        note: data.note || "",
        createdBy: data.createdBy || "",
        source: data.source || "",

        createdAt,
      };
    });

    return {
      success: true,
      data: transactions,
      hasMore: snapshot.size === PAGE_SIZE,
    };
  } catch (error) {
    console.error("Error fetching sales transactions:", error);

    return {
      success: false,
      data: [],
      hasMore: false,
    };
  }
}
