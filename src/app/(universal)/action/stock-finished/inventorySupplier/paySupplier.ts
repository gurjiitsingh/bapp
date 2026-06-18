"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { updateSupplierAccount } from "../../inventorySupplier/updateSupplierAccount";


type PaymentMethod = "CASH" | "UPI" | "CARD";

export async function paySupplier({
  supplierId,
  amount,
  paymentMethod,
  note,
}: {
  supplierId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  note?: string;
}) {
  try {
    if (!supplierId || amount <= 0) {
      return { success: false, message: "Invalid payment" };
    }

    // =============================
    // CREATE TRANSACTION
    // =============================

    await adminDb.collection("inventoryTransactions").add({
      supplierId,

      type: "PAYMENT",

      totalAmount: amount,
      paidAmount: amount,
      dueAmount: 0,

      paymentMethod,
      paymentStatus: "PAID",

      note: note || "Supplier payment",

      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // =============================
    // UPDATE ACCOUNT
    // =============================

    await updateSupplierAccount({
      supplierId,
      type: "PAYMENT",
      totalAmount: 0,
      paidAmount: amount,
      dueAmount: 0,
      paymentMethod,
    });

    return { success: true };
  } catch (error) {
    console.error("❌ paySupplier failed:", error);
    return { success: false };
  }
}