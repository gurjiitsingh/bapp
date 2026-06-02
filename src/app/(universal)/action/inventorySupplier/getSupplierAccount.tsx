import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

// export async function getSupplierAccount(
//   supplierId: string
// ) {
//   const doc = await adminDb
//     .collection("supplierAccounts")
//     .doc(supplierId)
//     .get();

//   if (!doc.exists) return null;

//   return doc.data() as SupplierAccountType;
// }




export async function getSupplierAccount(
  supplierId: string
) {
  if (!supplierId) return null;

  const doc = await adminDb
    .collection("supplierAccounts")
    .doc(supplierId)
    .get();

  if (!doc.exists) return null;
console.log("supplierId-----------", supplierId)
  return {
    supplierId,
    ...doc.data(),
  };
}