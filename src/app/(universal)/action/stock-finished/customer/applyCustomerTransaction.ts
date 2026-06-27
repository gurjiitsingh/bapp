import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

type PaymentMethod = "CASH" | "UPI" | "CARD";

type ApplyCustomerTransactionParams = {
  customerId?: string;
  customerName?: string;

  type: "SALE" | "CUSTOMER_RETURN" | "PAYMENT";

  totalAmount: number;
  paidAmount: number;
  dueAmount: number;

  paymentMethod?: PaymentMethod;

  referenceType?: string;
  referenceId?: string;

  note?: string;
  createdBy?: string;
  source?: "SYSTEM" | "ADMIN" | "POS";
};

export async function applyCustomerTransaction(
  tx: FirebaseFirestore.Transaction,
  {
    customerId,
    customerName,

    type,

    totalAmount,
    paidAmount,
    dueAmount,

    paymentMethod,

    referenceType = "MANUAL",
    referenceId = "",

    note = "",
    createdBy = "system",
    source = "SYSTEM",
  }: ApplyCustomerTransactionParams
) {
  if (!customerId) return;

  const ledgerRef = adminDb.collection("customerLedger").doc();

  tx.set(ledgerRef, {
    transactionId: ledgerRef.id,

    customerId,
    customerName: customerName || "",

    type,

    totalAmount,
    paidAmount,
    dueAmount,

    paymentMethod: paymentMethod || null,

    referenceType,
    referenceId,

    note,

    createdBy,
    source,

    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    transactionId: ledgerRef.id,
  };
}