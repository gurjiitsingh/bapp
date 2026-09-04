"use server";

import { adminDb } from "@/lib/firebaseAdmin";
 
import { TOrderMaster, orderMasterDataT } from "@/lib/types/orderMasterType";
 

export async function addOrderToMaster(element: orderMasterDataT) {
  // console.log("element-----------", element);
  try {
    const docRef = await adminDb.collection("orderMaster").add(element);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    return null;
  }
}