import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

type PaymentMethod = "CASH" | "UPI" | "CARD";

type UpdateSupplierAccountParams = {
  supplierId: string;
  supplierName: string | undefined;
  type: "PURCHASE" | "SUPPLIER_RETURN" | "PAYMENT";

  totalAmount: number;
  paidAmount: number;
  dueAmount: number;

  paymentMethod?: PaymentMethod;
};

export async function updateSupplierAccount(
  tx: FirebaseFirestore.Transaction,
  {
    supplierId,
    supplierName,
    type,
    totalAmount,
    paidAmount,
    dueAmount,
    paymentMethod,
  }: UpdateSupplierAccountParams
) {
  console.log("in supplier account-------------------")
  if (!supplierId) return;

  const accountRef = adminDb
    .collection("supplierAccounts")
    .doc(supplierId);

  let credit = 0;
  let debit = 0;

  let purchase = 0;
  let returnAmount = 0;
  let paid = 0;

  let cash = 0;
  let upi = 0;
  let card = 0;

  // ==================================
  // PURCHASE
  // ==================================

  if (type === "PURCHASE") {
    purchase = totalAmount;

    paid = paidAmount;

    // Supplier payable increases only by unpaid amount
    credit = dueAmount;

    if (paid > 0) {
      if (paymentMethod === "CASH") cash = paid;
      if (paymentMethod === "UPI") upi = paid;
      if (paymentMethod === "CARD") card = paid;
    }
  }

  // ==================================
  // SUPPLIER RETURN
  // ==================================

  if (type === "SUPPLIER_RETURN") {
    debit = totalAmount;
    returnAmount = totalAmount;
  }

  // ==================================
  // PAYMENT TO SUPPLIER
  // ==================================

  if (type === "PAYMENT") {
    debit = paidAmount;
    paid = paidAmount;

    if (paymentMethod === "CASH") cash = paidAmount;
    if (paymentMethod === "UPI") upi = paidAmount;
    if (paymentMethod === "CARD") card = paidAmount;
  }

  // ==================================
  // UPDATE ACCOUNT
  // ==================================

  tx.set(
    accountRef,
    {
      supplierId,
      supplierName,
      totalCredit:
        admin.firestore.FieldValue.increment(credit),

      totalDebit:
        admin.firestore.FieldValue.increment(debit),

      totalPurchase:
        admin.firestore.FieldValue.increment(purchase),

      totalReturn:
        admin.firestore.FieldValue.increment(returnAmount),

      totalPaid:
        admin.firestore.FieldValue.increment(paid),

      cashPaid:
        admin.firestore.FieldValue.increment(cash),

      upiPaid:
        admin.firestore.FieldValue.increment(upi),

      cardPaid:
        admin.firestore.FieldValue.increment(card),

      // Purchase due increases payable
      // Returns & payments decrease payable
      balance:
        admin.firestore.FieldValue.increment(
          credit - debit
        ),


      updatedAt:
        admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}