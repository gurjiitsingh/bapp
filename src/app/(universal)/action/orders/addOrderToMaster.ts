"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import type { orderMasterDataT } from "@/lib/types/orderMasterType";
import type { CartItemWithTax } from "@/lib/types/cartDataType";

/**
 * Save the order master and all products in one atomic Firestore batch.
 */
export async function addOrderWithProducts(
  order: orderMasterDataT,
  products: CartItemWithTax[],
  userId: string
): Promise<string> {
  if (!userId?.trim()) {
    throw new Error("Cannot save order: missing user ID");
  }

  if (products.length === 0) {
    throw new Error("Cannot save order: no products supplied");
  }

  const orderRef = adminDb.collection("orderMaster").doc();
  const batch = adminDb.batch();

  batch.set(orderRef, {
    ...order,
    id: orderRef.id,
    productsCount: products.length,
  });

  for (const item of products) {
    const productRef = adminDb.collection("orderProducts").doc();

    batch.set(productRef, {
      prodcutId: item.id,
      name: item.name,
      basePrice: item.price,
      quantity: item.quantity,
      itemSubtotal: item.itemSubtotal,
      orderMasterId: orderRef.id,
      userId,
      taxAmount: item.taxAmount,
      taxTotal: item.taxTotal,
      finalPrice: item.finalPrice,
      finalTotal: item.finalTotal,
      note: item.note || "",
      modifiers: item.modifiers || [],
    });
  }

  // Nothing is committed unless the entire batch succeeds.
  await batch.commit();

  console.log(
    `[NEW_ORDER] Atomically saved order ${orderRef.id} ` +
      `with ${products.length} products`
  );

  return orderRef.id;
}

/**
 * Keep this function if other parts of your application still use it.
 */
export async function addOrderToMaster(element: orderMasterDataT) {
  try {
    const docRef = await adminDb.collection("orderMaster").add(element);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    return null;
  }
}
