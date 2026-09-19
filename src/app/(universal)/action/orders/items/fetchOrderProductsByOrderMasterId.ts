"use server";
import { adminDb } from "@/lib/firebaseAdmin";
 
import { OrderProductT } from "@/lib/types/orderType";

 
export async function fetchOrderProductsByOrderMasterId(
  orderMasterId: string
): Promise<{
  success: boolean;
  products: OrderProductT[];
  error: string | null;
}> {
  if (!orderMasterId?.trim()) {
    return {
      success: false,
      products: [],
      error: "Order master ID is required.",
    };
  }

  try {
    const snapshot = await adminDb
      .collection("orderProducts")
      .where("orderMasterId", "==", orderMasterId)
      .get();

    const products: OrderProductT[] = snapshot.docs.map((doc) => {
      const raw = doc.data();

      return {
        ...raw,

        id: doc.id,

        productId:
          raw.productId ??
          raw.id ??
          "",

        orderMasterId:
          raw.orderMasterId ??
          orderMasterId,

        name:
          raw.name ??
          "",

        price:
          raw.price ??
          0,

        quantity:
          raw.quantity ??
          0,

        itemSubtotal:
          raw.itemSubtotal ??
          0,

        taxRate:
          raw.taxRate ??
          0,

        taxType:
          raw.taxType ??
          "exclusive",

        taxAmount:
          raw.taxAmount ??
          0,

        taxTotal:
          raw.taxTotal ??
          0,

        finalPrice:
          raw.finalPrice ??
          0,

        finalTotal:
          raw.finalTotal ??
          0,

        image:
          raw.image ??
          "",

        categoryId:
          raw.categoryId ??
          "",

        productCat:
          raw.productCat ??
          "",

        purchaseSession:
          raw.purchaseSession ??
          "",

        status:
          raw.status ??
          "",

        userId:
          raw.userId ??
          "",

        productDesc:
          raw.productDesc ??
          "",

        note:
          raw.note ??
          "",

        modifiers:
          Array.isArray(raw.modifiers)
            ? raw.modifiers
            : [],

        // IMPORTANT:
        // Convert Firestore Timestamp to plain string
        createdAt:
          raw.createdAt?.toDate?.()?.toISOString?.() ??
          null,

        orderDate:
          raw.orderDate?.toDate?.()?.toISOString?.() ??
          raw.orderDate ??
          null,
      } as OrderProductT;
    });

    return {
      success: true,
      products,
      error: null,
    };
  } catch (error) {
    console.error(
      "fetchOrderProductsByOrderMasterId ERROR:",
      error
    );

    return {
      success: false,
      products: [],
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch order products.",
    };
  }
}