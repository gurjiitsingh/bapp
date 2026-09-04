"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export async function getNextWebOrderSerial(
  financialYear: string
): Promise<number> {
  const counterRef = adminDb
    .collection("orderCounters")
    .doc(`WEB_${financialYear}`);

  const nextSerial = await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(counterRef);

    const currentSerial = snapshot.exists
      ? Number(snapshot.data()?.invoiceSerialNo ?? 0)
      : 0;

    const next = currentSerial + 1;

    transaction.set(
      counterRef,
      {
        deviceCode: "WEB",
        financialYear: financialYear,
        invoiceSerialNo: next,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return next;
  });

  return nextSerial;
}

export async function getFinancialYearCode(
  date: Date = new Date()
): Promise<string> {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const startYear = month >= 4 ? year : year - 1;
  const endYear = startYear + 1;

  return `${String(startYear).slice(-2)}${String(endYear).slice(-2)}`;
}