"use server";

import { adminDb } from "@/lib/firebaseAdmin";

import {
 
  CartItemWithTax,
  
} from "@/lib/types/cartDataType";
 


export async function addProductDraft(
  element: CartItemWithTax,
  userAddedId: string,
  orderMasterId: string
) {
  const product = {
    prodcutId: element.id,
    name: element.name,
    price: element.price,
    quantity: element.quantity,
    itemSubtotal: element.itemSubtotal,
    orderMasterId,
    userId: userAddedId,
    taxAmount: element.taxAmount, // per one item
    taxTotal: element.taxTotal, // tax * quantity
    finalPrice: element.finalPrice, // price + tax
    finalTotal: element.finalTotal, // finalPrice * quantity

    note: element.note || "",
    modifiers: element.modifiers || [],
  };

  try {
    const docRef = await adminDb.collection("orderProducts").add(product);
    console.log("Purchased product document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}