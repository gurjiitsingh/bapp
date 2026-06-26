import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

type PaymentMethod = "CASH" | "UPI" | "CARD";

type UpdateCustomerAccountParams = {
  wholeSaleCutomerId?: string;

  type: "SALE" | "CUSTOMER_RETURN" | "PAYMENT";

  totalAmount: number;
  paidAmount: number;
  dueAmount: number;

  paymentMethod?: PaymentMethod;
};

export async function updateCustomerAccount(
  tx: FirebaseFirestore.Transaction,
  {
    wholeSaleCutomerId,
    type,
    totalAmount,
    paidAmount,
    dueAmount,
    paymentMethod,
  }: UpdateCustomerAccountParams
) {
  if (!wholeSaleCutomerId) return;

  const accountRef = adminDb
    .collection("customerAccounts")
    .doc(wholeSaleCutomerId);

  let credit = 0;
  let debit = 0;

  let sale = 0;
  let returnAmount = 0;
  let paid = 0;

  let cash = 0;
  let upi = 0;
  let card = 0;

  // ===============================
  // CUSTOMER SALE
  // ===============================

  if (type === "SALE") {
    sale = totalAmount;

    paid = paidAmount;

    // Customer owes only unpaid amount
    debit = dueAmount;

    if (paymentMethod === "CASH") cash = paidAmount;
    if (paymentMethod === "UPI") upi = paidAmount;
    if (paymentMethod === "CARD") card = paidAmount;
  }

  // ===============================
  // CUSTOMER RETURN
  // ===============================

  if (type === "CUSTOMER_RETURN") {
    credit = totalAmount;
    returnAmount = totalAmount;
  }

  // ===============================
  // CUSTOMER PAYMENT
  // ===============================

  if (type === "PAYMENT") {
    credit = paidAmount;
    paid = paidAmount;

    if (paymentMethod === "CASH") cash = paidAmount;
    if (paymentMethod === "UPI") upi = paidAmount;
    if (paymentMethod === "CARD") card = paidAmount;
  }

  // ===============================
  // UPDATE ACCOUNT (TRANSACTION)
  // ===============================

  tx.set(
    accountRef,
    {
      wholeSaleCutomerId,

      totalCredit: admin.firestore.FieldValue.increment(credit),
      totalDebit: admin.firestore.FieldValue.increment(debit),

      totalSales: admin.firestore.FieldValue.increment(sale),
      totalReturn: admin.firestore.FieldValue.increment(returnAmount),

      totalPaid: admin.firestore.FieldValue.increment(paid),

      cashPaid: admin.firestore.FieldValue.increment(cash),
      upiPaid: admin.firestore.FieldValue.increment(upi),
      cardPaid: admin.firestore.FieldValue.increment(card),

      // debit increases receivable
      // credit decreases receivable
      balance: admin.firestore.FieldValue.increment(debit - credit),

      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}