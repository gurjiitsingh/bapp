import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

type UpdateSupplierAccountParams = {
  supplierId?: string;
  transactionType: string;
  totalCost: number;
};

export async function updateSupplierAccount({
  supplierId,
  transactionType,
  totalCost,
}: UpdateSupplierAccountParams) {
  try {
    // ❗ skip if no supplier
    if (!supplierId) return;

    const accountRef = adminDb
      .collection("supplierAccounts")
      .doc(supplierId);

    let credit = 0;
    let debit = 0;

    let purchase = 0;
    let returnAmount = 0;

    // ===============================
    // LOGIC
    // ===============================

    if (transactionType === "PURCHASE") {
      credit = totalCost;
      purchase = totalCost;
    }

    if (transactionType === "SUPPLIER_RETURN") {
      debit = totalCost;
      returnAmount = totalCost;
    }

    // ===============================
    // UPDATE (ATOMIC)
    // ===============================

    await accountRef.set(
      {
        supplierId,

        totalCredit:
          admin.firestore.FieldValue.increment(credit),

        totalDebit:
          admin.firestore.FieldValue.increment(debit),

        totalPurchase:
          admin.firestore.FieldValue.increment(purchase),

        totalReturn:
          admin.firestore.FieldValue.increment(returnAmount),

        balance:
          admin.firestore.FieldValue.increment(
            credit - debit
          ),

        updatedAt:
          admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error(
      "❌ updateSupplierAccount failed:",
      error
    );
  }
}