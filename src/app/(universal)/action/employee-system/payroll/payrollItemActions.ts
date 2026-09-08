"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { PayrollItem, PayrollLineItem } from "@/lib/types/payroll/PayrollItem";
 

const PAYROLL_RUNS_COLLECTION = "payrollRuns";

/**
 * Get the Firestore reference for a payroll item's subcollection.
 *
 * Structure:
 *
 * payrollRuns/{payrollRunId}/items/{employeeId}
 */
function getItemsCollection(payrollRunId: string) {
  return adminDb
    .collection(PAYROLL_RUNS_COLLECTION)
    .doc(payrollRunId)
    .collection("items");
}

/**
 * Create or replace a payroll item for an employee.
 *
 * Employee ID is used as the document ID so that one employee
 * can only have one payroll item inside a payroll run.
 */
export async function createPayrollItem(
  payrollItem: PayrollItem
): Promise<string> {
  const docRef = getItemsCollection(payrollItem.payrollRunId)
    .doc(payrollItem.employeeId);

  const now = new Date().toISOString();

  await docRef.set({
    ...payrollItem,
    id: docRef.id,
    createdAt: payrollItem.createdAt || now,
  });

  return docRef.id;
}

/**
 * Get one payroll item.
 */
export async function getPayrollItem(
  payrollRunId: string,
  employeeId: string
): Promise<PayrollItem | null> {
  const doc = await getItemsCollection(payrollRunId)
    .doc(employeeId)
    .get();

  if (!doc.exists) {
    return null;
  }

  return {
    ...(doc.data() as PayrollItem),
    id: doc.id,
  };
}

/**
 * Get all payroll items for a payroll run.
 */
export async function getPayrollItems(
  payrollRunId: string
): Promise<PayrollItem[]> {
  const snapshot = await getItemsCollection(payrollRunId)
    .orderBy("employeeName", "asc")
    .get();

  return snapshot.docs.map((doc) => ({
    ...(doc.data() as PayrollItem),
    id: doc.id,
  }));
}

/**
 * Update a payroll item.
 *
 * Payroll items that are already PAID or CANCELLED
 * cannot be edited.
 */
export async function updatePayrollItem(
  payrollRunId: string,
  employeeId: string,
  data: Partial<
    Omit<
      PayrollItem,
      "id" | "payrollRunId" | "employeeId" | "createdAt"
    >
  >
): Promise<void> {
  const docRef = getItemsCollection(payrollRunId)
    .doc(employeeId);

  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    throw new Error("Payroll item not found");
  }

  const current = snapshot.data() as PayrollItem;

  if (current.status === "PAID") {
    throw new Error(
      "Paid payroll item cannot be edited"
    );
  }

  if (current.status === "CANCELLED") {
    throw new Error(
      "Cancelled payroll item cannot be edited"
    );
  }

  await docRef.update({
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Update the payroll amounts for an employee.
 *
 * Useful after salary/attendance/deduction calculation.
 */
export async function updatePayrollItemAmounts(
  payrollRunId: string,
  employeeId: string,
  data: {
    workingDays: number;
    paidDays: number;
    unpaidDays: number;
    overtimeHours: number;
    earnings: PayrollLineItem[];
    deductions: PayrollLineItem[];
    employerContributions: PayrollLineItem[];
    grossAmount: number;
    totalDeductions: number;
    netAmount: number;
  }
): Promise<void> {
  const docRef = getItemsCollection(payrollRunId)
    .doc(employeeId);

  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    throw new Error("Payroll item not found");
  }

  const current = snapshot.data() as PayrollItem;

  if (current.status === "PAID") {
    throw new Error(
      "Paid payroll item cannot be recalculated"
    );
  }

  if (current.status === "CANCELLED") {
    throw new Error(
      "Cancelled payroll item cannot be recalculated"
    );
  }

  await docRef.update({
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Approve one payroll item.
 */
export async function approvePayrollItem(
  payrollRunId: string,
  employeeId: string
): Promise<void> {
  const docRef = getItemsCollection(payrollRunId)
    .doc(employeeId);

  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    throw new Error("Payroll item not found");
  }

  const payrollItem = snapshot.data() as PayrollItem;

  if (payrollItem.status !== "PENDING") {
    throw new Error(
      `Payroll item cannot be approved from status ${payrollItem.status}`
    );
  }

  await docRef.update({
    status: "APPROVED",
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Mark one payroll item as paid.
 *
 * This will be connected to the actual payment/ledger
 * system in the next stage.
 */
export async function markPayrollItemPaid(
  payrollRunId: string,
  employeeId: string
): Promise<void> {
  const docRef = getItemsCollection(payrollRunId)
    .doc(employeeId);

  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    throw new Error("Payroll item not found");
  }

  const payrollItem = snapshot.data() as PayrollItem;

  if (payrollItem.status === "PAID") {
    return;
  }

  if (payrollItem.status !== "APPROVED") {
    throw new Error(
      `Payroll item must be APPROVED before payment. Current status: ${payrollItem.status}`
    );
  }

  await docRef.update({
    status: "PAID",
    updatedAt: new Date().toISOString(),
    paidAt: new Date().toISOString(),
  });
}

/**
 * Cancel one payroll item.
 */
export async function cancelPayrollItem(
  payrollRunId: string,
  employeeId: string
): Promise<void> {
  const docRef = getItemsCollection(payrollRunId)
    .doc(employeeId);

  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    throw new Error("Payroll item not found");
  }

  const payrollItem = snapshot.data() as PayrollItem;

  if (payrollItem.status === "PAID") {
    throw new Error(
      "Paid payroll item cannot be cancelled"
    );
  }

  if (payrollItem.status === "CANCELLED") {
    return;
  }

  await docRef.update({
    status: "CANCELLED",
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a payroll item.
 *
 * Only PENDING items can be deleted.
 * For approved/paid records we keep the record for
 * payroll history and audit purposes.
 */
export async function deletePayrollItem(
  payrollRunId: string,
  employeeId: string
): Promise<void> {
  const docRef = getItemsCollection(payrollRunId)
    .doc(employeeId);

  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    return;
  }

  const payrollItem = snapshot.data() as PayrollItem;

  if (payrollItem.status !== "PENDING") {
    throw new Error(
      "Only pending payroll items can be deleted"
    );
  }

  await docRef.delete();
}