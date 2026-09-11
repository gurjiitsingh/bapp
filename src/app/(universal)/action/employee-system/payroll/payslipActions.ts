"use server";

import { adminDb } from "@/lib/firebaseAdmin";

import type { PayrollRun } from "@/lib/types/payroll/PayrollRun";
import type { PayrollItem } from "@/lib/types/payroll/PayrollItem";

import type {
  PayrollPayment,
  PayrollPaymentMethod,
  PayrollPaymentStatus,
} from "./payrollPaymentActions";

/* =========================================================
   TYPES
========================================================= */

export interface PayslipData {
  payrollRun: PayrollRun;
  payrollItem: PayrollItem;

  payment: {
    id: string;
    amount: number;
    paymentMethod: PayrollPaymentMethod;
    paymentDate: string;
    reference?: string | null;
    status: PayrollPaymentStatus;
    paidBy?: string | null;
    createdAt: string;
  } | null;
}

/* =========================================================
   GET PAYSLIP
========================================================= */

export async function getPayslip(
  payrollRunId: string,
  employeeId: string
): Promise<PayslipData | null> {
  if (!payrollRunId.trim()) {
    throw new Error("Payroll run ID is required.");
  }

  if (!employeeId.trim()) {
    throw new Error("Employee ID is required.");
  }

  /* -------------------------------------------------------
     PAYROLL RUN
  ------------------------------------------------------- */

  const runRef = adminDb
    .collection("payrollRuns")
    .doc(payrollRunId);

  const runSnapshot = await runRef.get();

  if (!runSnapshot.exists) {
    throw new Error("Payroll run not found.");
  }

  const payrollRun = {
    ...(runSnapshot.data() as PayrollRun),
    id: runSnapshot.id,
  };

  /* -------------------------------------------------------
     PAYROLL ITEM
  ------------------------------------------------------- */

  const itemRef = runRef
    .collection("items")
    .doc(employeeId);

  const itemSnapshot = await itemRef.get();

  if (!itemSnapshot.exists) {
    throw new Error(
      "Payroll item for this employee was not found."
    );
  }

  const payrollItem = {
    ...(itemSnapshot.data() as PayrollItem),
    id: itemSnapshot.id,
  };

  /* -------------------------------------------------------
     PAYMENT
  ------------------------------------------------------- */

  const paymentsSnapshot = await itemRef
    .collection("payments")
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();

  let payment: PayslipData["payment"] = null;

  if (!paymentsSnapshot.empty) {
    const paymentDoc = paymentsSnapshot.docs[0];

    const paymentData =
      paymentDoc.data() as PayrollPayment;

    payment = {
      id: paymentDoc.id,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      paymentDate: paymentData.paymentDate,
      reference: paymentData.reference ?? null,
      status: paymentData.status,
      paidBy: paymentData.paidBy ?? null,
      createdAt: paymentData.createdAt,
    };
  }

  return {
    payrollRun,
    payrollItem,
    payment,
  };
}

/* =========================================================
   GET ALL PAYSLIPS FOR A PAYROLL RUN
========================================================= */

export async function getPayrollRunPayslips(
  payrollRunId: string
): Promise<PayslipData[]> {
  if (!payrollRunId.trim()) {
    throw new Error("Payroll run ID is required.");
  }

  const runRef = adminDb
    .collection("payrollRuns")
    .doc(payrollRunId);

  const runSnapshot = await runRef.get();

  if (!runSnapshot.exists) {
    throw new Error("Payroll run not found.");
  }

  const payrollRun = {
    ...(runSnapshot.data() as PayrollRun),
    id: runSnapshot.id,
  };

  const itemsSnapshot = await runRef
    .collection("items")
    .orderBy("employeeName")
    .get();

  const payslips: PayslipData[] = [];

  for (const itemDoc of itemsSnapshot.docs) {
    const payrollItem = {
      ...(itemDoc.data() as PayrollItem),
      id: itemDoc.id,
    };

    const paymentsSnapshot = await itemDoc.ref
      .collection("payments")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    let payment: PayslipData["payment"] = null;

    if (!paymentsSnapshot.empty) {
      const paymentDoc = paymentsSnapshot.docs[0];

      const paymentData =
        paymentDoc.data() as PayrollPayment;

      payment = {
        id: paymentDoc.id,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        paymentDate: paymentData.paymentDate,
        reference: paymentData.reference ?? null,
        status: paymentData.status,
        paidBy: paymentData.paidBy ?? null,
        createdAt: paymentData.createdAt,
      };
    }

    payslips.push({
      payrollRun,
      payrollItem,
      payment,
    });
  }

  return payslips;
}

/* =========================================================
   CHECK PAYSLIP AVAILABILITY
========================================================= */

export async function hasPayslip(
  payrollRunId: string,
  employeeId: string
): Promise<boolean> {
  if (!payrollRunId.trim() || !employeeId.trim()) {
    return false;
  }

  const itemRef = adminDb
    .collection("payrollRuns")
    .doc(payrollRunId)
    .collection("items")
    .doc(employeeId);

  const snapshot = await itemRef.get();

  return snapshot.exists;
}