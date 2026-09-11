"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { PayrollItem } from "@/lib/types/payroll/PayrollItem";
import { PayrollRun } from "@/lib/types/payroll/PayrollRun";


const RUN_COLLECTION = "payrollRuns";

/*
 * =========================================================
 * PAYMENT TYPES
 * =========================================================
 */

export type PayrollPaymentMethod =
    | "BANK_TRANSFER"
    | "CASH"
    | "CHEQUE"
    | "UPI"
    | "OTHER";

export type PayrollPaymentStatus =
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "CANCELLED";

export interface PayrollPayment {
    payrollRunId: string;
    employeeId: string;

    employeeName: string;

    currency: PayrollItem["currency"];

    amount: number;

    paymentMethod: PayrollPaymentMethod;

    paymentDate: string;

    reference?: string | null;
    paidBy?: string | null;

    status: PayrollPaymentStatus;



    createdAt: string;

    updatedAt: string;
}

/*
 * =========================================================
 * PAY ONE EMPLOYEE
 * =========================================================
 */

export async function payPayrollItem(
    payrollRunId: string,
    employeeId: string,
    payment: {
        paymentMethod: PayrollPaymentMethod;
        paymentDate: string;
        reference?: string;
        paidBy?: string;
    }
): Promise<void> {
    if (!payrollRunId.trim()) {
        throw new Error("Payroll run ID is required.");
    }

    if (!employeeId.trim()) {
        throw new Error("Employee ID is required.");
    }

    if (!payment.paymentMethod) {
        throw new Error("Payment method is required.");
    }

    if (!payment.paymentDate) {
        throw new Error("Payment date is required.");
    }

    /*
     * ---------------------------------------------------------
     * GET PAYROLL RUN
     * ---------------------------------------------------------
     */

    const runRef = adminDb
        .collection(RUN_COLLECTION)
        .doc(payrollRunId);

    const runSnapshot = await runRef.get();

    if (!runSnapshot.exists) {
        throw new Error("Payroll run not found.");
    }

    const payrollRun = {
        ...(runSnapshot.data() as PayrollRun),
        id: runSnapshot.id,
    };

    /*
     * ---------------------------------------------------------
     * ONLY LOCKED RUN CAN BE PAID
     * ---------------------------------------------------------
     */

    if (payrollRun.status !== "LOCKED") {
        throw new Error(
            `Payroll can only be paid after the run is LOCKED. Current status: ${payrollRun.status}`
        );
    }

    /*
     * ---------------------------------------------------------
     * GET PAYROLL ITEM
     * ---------------------------------------------------------
     */

    const itemRef = runRef
        .collection("items")
        .doc(employeeId);

    const itemSnapshot = await itemRef.get();

    if (!itemSnapshot.exists) {
        throw new Error(
            "Payroll item for this employee was not found."
        );
    }

    const item = {
        ...(itemSnapshot.data() as PayrollItem),
        id: itemSnapshot.id,
    };

    /*
     * ---------------------------------------------------------
     * VALIDATE ITEM
     * ---------------------------------------------------------
     */

    if (item.status === "PAID") {
        throw new Error(
            "This employee has already been paid."
        );
    }

    if (item.status === "CANCELLED") {
        throw new Error(
            "Cancelled payroll item cannot be paid."
        );
    }

    if (!Number.isFinite(item.netAmount)) {
        throw new Error(
            "Invalid net payroll amount."
        );
    }

    if (item.netAmount < 0) {
        throw new Error(
            "Net payroll amount cannot be negative."
        );
    }

    /*
     * ---------------------------------------------------------
     * CREATE PAYMENT
     * ---------------------------------------------------------
     */

    const now = new Date().toISOString();

    const paymentRef = itemRef
        .collection("payments")
        .doc();

    const payrollPayment: PayrollPayment = {
        payrollRunId,
        employeeId,
        employeeName: item.employeeName,
        currency: item.currency,
        amount: item.netAmount,
        paymentMethod: payment.paymentMethod,
        paymentDate: payment.paymentDate,
        reference: payment.reference?.trim() || null,
        status: "PAID",
        paidBy: payment.paidBy?.trim() || null,
        createdAt: now,
        updatedAt: now,
    };

    /*
     * ---------------------------------------------------------
     * SAVE PAYMENT + UPDATE PAYROLL ITEM
     * ---------------------------------------------------------
     */

    const batch = adminDb.batch();

    batch.set(
        paymentRef,
        payrollPayment
    );

    batch.update(itemRef, {
        status: "PAID",
        paidAt: payment.paymentDate,
        paymentId: paymentRef.id,
        paymentMethod: payment.paymentMethod,
        paymentReference:
            payment.reference?.trim() || null,
        updatedAt: now,
    });

    await batch.commit();
}

