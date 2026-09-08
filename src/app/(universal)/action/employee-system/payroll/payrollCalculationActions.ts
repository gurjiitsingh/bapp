"use server";

import { adminDb } from "@/lib/firebaseAdmin";

import { Employee } from "@/lib/types/payroll/EmployeeTypes";
import { EmployeePayrollProfile } from "@/lib/types/payroll/EmployeePayrollProfile";
import { PayrollItem, PayrollLineItem } from "@/lib/types/payroll/PayrollItem";
import { PayrollRun } from "@/lib/types/payroll/PayrollRun";
 

const EMPLOYEE_COLLECTION = "employees";
const PROFILE_COLLECTION = "payrollEmployeeProfiles";
const PAYROLL_RUN_COLLECTION = "payrollRuns";

/* =========================================================
   HELPERS
========================================================= */

function toDate(value: Date | string): Date {
  if (value instanceof Date) {
    return value;
  }

  return new Date(value);
}

function daysBetween(
  start: string,
  end: string
): number {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    throw new Error("Invalid payroll period dates");
  }

  const diff =
    endDate.getTime() - startDate.getTime();

  return Math.floor(
    diff / (1000 * 60 * 60 * 24)
  ) + 1;
}

function roundMoney(value: number): number {
  return Math.round(
    (value + Number.EPSILON) * 100
  ) / 100;
}

/* =========================================================
   GET EMPLOYEE
========================================================= */

async function getEmployee(
  employeeId: string
): Promise<Employee | null> {
  const doc = await adminDb
    .collection(EMPLOYEE_COLLECTION)
    .doc(employeeId)
    .get();

  if (!doc.exists) {
    return null;
  }

  return {
    ...(doc.data() as Employee),
    id: doc.id,
  };
}

/* =========================================================
   GET PAYROLL PROFILE
========================================================= */

async function getPayrollProfile(
  employeeId: string
): Promise<EmployeePayrollProfile | null> {
  const doc = await adminDb
    .collection(PROFILE_COLLECTION)
    .doc(employeeId)
    .get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as EmployeePayrollProfile;
}

/* =========================================================
   CALCULATE BASIC SALARY
========================================================= */

function calculateBaseSalary(
  profile: EmployeePayrollProfile,
  workingDays: number,
  paidDays: number
): number {
  /*
   * MONTHLY
   *
   * Salary is prorated according to paid days.
   */
  if (
    profile.salaryType === "MONTHLY"
  ) {
    const monthlySalary =
      profile.monthlySalary ?? 0;

    if (workingDays <= 0) {
      return 0;
    }

    return roundMoney(
      (monthlySalary / workingDays) *
        paidDays
    );
  }

  /*
   * DAILY
   */
  if (
    profile.salaryType === "DAILY"
  ) {
    const dailyRate =
      profile.dailyRate ?? 0;

    return roundMoney(
      dailyRate * paidDays
    );
  }

  /*
   * HOURLY
   *
   * We don't calculate hourly salary here
   * because actual worked hours should come
   * from attendance/timesheet.
   *
   * For now this returns zero.
   */
  if (
    profile.salaryType === "HOURLY"
  ) {
    return 0;
  }

  return 0;
}

/* =========================================================
   CREATE BASIC EARNING
========================================================= */

function createBaseEarning(
  amount: number
): PayrollLineItem {
  return {
    componentId: "BASE_SALARY",
    code: "BASE_SALARY",
    name: "Base Salary",
    amount: roundMoney(amount),
    taxable: true,
  };
}

/* =========================================================
   CALCULATE ONE EMPLOYEE
========================================================= */

