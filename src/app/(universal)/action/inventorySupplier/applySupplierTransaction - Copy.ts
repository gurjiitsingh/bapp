import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

type PaymentMethod = "CASH" | "UPI" | "CARD";

type ApplySupplierTransactionParams = {
  supplierId?: string;
  supplierName?: string;

  type: "PURCHASE" | "SUPPLIER_RETURN" | "PAYMENT";

  totalAmount: number;
  paidAmount: number;
  dueAmount: number;

  currentBalance: number;

  paymentMethod?: PaymentMethod;

  referenceType?: string;
  referenceId?: string;

  note?: string;
  createdBy?: string;
  source?: "SYSTEM" | "ADMIN" | "WEB_ADMIN";
};

export async function applySupplier_Transaction_old(
  tx: FirebaseFirestore.Transaction,
  {
    supplierId,
    supplierName,

    type,

    totalAmount,
    paidAmount,
    dueAmount,
    currentBalance,

    paymentMethod,

    referenceType = "MANUAL",
    referenceId = "",

    note = "",
    createdBy = "system",
    source = "SYSTEM",
  }: ApplySupplierTransactionParams
) {

   
  if (!supplierId) return;

  // ==========================================
  // SUPPLIER LEDGER
  // ==========================================
const total = Number(totalAmount || 0);
const paid = Number(paidAmount || 0);
const due = Number(dueAmount || 0);

let balanceChange = 0;

switch (type) {
  case "PURCHASE":
    balanceChange = due;
    break;

  case "SUPPLIER_RETURN":
    balanceChange = -total;
    break;

  case "PAYMENT":
    balanceChange = -paid;
    break;
}

// ==========================================
  // CALCULATE RUNNING BALANCE
  // ==========================================


const balance = currentBalance + balanceChange;

  const ledgerRef = adminDb
    .collection("supplierLedger")
    .doc();

 tx.set(ledgerRef, {
  transactionId: ledgerRef.id,

  supplierId,
  supplierName: supplierName || "",

  type,

  totalAmount:total,
  paidAmount:paid,
  dueAmount:due,

  previousBalance: currentBalance,
  balanceChange,
  balance,

  paymentMethod: paymentMethod || null,

  referenceType,
  referenceId,

  note,

  createdBy,

  source,

  status: "ACTIVE",

  createdAt:
    admin.firestore.FieldValue.serverTimestamp(),
});

  return {
    transactionId: ledgerRef.id,
    balance,
  };
}