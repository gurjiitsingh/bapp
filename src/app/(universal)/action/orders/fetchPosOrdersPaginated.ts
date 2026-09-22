"use server"
import { orderMasterDataT } from "@/lib/types/orderMasterType";
import { adminDb } from "@/lib/firebaseAdmin";


type FetchOrdersOptions = {
  afterId?: string;
  pageSize?: number;
  source?: "WEB" | "POS" | "APP";
};

export async function fetchPosOrdersPaginated({
  afterId,
  pageSize = 10,
  source = "POS",
}: FetchOrdersOptions) {
  const collectionRef = adminDb.collection("orderMaster");

  try {
    let queryRef;

    if (afterId) {
      const docRef = await collectionRef.doc(afterId).get();

      queryRef = collectionRef
        .where("source", "==", source)
        .orderBy("createdAt", "desc")
        .startAfter(docRef)
        .limit(pageSize);
    } else {
      queryRef = collectionRef
        .where("source", "==", source)
        .orderBy("createdAt", "desc")
        .limit(pageSize);
    }

    const snapshot = await queryRef.get();

    const orders = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,

        customerName: data.customerName || "",
        email: data.email || "",
        customerId: data.userId || "",
        addressId: data.addressId || "",

        ownerId: data.ownerId || "temp_OW_ID",
        outletId: data.outletId || "temp_Oulet_ID",

        srno: data.srno || 0,
        tableNo: data.tableNo || null,
        orderType: data.orderType,

        createdAt:
          data.createdAt?.toDate?.().toISOString?.() ||
          data.createdAt ||
          "",

        createdAtUTC: data.createdAtUTC || "",

        isScheduled: data.isScheduled,

        scheduledAt:
          data.scheduledAt?.toDate?.().toISOString?.() ||
          data.scheduledAt ||
          "",

        paymentMode:
          data.paymentMode ||
          data.paymentType ||
          "",

        paymentProvider:
          data.paymentProvider || "",

        paymentMethod:
          data.paymentMethod || "",

        paymentStatus:
          data.paymentStatus || "NEW",

        paidAmount:
          data.paidAmount || 0,

        dueAmount:
          data.dueAmount || 0,

        orderStatus:
          data.orderStatus || "NEW",

        itemTotal:
          data.itemTotal || 0,

        totalDiscountG:
          data.totalDiscountG || 0,

        couponFlat:
          data.couponFlat || 0,

        calculatedPickUpDiscountL:
          data.calculatedPickUpDiscountL || 0,

        calcouponPercent:
          data.calcouponPercent || 0,

        couponPercentPercentL:
          data.couponPercentPercentL || 0,

        pickUpDiscountPercentL:
          data.pickUpDiscountPercentL || 0,

        couponCode:
          data.couponCode || "",

        deliveryFee:
          data.deliveryFee || 0,

        discountTotal:
          data.discountTotal ||
          data.totalDiscountG ||
          0,

        taxBeforeDiscount:
          data.taxBeforeDiscount || 0,

        taxTotal:
          data.taxTotal || 0,

        subTotal:
          data.subTotal ||
          data.itemTotal ||
          0,

        grandTotal:
          data.grandTotal ||
          data.finalGrandTotal ||
          data.endTotalG ||
          0,

        // Dynamic source
        source,

        printed:
          data.printed || false,

        acknowledged:
          data.acknowledged || false,

        notes:
          data.notes || "",
      } as orderMasterDataT;
    });

    const lastDoc =
      snapshot.docs[snapshot.docs.length - 1];

    return {
      success: true,
      orders,
      lastId: lastDoc?.id || null,
      error: null,
    };

  } catch (error: any) {

    console.error(
      "fetchPosOrdersPaginated ERROR:",
      error
    );

    return {
      success: false,
      orders: [],
      lastId: null,

      error: {
        code: error?.code || "UNKNOWN_ERROR",
        message:
          error?.message ||
          "Failed to fetch orders.",
      },
    };
  }
}