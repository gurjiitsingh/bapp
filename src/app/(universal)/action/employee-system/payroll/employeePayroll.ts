"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import type { EmployeePayrollProfile } from "@/lib/types/payroll/EmployeePayrollProfile";

const COLLECTION = "payrollEmployeeProfiles";

/*
 * =========================================================
 * GET EMPLOYEE PAYROLL PROFILE
 * =========================================================
 */
export async function getEmployeePayrollProfile(
  employeeId: string
): Promise<EmployeePayrollProfile | null> {
  if (!employeeId.trim()) {
    throw new Error("Employee ID is required.");
  }

  const doc = await adminDb
    .collection(COLLECTION)
    .doc(employeeId)
    .get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data();

  if (!data) {
    return null;
  }

  return {
    ...(data as EmployeePayrollProfile),
    employeeId: doc.id,
  };
}

/*
 * =========================================================
 * SAVE EMPLOYEE PAYROLL PROFILE
 * =========================================================
 */
export async function saveEmployeePayrollProfile(
  profile: EmployeePayrollProfile
): Promise<void> {
  if (!profile.employeeId.trim()) {
    throw new Error("Employee ID is required.");
  }

  if (!profile.countryCode) {
    throw new Error("Payroll country is required.");
  }

  if (!profile.currency) {
    throw new Error("Payroll currency is required.");
  }

  if (!profile.employmentType) {
    throw new Error("Employment type is required.");
  }

  if (!profile.salaryType) {
    throw new Error("Salary type is required.");
  }

  if (!profile.payFrequency) {
    throw new Error("Pay frequency is required.");
  }

  if (!profile.effectiveFrom) {
    throw new Error("Effective-from date is required.");
  }

  /*
   * ---------------------------------------------------------
   * DATE VALIDATION
   * ---------------------------------------------------------
   */

  if (
    profile.effectiveTo &&
    profile.effectiveTo < profile.effectiveFrom
  ) {
    throw new Error(
      "Effective-to date cannot be before effective-from date."
    );
  }

  /*
   * ---------------------------------------------------------
   * SALARY VALIDATION
   * ---------------------------------------------------------
   */

  validateAmount(
    profile.annualSalary,
    "Annual salary"
  );

  validateAmount(
    profile.monthlySalary,
    "Monthly salary"
  );

  validateAmount(
    profile.dailyRate,
    "Daily rate"
  );

  validateAmount(
    profile.hourlyRate,
    "Hourly rate"
  );

  validateAmount(
    profile.overtimeRate,
    "Overtime rate"
  );

  /*
   * ---------------------------------------------------------
   * SALARY TYPE REQUIREMENTS
   * ---------------------------------------------------------
   */

  if (
    profile.salaryType === "MONTHLY" &&
    profile.monthlySalary == null
  ) {
    throw new Error(
      "Monthly salary is required for monthly employees."
    );
  }

  if (
    profile.salaryType === "DAILY" &&
    profile.dailyRate == null
  ) {
    throw new Error(
      "Daily rate is required for daily employees."
    );
  }

  if (
    profile.salaryType === "HOURLY" &&
    profile.hourlyRate == null
  ) {
    throw new Error(
      "Hourly rate is required for hourly employees."
    );
  }

  /*
   * ---------------------------------------------------------
   * SAVE
   * ---------------------------------------------------------
   */

  const docRef = adminDb
    .collection(COLLECTION)
    .doc(profile.employeeId);

  const existing = await docRef.get();

  const now = new Date().toISOString();

  const data: EmployeePayrollProfile = {
    ...profile,

    employeeId: profile.employeeId,

    createdAt: existing.exists
      ? existing.data()?.createdAt ?? now
      : now,

    updatedAt: now,
  };

  await docRef.set(data, {
    merge: true,
  });
}

/*
 * =========================================================
 * DELETE EMPLOYEE PAYROLL PROFILE
 * =========================================================
 */
export async function deleteEmployeePayrollProfile(
  employeeId: string
): Promise<void> {
  if (!employeeId.trim()) {
    throw new Error("Employee ID is required.");
  }

  await adminDb
    .collection(COLLECTION)
    .doc(employeeId)
    .delete();
}

/*
 * =========================================================
 * CHECK PROFILE EXISTS
 * =========================================================
 */
export async function hasEmployeePayrollProfile(
  employeeId: string
): Promise<boolean> {
  if (!employeeId.trim()) {
    return false;
  }

  const doc = await adminDb
    .collection(COLLECTION)
    .doc(employeeId)
    .get();

  return doc.exists;
}

/*
 * =========================================================
 * VALIDATE AMOUNT
 * =========================================================
 */
function validateAmount(
  value: number | undefined,
  label: string
): void {
  if (value === undefined) {
    return;
  }

  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    throw new Error(
      `${label} must be a valid non-negative number.`
    );
  }
}