export async function calculateEmployeePayroll(
  payrollRunId: string,
  employeeId: string
): Promise<PayrollItem> {
  /*
   * -------------------------------------------------------
   * GET PAYROLL RUN
   * -------------------------------------------------------
   */

  const payrollRunDoc = await adminDb
    .collection(PAYROLL_RUN_COLLECTION)
    .doc(payrollRunId)
    .get();

  if (!payrollRunDoc.exists) {
    throw new Error(
      "Payroll run not found"
    );
  }

  const payrollRun =
    payrollRunDoc.data() as PayrollRun;

  /*
   * -------------------------------------------------------
   * GET EMPLOYEE
   * -------------------------------------------------------
   */

  const employee =
    await getEmployee(employeeId);

  if (!employee) {
    throw new Error(
      `Employee not found: ${employeeId}`
    );
  }

  /*
   * -------------------------------------------------------
   * ONLY ACTIVE EMPLOYEES
   * -------------------------------------------------------
   */

  if (employee.status !== "ACTIVE") {
    throw new Error(
      `Employee ${employee.employeeCode} is not active`
    );
  }

  /*
   * -------------------------------------------------------
   * GET PAYROLL PROFILE
   * -------------------------------------------------------
   */

  const profile =
    await getPayrollProfile(employeeId);

  if (!profile) {
    throw new Error(
      `Payroll profile not found for employee ${employee.employeeCode}`
    );
  }

  /*
   * -------------------------------------------------------
   * VALIDATE EFFECTIVE DATE
   * -------------------------------------------------------
   */

  const periodStart =
    new Date(
      `${payrollRun.periodStart}T00:00:00`
    );

  const periodEnd =
    new Date(
      `${payrollRun.periodEnd}T23:59:59`
    );

  const effectiveFrom =
    toDate(profile.effectiveFrom);

  if (
    effectiveFrom > periodEnd
  ) {
    throw new Error(
      `Payroll profile for ${employee.employeeCode} is not effective for this payroll period`
    );
  }

  if (
    profile.effectiveTo
  ) {
    const effectiveTo =
      toDate(profile.effectiveTo);

    if (
      effectiveTo < periodStart
    ) {
      throw new Error(
        `Payroll profile for ${employee.employeeCode} has expired`
      );
    }
  }

  /*
   * -------------------------------------------------------
   * WORKING DAYS
   * -------------------------------------------------------
   *
   * Attendance integration comes later.
   *
   * For now:
   *
   * workingDays = all calendar days
   * paidDays    = all calendar days
   * unpaidDays  = 0
   */

  const workingDays =
    daysBetween(
      payrollRun.periodStart,
      payrollRun.periodEnd
    );

  const paidDays =
    workingDays;

  const unpaidDays = 0;

  /*
   * -------------------------------------------------------
   * OVERTIME
   * -------------------------------------------------------
   *
   * Attendance/timesheet will provide this later.
   */

  const overtimeHours = 0;

  /*
   * -------------------------------------------------------
   * BASE SALARY
   * -------------------------------------------------------
   */

  const baseSalary =
    calculateBaseSalary(
      profile,
      workingDays,
      paidDays
    );

  /*
   * -------------------------------------------------------
   * EARNINGS
   * -------------------------------------------------------
   */

  const earnings: PayrollLineItem[] = [];

  if (baseSalary > 0) {
    earnings.push(
      createBaseEarning(
        baseSalary
      )
    );
  }

  /*
   * -------------------------------------------------------
   * OVERTIME
   * -------------------------------------------------------
   */

  if (
    overtimeHours > 0 &&
    profile.overtimeRate
  ) {
    const overtimeAmount =
      roundMoney(
        overtimeHours *
          profile.overtimeRate
      );

    earnings.push({
      componentId:
        "OVERTIME",
      code: "OVERTIME",
      name: "Overtime",
      amount: overtimeAmount,
      taxable: true,
    });
  }

  /*
   * -------------------------------------------------------
   * GROSS
   * -------------------------------------------------------
   */

  const grossAmount =
    roundMoney(
      earnings.reduce(
        (sum, item) =>
          sum + item.amount,
        0
      )
    );

  /*
   * -------------------------------------------------------
   * DEDUCTIONS
   * -------------------------------------------------------
   *
   * Tax / PF / insurance etc.
   * will be added when SalaryStructure
   * and tax components are connected.
   */

  const deductions: PayrollLineItem[] =
    [];

  const totalDeductions =
    roundMoney(
      deductions.reduce(
        (sum, item) =>
          sum + item.amount,
        0
      )
    );

  /*
   * -------------------------------------------------------
   * EMPLOYER CONTRIBUTIONS
   * -------------------------------------------------------
   */

  const employerContributions: PayrollLineItem[] =
    [];

  /*
   * -------------------------------------------------------
   * NET
   * -------------------------------------------------------
   */

  const netAmount =
    roundMoney(
      grossAmount -
        totalDeductions
    );

  /*
   * -------------------------------------------------------
   * EMPLOYEE NAME
   * -------------------------------------------------------
   */

  const employeeName = [
    employee.firstName,
    employee.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  /*
   * -------------------------------------------------------
   * PAYROLL ITEM
   * -------------------------------------------------------
   */

  const payrollItem: PayrollItem = {
    id: employeeId,

    payrollRunId,

    employeeId,

    employeeName,

    currency:
      payrollRun.currency,

    workingDays,

    paidDays,

    unpaidDays,

    overtimeHours,

    earnings,

    deductions,

    employerContributions,

    grossAmount,

    totalDeductions,

    netAmount,

    status: "PENDING",

    createdAt:
      new Date().toISOString(),
  };

  /*
   * -------------------------------------------------------
   * SAVE
   * -------------------------------------------------------
   */

  await adminDb
    .collection(PAYROLL_RUN_COLLECTION)
    .doc(payrollRunId)
    .collection("items")
    .doc(employeeId)
    .set(
      payrollItem,
      { merge: true }
    );

  return payrollItem;
}

/* =========================================================
   CALCULATE ENTIRE PAYROLL RUN
========================================================= */

export async function calculatePayrollRun(
  payrollRunId: string
): Promise<{
  employeeCount: number;
  grossAmount: number;
  totalDeductions: number;
  employerContributions: number;
  netAmount: number;
}> {
  /*
   * -------------------------------------------------------
   * GET PAYROLL RUN
   * -------------------------------------------------------
   */

  const payrollRunRef = adminDb
    .collection(PAYROLL_RUN_COLLECTION)
    .doc(payrollRunId);

  const payrollRunDoc =
    await payrollRunRef.get();

  if (!payrollRunDoc.exists) {
    throw new Error(
      "Payroll run not found"
    );
  }

  const payrollRun =
    payrollRunDoc.data() as PayrollRun;

  /*
   * -------------------------------------------------------
   * ONLY DRAFT / CALCULATING
   * -------------------------------------------------------
   */

  if (
    payrollRun.status !== "DRAFT" &&
    payrollRun.status !== "CALCULATING"
  ) {
    throw new Error(
      `Payroll run cannot be calculated from status ${payrollRun.status}`
    );
  }

  /*
   * -------------------------------------------------------
   * MARK CALCULATING
   * -------------------------------------------------------
   */

  await payrollRunRef.update({
    status: "CALCULATING",
    updatedAt:
      new Date().toISOString(),
  });

  /*
   * -------------------------------------------------------
   * GET ACTIVE EMPLOYEES
   * -------------------------------------------------------
   */

  const employeeSnapshot =
    await adminDb
      .collection(EMPLOYEE_COLLECTION)
      .where(
        "status",
        "==",
        "ACTIVE"
      )
      .get();

  let employeeCount = 0;

  let grossAmount = 0;

  let totalDeductions = 0;

  let employerContributions = 0;

  let netAmount = 0;

  /*
   * -------------------------------------------------------
   * CALCULATE EACH EMPLOYEE
   * -------------------------------------------------------
   */

  for (
    const employeeDoc of
      employeeSnapshot.docs
  ) {
    const employee =
      employeeDoc.data() as Employee;

    try {
      const item =
        await calculateEmployeePayroll(
          payrollRunId,
          employeeDoc.id
        );

      employeeCount++;

      grossAmount +=
        item.grossAmount;

      totalDeductions +=
        item.totalDeductions;

      employerContributions +=
        item.employerContributions.reduce(
          (sum, contribution) =>
            sum + contribution.amount,
          0
        );

      netAmount +=
        item.netAmount;
    } catch (error) {
      /*
       * Do not silently ignore payroll
       * calculation errors.
       *
       * The entire payroll run goes back
       * to REVIEW only when all employees
       * calculate successfully.
       */

      await payrollRunRef.update({
        status: "DRAFT",
        updatedAt:
          new Date().toISOString(),
      });

      throw new Error(
        `Payroll calculation failed for ${employee.employeeCode}: ${
          error instanceof Error
            ? error.message
            : "Unknown error"
        }`
      );
    }
  }

  /*
   * -------------------------------------------------------
   * ROUND TOTALS
   * -------------------------------------------------------
   */

  grossAmount =
    roundMoney(grossAmount);

  totalDeductions =
    roundMoney(totalDeductions);

  employerContributions =
    roundMoney(
      employerContributions
    );

  netAmount =
    roundMoney(netAmount);

  /*
   * -------------------------------------------------------
   * UPDATE PAYROLL RUN
   * -------------------------------------------------------
   */

  await payrollRunRef.update({
    status: "REVIEW",

    employeeCount,

    grossAmount,

    totalDeductions,

    employerContributions,

    netAmount,

    updatedAt:
      new Date().toISOString(),
  });

  return {
    employeeCount,
    grossAmount,
    totalDeductions,
    employerContributions,
    netAmount,
  };
}