"use server";

import { adminDb } from "@/lib/firebaseAdmin";
// =====================================================
// TRUCK SALE DETAIL TYPE
// =====================================================

export type TruckSaleDetail = {
  id: string;

  saleId?: string;
  saleNo?: string;

  tripId?: string;
  tripNo?: string;

  vehicleId?: string;
  vehicleName?: string;
  locationCode?: string;

  salesmanId?: string;
  salesmanName?: string;
  responsiblePerson?: string;

  wholeSaleCutomerId?: string;
  wholeSaleCutomerName?: string;

  paymentMethod?: string;
  paymentStatus?: string;

  status?: string;

  totalAmount: number;
  totalItems: number;
  totalQuantity: number;

  paidAmount: number;
  dueAmount: number;

  createdBy?: string;
  remarks?: string;

  createdAt?: Date;
  updatedAt?: Date;
};

export async function getTruckSaleDetail(
  saleId: string
): Promise<{
  success: true;
  data: {
    sale: TruckSaleDetail;
    items: {
      id: string;
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      lineValue: number;
      costPerUnit: number;
      costValue: number;
      grossProfit: number;
    }[];
  };
} | {
  success: false;
  message: string;
}> {
  try {
    if (!saleId) {
      return {
        success: false,
        message: "Sale ID required.",
      };
    }

    // =====================================================
    // SALE MASTER
    // =====================================================

    const saleRef = adminDb
      .collection("truckSales")
      .doc(saleId);

    const saleSnap = await saleRef.get();

    if (!saleSnap.exists) {
      return {
        success: false,
        message: "Truck sale not found.",
      };
    }

    const saleData = saleSnap.data()!;

      console.log("saleData----------------------",saleData)
    // =====================================================
    // SALE ITEMS
    // =====================================================

    const itemsSnap = await saleRef
      .collection("items")
      .get();

    const items = itemsSnap.docs.map((doc) => {
      const d = doc.data();


      return {
        id: doc.id,

        productId:
          d.productId || "",

        productName:
          d.productName || "",

        quantity:
          Number(d.quantity || 0),

        unitPrice:
          Number(d.unitPrice || 0),

        lineValue:
          Number(d.lineValue || 0),

        costPerUnit:
          Number(d.costPerUnit || 0),

        costValue:
          Number(d.costValue || 0),

        grossProfit:
          Number(d.grossProfit || 0),
      };
    });

    // =====================================================
    // RETURN
    // =====================================================

    return {
      success: true,

      data: {
        sale: {
          id: saleSnap.id,

          ...saleData,

          totalAmount:
            Number(saleData.totalAmount || 0),

          totalItems:
            Number(saleData.totalItems || 0),

          totalQuantity:
            Number(saleData.totalQuantity || 0),

          paidAmount:
            Number(saleData.paidAmount || 0),

          dueAmount:
            Number(saleData.dueAmount || 0),

          createdAt:
            saleData.createdAt?.toDate
              ? saleData.createdAt.toDate()
              : saleData.createdAt
                ? new Date(saleData.createdAt)
                : undefined,
        },

        items,
      },
    };

  } catch (error: any) {

    console.error(
      "❌ getTruckSaleDetail:",
      error
    );

    return {
      success: false,

      message:
        error?.message ||
        "Failed to get truck sale details.",
    };
  }
}