/*
 * =========================================================
 * GET PAYMENTS FOR ONE EMPLOYEE
 * =========================================================
 */

export async function getPayrollItemPayments(
    payrollRunId: string,
    employeeId: string
): Promise<PayrollPayment[]> {
    if (!payrollRunId.trim()) {
        throw new Error("Payroll run ID is required.");
    }

    if (!employeeId.trim()) {
        throw new Error("Employee ID is required.");
    }

    const snapshot = await adminDb
        .collection(RUN_COLLECTION)
        .doc(payrollRunId)
        .collection("items")
        .doc(employeeId)
        .collection("payments")
        .orderBy("createdAt", "desc")
        .get();

    return snapshot.docs.map((doc) => ({
        ...(doc.data() as PayrollPayment),
        payrollRunId,
        employeeId,
    }));
}

/*
 * =========================================================
 * GET ALL PAYMENTS FOR A PAYROLL RUN
 * =========================================================
 */

export async function getPayrollRunPayments(
    payrollRunId: string
): Promise<PayrollPayment[]> {
    if (!payrollRunId.trim()) {
        throw new Error("Payroll run ID is required.");
    }

    const runRef = adminDb
        .collection(RUN_COLLECTION)
        .doc(payrollRunId);

    const itemsSnapshot = await runRef
        .collection("items")
        .get();

    const payments: PayrollPayment[] = [];

    for (const itemDoc of itemsSnapshot.docs) {
        const paymentsSnapshot = await itemDoc.ref
            .collection("payments")
            .orderBy("createdAt", "desc")
            .get();

        for (const paymentDoc of paymentsSnapshot.docs) {
            payments.push({
                ...(paymentDoc.data() as PayrollPayment),
                payrollRunId,
                employeeId: itemDoc.id,
            });
        }
    }

    return payments;
}

/*
 * =========================================================
 * GET UNPAID PAYROLL ITEMS
 * =========================================================
 */

export async function getUnpaidPayrollItems(
    payrollRunId: string
): Promise<PayrollItem[]> {
    if (!payrollRunId.trim()) {
        throw new Error("Payroll run ID is required.");
    }

    const runRef = adminDb
        .collection(RUN_COLLECTION)
        .doc(payrollRunId);

    const runSnapshot = await runRef.get();

    if (!runSnapshot.exists) {
        throw new Error("Payroll run not found.");
    }

    const payrollRun = runSnapshot.data() as PayrollRun;

    if (payrollRun.status !== "LOCKED") {
        throw new Error(
            "Unpaid payroll items can only be viewed for a locked payroll run."
        );
    }

    const snapshot = await runRef
        .collection("items")
        .where("status", "==", "PENDING")
        .get();

    return snapshot.docs.map((doc) => ({
        ...(doc.data() as PayrollItem),
        id: doc.id,
    }));
}

/*
 * =========================================================
 * MARK PAYMENT AS FAILED
 * =========================================================
 *
 * This is useful later if you integrate a bank/payment API.
 * It does not change the payroll item to PAID.
 *
 * =========================================================
 */

export async function markPayrollPaymentFailed(
    payrollRunId: string,
    employeeId: string,
    paymentId: string
): Promise<void> {
    if (!payrollRunId.trim()) {
        throw new Error("Payroll run ID is required.");
    }

    if (!employeeId.trim()) {
        throw new Error("Employee ID is required.");
    }

    if (!paymentId.trim()) {
        throw new Error("Payment ID is required.");
    }

    const paymentRef = adminDb
        .collection(RUN_COLLECTION)
        .doc(payrollRunId)
        .collection("items")
        .doc(employeeId)
        .collection("payments")
        .doc(paymentId);

    const paymentSnapshot =
        await paymentRef.get();

    if (!paymentSnapshot.exists) {
        throw new Error("Payment not found.");
    }

    const payment =
        paymentSnapshot.data() as PayrollPayment;

    if (payment.status === "PAID") {
        throw new Error(
            "A completed payment cannot be marked as failed."
        );
    }

    await paymentRef.update({
        status: "FAILED",
        updatedAt: new Date().toISOString(),
    });
}