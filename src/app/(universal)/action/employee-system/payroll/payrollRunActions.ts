"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { PayrollRun, PayrollRunStatus } from "@/lib/types/payroll/PayrollRun";
 

const COLLECTION = "payrollRuns";

/**
 * Create a new payroll run.
 *
 * At creation time the run starts as DRAFT.
 * Employees/items will be generated in the next step.
 */
export async function createPayrollRun(
  data: Omit<
    PayrollRun,
    | "id"
    | "status"
    | "employeeCount"
    | "grossAmount"
    | "totalDeductions"
    | "employerContributions"
    | "netAmount"
    | "createdAt"
    | "updatedAt"
  >
): Promise<string> {
  const docRef = adminDb.collection(COLLECTION).doc();

  const now = new Date().toISOString();

  const payrollRun: PayrollRun = {
    ...data,

    id: docRef.id,

    status: "DRAFT",

    employeeCount: 0,

    grossAmount: 0,

    totalDeductions: 0,

    employerContributions: 0,

    netAmount: 0,

    createdAt: now,

    updatedAt: now,
  };

  await docRef.set(payrollRun);

  return docRef.id;
}

/**
 * Get one payroll run.
 */
export async function getPayrollRun(
  payrollRunId: string
): Promise<PayrollRun | null> {
  const doc = await adminDb
    .collection(COLLECTION)
    .doc(payrollRunId)
    .get();

  if (!doc.exists) {
    return null;
  }

  return {
    ...(doc.data() as PayrollRun),
    id: doc.id,
  };
}

/**
 * Get all payroll runs.
 */
export async function getPayrollRuns(): Promise<PayrollRun[]> {
  const snapshot = await adminDb
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    ...(doc.data() as PayrollRun),
    id: doc.id,
  }));
}

/**
 * Update payroll run status.
 */
export async function updatePayrollRunStatus(
  payrollRunId: string,
  status: PayrollRunStatus
): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(payrollRunId)
    .update({
      status,
      updatedAt: new Date().toISOString(),
    });
}

/**
 * Update calculated payroll totals.
 */
export async function updatePayrollRunTotals(
  payrollRunId: string,
  totals: {
    employeeCount: number;
    grossAmount: number;
    totalDeductions: number;
    employerContributions: number;
    netAmount: number;
  }
): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(payrollRunId)
    .update({
      ...totals,
      updatedAt: new Date().toISOString(),
    });
}

/**
 * Approve payroll run.
 *
 * Only a payroll run in REVIEW can be approved.
 */
export async function approvePayrollRun(
  payrollRunId: string,
  approvedBy: string
): Promise<void> {
  const docRef = adminDb
    .collection(COLLECTION)
    .doc(payrollRunId);

  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    throw new Error("Payroll run not found");
  }

  const payrollRun = snapshot.data() as PayrollRun;

  if (payrollRun.status !== "REVIEW") {
    throw new Error(
      `Payroll run cannot be approved from status ${payrollRun.status}`
    );
  }

  await docRef.update({
    status: "APPROVED",
    approvedBy,
    approvedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Lock an approved payroll run.
 *
 * A locked payroll run should no longer be editable.
 */
export async function lockPayrollRun(
  payrollRunId: string
): Promise<void> {
  const docRef = adminDb
    .collection(COLLECTION)
    .doc(payrollRunId);

  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    throw new Error("Payroll run not found");
  }

  const payrollRun = snapshot.data() as PayrollRun;

  if (payrollRun.status !== "APPROVED") {
    throw new Error(
      `Payroll run cannot be locked from status ${payrollRun.status}`
    );
  }

  await docRef.update({
    status: "LOCKED",
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Cancel a payroll run.
 *
 * Locked payroll runs cannot be cancelled.
 */
export async function cancelPayrollRun(
  payrollRunId: string
): Promise<void> {
  const docRef = adminDb
    .collection(COLLECTION)
    .doc(payrollRunId);

  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    throw new Error("Payroll run not found");
  }

  const payrollRun = snapshot.data() as PayrollRun;

  if (payrollRun.status === "LOCKED") {
    throw new Error(
      "Locked payroll run cannot be cancelled"
    );
  }

  if (payrollRun.status === "CANCELLED") {
    return;
  }

  await docRef.update({
    status: "CANCELLED",
    updatedAt: new Date().toISOString(),
  });
}