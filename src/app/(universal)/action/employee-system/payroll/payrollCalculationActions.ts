"use server";

import { adminDb } from "@/lib/firebaseAdmin";

import { Employee } from "@/lib/types/payroll/EmployeeTypes";
import { EmployeePayrollProfile } from "@/lib/types/payroll/EmployeePayrollProfile";
import {
  PayrollItem,
  PayrollLineItem,
} from "@/lib/types/payroll/PayrollItem";
import { PayrollRun } from "@/lib/types/payroll/PayrollRun";

import { getEmployeeAttendance } from "@/app/(universal)/action/employee-system/attendance/attendanceActions";

const EMPLOYEE_COLLECTION = "employees";
const PROFILE_COLLECTION = "payrollEmployeeProfiles";
const PAYROLL_RUN_COLLECTION = "payrollRuns";

function toDate(value: Date | string): Date {
  if (value instanceof Date) return value;
  return new Date(value);
}

/**
 * Current factory rule:
 *
 * Every day Monday-Sunday is normally a working day.
 *
 * Later, weekly-off configuration can be added here.
 */
function daysBetween(start: string, end: string): number {
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

  return (
    Math.floor(diff / (1000 * 60 * 60 * 24)) + 1
  );
}

/**
 * Calculate actual working days for the payroll period.
 *
 * Rules:
 *
 * - Every day is normally a working day.
 * - Employee.weeklyOffDays removes the employee's normal weekly offs.
 * - Explicit HOLIDAY removes that date.
 * - Explicit WEEK_OFF removes that date.
 * - Missing attendance does NOT mean ABSENT.
 *
 * Day numbers:
 * 0 = Sunday
 * 1 = Monday
 * 2 = Tuesday
 * 3 = Wednesday
 * 4 = Thursday
 * 5 = Friday
 * 6 = Saturday
 */
// function calculateActualWorkingDays(
//   periodStart: string,
//   periodEnd: string,
//   weeklyOffDays: number[],
//   attendance: {
//     date: string;
//     status:
//       | "PRESENT"
//       | "ABSENT"
//       | "HALF_DAY"
//       | "LEAVE"
//       | "HOLIDAY"
//       | "WEEK_OFF";
//   }[]
// ): number {
//   const startDate = new Date(
//     `${periodStart}T00:00:00`
//   );

//   const endDate = new Date(
//     `${periodEnd}T00:00:00`
//   );

//   if (
//     Number.isNaN(startDate.getTime()) ||
//     Number.isNaN(endDate.getTime())
//   ) {
//     throw new Error(
//       "Invalid payroll period dates"
//     );
//   }

//   if (startDate > endDate) {
//     throw new Error(
//       "Payroll period start date cannot be after end date"
//     );
//   }

//   // =========================================================
//   // NORMALIZE WEEKLY OFF DAYS
//   // =========================================================
//   //
//   // Remove invalid values and duplicates.
//   //
//   const normalizedWeeklyOffDays = new Set(
//     weeklyOffDays.filter(
//       (day) =>
//         Number.isInteger(day) &&
//         day >= 0 &&
//         day <= 6
//     )
//   );

//   // =========================================================
//   // EXPLICIT ATTENDANCE EXCEPTIONS
//   // =========================================================
//   //
//   // These dates are excluded from working days.
//   //
//   const excludedDates = new Set<string>();

//   for (const record of attendance) {
//     if (
//       record.status === "HOLIDAY" ||
//       record.status === "WEEK_OFF"
//     ) {
//       excludedDates.add(record.date);
//     }
//   }

//   // =========================================================
//   // COUNT WORKING DAYS
//   // =========================================================

//   let workingDays = 0;

//   const currentDate = new Date(startDate);

//   while (currentDate <= endDate) {
//     const dateString =
//       currentDate.toISOString().slice(0, 10);

//     const dayOfWeek =
//       currentDate.getDay();

//     // -------------------------------------------------------
//     // Employee's normal weekly off
//     // -------------------------------------------------------

//     if (
//       normalizedWeeklyOffDays.has(
//         dayOfWeek
//       )
//     ) {
//       currentDate.setDate(
//         currentDate.getDate() + 1
//       );

//       continue;
//     }

//     // -------------------------------------------------------
//     // Explicit HOLIDAY / WEEK_OFF attendance
//     // -------------------------------------------------------

//     if (
//       excludedDates.has(dateString)
//     ) {
//       currentDate.setDate(
//         currentDate.getDate() + 1
//       );

//       continue;
//     }

//     // -------------------------------------------------------
//     // Normal working day
//     //
//     // This includes:
//     // PRESENT
//     // ABSENT
//     // HALF_DAY
//     // LEAVE
//     //
//     // It also includes days with NO attendance record.
//     // -------------------------------------------------------

//     workingDays++;

//     currentDate.setDate(
//       currentDate.getDate() + 1
//     );
//   }

//   return workingDays;
// }


/**
 * Calculate actual working days for the payroll period.
 *
 * Rules:
 *
 * - Every calendar day is normally a working day.
 * - Employee.weeklyOffDays removes normal weekly offs.
 * - PRESENT overrides a weekly off and counts as a working day.
 * - HALF_DAY overrides a weekly off and counts as a working day.
 * - ABSENT overrides a weekly off and counts as a working day.
 * - LEAVE does not override a weekly off.
 * - HOLIDAY always excludes the date.
 * - WEEK_OFF always excludes the date.
 * - Missing attendance does NOT mean ABSENT.
 *
 * Day numbers:
 * 0 = Sunday
 * 1 = Monday
 * 2 = Tuesday
 * 3 = Wednesday
 * 4 = Thursday
 * 5 = Friday
 * 6 = Saturday
 */
function calculateActualWorkingDays(
  periodStart: string,
  periodEnd: string,
  weeklyOffDays: number[],
  attendance: {
    date: string;
    status:
      | "PRESENT"
      | "ABSENT"
      | "HALF_DAY"
      | "LEAVE"
      | "HOLIDAY"
      | "WEEK_OFF";
  }[]
): number {
  const startDate = new Date(
    `${periodStart}T00:00:00`
  );

  const endDate = new Date(
    `${periodEnd}T00:00:00`
  );

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    throw new Error(
      "Invalid payroll period dates"
    );
  }

  if (startDate > endDate) {
    throw new Error(
      "Payroll period start date cannot be after end date"
    );
  }

  const normalizedWeeklyOffDays = new Set(
    (weeklyOffDays ?? []).filter(
      (day) =>
        Number.isInteger(day) &&
        day >= 0 &&
        day <= 6
    )
  );

  const attendanceByDate = new Map(
    attendance.map((record) => [
      record.date,
      record,
    ])
  );

  let workingDays = 0;

  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateString =
      currentDate.toISOString().slice(0, 10);

    const dayOfWeek =
      currentDate.getDay();

    const record =
      attendanceByDate.get(dateString);

    // Explicit attendance always has priority.
    if (record) {
      if (
        record.status === "HOLIDAY" ||
        record.status === "WEEK_OFF"
      ) {
        currentDate.setDate(
          currentDate.getDate() + 1
        );

        continue;
      }

      if (
        record.status === "PRESENT" ||
        record.status === "HALF_DAY" ||
        record.status === "ABSENT"
      ) {
        workingDays++;

        currentDate.setDate(
          currentDate.getDate() + 1
        );

        continue;
      }

      // LEAVE on a normal working day still
      // counts as a working day for the denominator.
      if (record.status === "LEAVE") {
        if (
          !normalizedWeeklyOffDays.has(
            dayOfWeek
          )
        ) {
          workingDays++;
        }

        currentDate.setDate(
          currentDate.getDate() + 1
        );

        continue;
      }
    }

    // No attendance record:
    // employee's configured weekly off applies.
    if (
      normalizedWeeklyOffDays.has(
        dayOfWeek
      )
    ) {
      currentDate.setDate(
        currentDate.getDate() + 1
      );

      continue;
    }

    // Normal working day with no attendance.
    workingDays++;

    currentDate.setDate(
      currentDate.getDate() + 1
    );
  }

  return workingDays;
}


/**
 * Calculate paid and unpaid days from attendance.
 *
 * Rules:
 *
 * PRESENT  = 1 paid
 * HALF_DAY = 0.5 paid + 0.5 unpaid
 * ABSENT   = 0 paid + 1 unpaid
 * LEAVE    = 1 paid
 * HOLIDAY  = excluded
 * WEEK_OFF = excluded
 *
 * Missing attendance:
 * - does NOT become ABSENT
 * - does NOT create unpaid days
 *
 * Weekly offs:
 * - normally excluded
 * - but PRESENT / HALF_DAY / ABSENT attendance
 *   explicitly recorded on that day overrides the weekly off.
 */
function calculatePaidAndUnpaidDays(
  periodStart: string,
  periodEnd: string,
  weeklyOffDays: number[],
  attendance: {
    date: string;
    status:
      | "PRESENT"
      | "ABSENT"
      | "HALF_DAY"
      | "LEAVE"
      | "HOLIDAY"
      | "WEEK_OFF";
  }[]
): {
  paidDays: number;
  unpaidDays: number;
} {
  const startDate = new Date(
    `${periodStart}T00:00:00`
  );

  const endDate = new Date(
    `${periodEnd}T00:00:00`
  );

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    throw new Error(
      "Invalid payroll period dates"
    );
  }

  if (startDate > endDate) {
    throw new Error(
      "Payroll period start date cannot be after end date"
    );
  }

  const normalizedWeeklyOffDays = new Set(
    (weeklyOffDays ?? []).filter(
      (day) =>
        Number.isInteger(day) &&
        day >= 0 &&
        day <= 6
    )
  );

  const attendanceByDate = new Map(
    attendance.map((record) => [
      record.date,
      record,
    ])
  );

  let paidDays = 0;
  let unpaidDays = 0;

  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateString =
      currentDate.toISOString().slice(0, 10);

    const dayOfWeek =
      currentDate.getDay();

    const record =
      attendanceByDate.get(dateString);

    if (record) {
      switch (record.status) {
        case "PRESENT":
          // Explicitly worked, even on weekly off.
          paidDays += 1;
          break;

        case "HALF_DAY":
          // Explicitly worked, even on weekly off.
          paidDays += 0.5;
          unpaidDays += 0.5;
          break;

        case "ABSENT":
          // Explicit absence is unpaid,
          // even if it was a configured weekly off.
          unpaidDays += 1;
          break;

        case "LEAVE":
          // Leave is paid only when it falls
          // on a normal working day.
          if (
            !normalizedWeeklyOffDays.has(
              dayOfWeek
            )
          ) {
            paidDays += 1;
          }
          break;

        case "HOLIDAY":
        case "WEEK_OFF":
          // Excluded completely.
          break;
      }

      currentDate.setDate(
        currentDate.getDate() + 1
      );

      continue;
    }

    // Missing attendance:
    // never treat it as absent.
    //
    // If it is a configured weekly off,
    // it is simply excluded.
    if (
      normalizedWeeklyOffDays.has(
        dayOfWeek
      )
    ) {
      currentDate.setDate(
        currentDate.getDate() + 1
      );

      continue;
    }

    // Normal working day with no attendance.
    // No paid or unpaid day is added.
    currentDate.setDate(
      currentDate.getDate() + 1
    );
  }

  return {
    paidDays,
    unpaidDays,
  };
}


function roundMoney(value: number): number {
  return Math.round(
    (value + Number.EPSILON) * 100
  ) / 100;
}

async function getEmployee(
  employeeId: string
): Promise<Employee | null> {
  const doc = await adminDb
    .collection(EMPLOYEE_COLLECTION)
    .doc(employeeId)
    .get();

  if (!doc.exists) return null;

  return {
    ...(doc.data() as Employee),
    id: doc.id,
  };
}

async function getPayrollProfile(
  employeeId: string
): Promise<EmployeePayrollProfile | null> {
  const doc = await adminDb
    .collection(PROFILE_COLLECTION)
    .doc(employeeId)
    .get();

  if (!doc.exists) return null;

  return doc.data() as EmployeePayrollProfile;
}

/**
 * Calculate paid and unpaid days from attendance.
 *
 * PRESENT = 1 paid
 * HALF_DAY = 0.5 paid + 0.5 unpaid
 * ABSENT = 0 paid + 1 unpaid
 * LEAVE = 1 paid
 * HOLIDAY = excluded
 * WEEK_OFF = excluded
 *
 * Missing attendance is ignored.
 */
function calculateAttendanceDays(
  attendance: {
    status:
      | "PRESENT"
      | "ABSENT"
      | "HALF_DAY"
      | "LEAVE"
      | "HOLIDAY"
      | "WEEK_OFF";
  }[]
): {
  paidDays: number;
  unpaidDays: number;
} {
  let paidDays = 0;
  let unpaidDays = 0;

  for (const record of attendance) {
    switch (record.status) {
      case "PRESENT":
        paidDays += 1;
        break;

      case "HALF_DAY":
        paidDays += 0.5;
        unpaidDays += 0.5;
        break;

      case "ABSENT":
        unpaidDays += 1;
        break;

      case "LEAVE":
        paidDays += 1;
        break;

      case "HOLIDAY":
      case "WEEK_OFF":
        break;
    }
  }

  return {
    paidDays,
    unpaidDays,
  };
}

/**
 * Sum attendance overtime.
 */
function calculateOvertimeHours(
  attendance: {
    overtimeHours?: number;
  }[]
): number {
  return roundMoney(
    attendance.reduce(
      (sum, record) =>
        sum + (record.overtimeHours ?? 0),
      0
    )
  );
}

/**
 * Sum actual working hours.
 *
 * Used for HOURLY employees.
 */
function calculateWorkingHours(
  attendance: {
    workingHours?: number;
  }[]
): number {
  return roundMoney(
    attendance.reduce(
      (sum, record) =>
        sum + (record.workingHours ?? 0),
      0
    )
  );
}

function calculateBaseSalary(
  profile: EmployeePayrollProfile,
  workingDays: number,
  paidDays: number,
  workingHours: number
): number {
  /**
   * MONTHLY
   *
   * Monthly salary is divided by actual working days
   * in this payroll period.
   */
  if (profile.salaryType === "MONTHLY") {
    const monthlySalary =
      profile.monthlySalary ?? 0;

    if (workingDays <= 0) {
      return 0;
    }

    return roundMoney(
      (monthlySalary / workingDays) * paidDays
    );
  }

  /**
   * DAILY
   */
  if (profile.salaryType === "DAILY") {
    const dailyRate =
      profile.dailyRate ?? 0;

    return roundMoney(
      dailyRate * paidDays
    );
  }

  /**
   * HOURLY
   */
  if (profile.salaryType === "HOURLY") {
    const hourlyRate =
      profile.hourlyRate ?? 0;

    return roundMoney(
      hourlyRate * workingHours
    );
  }

  return 0;
}

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

export async function calculateEmployeePayroll(
  payrollRunId: string,
  employeeId: string
): Promise<PayrollItem> {
  // =========================================================
  // PAYROLL RUN
  // =========================================================

  const payrollRunDoc = await adminDb
    .collection(PAYROLL_RUN_COLLECTION)
    .doc(payrollRunId)
    .get();

  if (!payrollRunDoc.exists) {
    throw new Error("Payroll run not found");
  }

  const payrollRun =
    payrollRunDoc.data() as PayrollRun;

  // =========================================================
  // EMPLOYEE
  // =========================================================

  const employee =
    await getEmployee(employeeId);

  if (!employee) {
    throw new Error(
      `Employee not found: ${employeeId}`
    );
  }

  if (employee.status !== "ACTIVE") {
    throw new Error(
      `Employee ${employee.employeeCode} is not active`
    );
  }

  // =========================================================
  // PAYROLL PROFILE
  // =========================================================

  const profile =
    await getPayrollProfile(employeeId);

  if (!profile) {
    throw new Error(
      `Payroll profile not found for employee ${employee.employeeCode}`
    );
  }

  // =========================================================
  // PROFILE EFFECTIVE DATE
  // =========================================================

  const periodStart = new Date(
    `${payrollRun.periodStart}T00:00:00`
  );

  const periodEnd = new Date(
    `${payrollRun.periodEnd}T23:59:59`
  );

  const effectiveFrom =
    toDate(profile.effectiveFrom);

  if (effectiveFrom > periodEnd) {
    throw new Error(
      `Payroll profile for ${employee.employeeCode} is not effective for this payroll period`
    );
  }

  if (profile.effectiveTo) {
    const effectiveTo =
      toDate(profile.effectiveTo);

    if (effectiveTo < periodStart) {
      throw new Error(
        `Payroll profile for ${employee.employeeCode} has expired`
      );
    }
  }

  // =========================================================
  // ATTENDANCE
  // =========================================================

  const attendance =
    await getEmployeeAttendance(
      employeeId,
      payrollRun.periodStart,
      payrollRun.periodEnd
    );

  // =========================================================
  // WORKING DAYS
  // =========================================================
  //
  // Current factory rule:
  //
  // Every day = working day
  //
  // Only explicit:
  //   HOLIDAY
  //   WEEK_OFF
  //
  // are removed.
  //
  // Missing attendance does NOT remove the day.
  //
  // Example:
  //
  // June 1 - June 30 = 30 days
  // 2 HOLIDAY
  // 1 WEEK_OFF
  // workingDays = 27
  //
  // =========================================================

  // const workingDays =
  // calculateActualWorkingDays(
  //   payrollRun.periodStart,
  //   payrollRun.periodEnd,
  //   employee.weeklyOffDays ?? [],
  //   attendance
  // );

  const workingDays =
  calculateActualWorkingDays(
    payrollRun.periodStart,
    payrollRun.periodEnd,
    employee.weeklyOffDays ?? [],
    attendance
  );

const {
  paidDays,
  unpaidDays,
} =
  calculatePaidAndUnpaidDays(
    payrollRun.periodStart,
    payrollRun.periodEnd,
    employee.weeklyOffDays ?? [],
    attendance
  );

  // =========================================================
  // PAID / UNPAID DAYS
  // =========================================================

  // const {
  //   paidDays,
  //   unpaidDays,
  // } = calculateAttendanceDays(
  //   attendance
  // );

  // =========================================================
  // OVERTIME
  // =========================================================

  const overtimeHours =
    calculateOvertimeHours(
      attendance
    );

  // =========================================================
  // ACTUAL WORKING HOURS
  // =========================================================

  const workingHours =
    calculateWorkingHours(
      attendance
    );

  // =========================================================
  // BASE SALARY
  // =========================================================

  const baseSalary =
    calculateBaseSalary(
      profile,
      workingDays,
      paidDays,
      workingHours
    );

  // =========================================================
  // EARNINGS
  // =========================================================

  const earnings: PayrollLineItem[] = [];

  if (baseSalary > 0) {
    earnings.push(
      createBaseEarning(baseSalary)
    );
  }

  // =========================================================
  // OVERTIME
  // =========================================================

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
      componentId: "OVERTIME",
      code: "OVERTIME",
      name: "Overtime",
      amount: overtimeAmount,
      taxable: true,
    });
  }

  // =========================================================
  // GROSS
  // =========================================================

  const grossAmount =
    roundMoney(
      earnings.reduce(
        (sum, item) =>
          sum + item.amount,
        0
      )
    );

  // =========================================================
  // DEDUCTIONS
  // =========================================================

  const deductions: PayrollLineItem[] = [];

  const totalDeductions =
    roundMoney(
      deductions.reduce(
        (sum, item) =>
          sum + item.amount,
        0
      )
    );

  // =========================================================
  // EMPLOYER CONTRIBUTIONS
  // =========================================================

  const employerContributions: PayrollLineItem[] =
    [];

  const employerContributionTotal =
    roundMoney(
      employerContributions.reduce(
        (sum, item) =>
          sum + item.amount,
        0
      )
    );

  // =========================================================
  // NET
  // =========================================================

  const netAmount =
    roundMoney(
      grossAmount -
        totalDeductions
    );

  // =========================================================
  // EMPLOYEE NAME
  // =========================================================

  const employeeName = [
    employee.firstName,
    employee.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  // =========================================================
  // PAYROLL ITEM
  // =========================================================

  const payrollItem: PayrollItem = {
    id: employeeId,
    payrollRunId,
    employeeId,
    employeeName,
    currency: payrollRun.currency,

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

  // =========================================================
  // SAVE PAYROLL ITEM
  // =========================================================

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

export async function calculatePayrollRun(
  payrollRunId: string
): Promise<{
  employeeCount: number;
  grossAmount: number;
  totalDeductions: number;
  employerContributions: number;
  netAmount: number;
}> {
  // =========================================================
  // PAYROLL RUN
  // =========================================================

  const payrollRunRef =
    adminDb
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

  if (
    payrollRun.status !== "DRAFT" &&
    payrollRun.status !== "CALCULATING"
  ) {
    throw new Error(
      `Payroll run cannot be calculated from status ${payrollRun.status}`
    );
  }

  // =========================================================
  // START CALCULATION
  // =========================================================

  await payrollRunRef.update({
    status: "CALCULATING",
    updatedAt:
      new Date().toISOString(),
  });

  // =========================================================
  // ACTIVE EMPLOYEES
  // =========================================================

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

  // =========================================================
  // CALCULATE EACH EMPLOYEE
  // =========================================================

  for (
    const employeeDoc of employeeSnapshot.docs
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
      // =====================================================
      // RESET TO DRAFT IF ANY EMPLOYEE FAILS
      // =====================================================

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

  // =========================================================
  // ROUND TOTALS
  // =========================================================

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

  // =========================================================
  // UPDATE PAYROLL RUN
  // =========================================================

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




// "use server";

// import { adminDb } from "@/lib/firebaseAdmin";

// import { Employee } from "@/lib/types/payroll/EmployeeTypes";
// import { EmployeePayrollProfile } from "@/lib/types/payroll/EmployeePayrollProfile";
// import {
//   PayrollItem,
//   PayrollLineItem,
// } from "@/lib/types/payroll/PayrollItem";
// import { PayrollRun } from "@/lib/types/payroll/PayrollRun";

// import { getEmployeeAttendance } from "@/app/(universal)/action/employee-system/attendance/attendanceActions";

// const EMPLOYEE_COLLECTION = "employees";
// const PROFILE_COLLECTION = "payrollEmployeeProfiles";
// const PAYROLL_RUN_COLLECTION = "payrollRuns";

// /* =========================================================
//    HELPERS
// ========================================================= */

// function toDate(value: Date | string): Date {
//   if (value instanceof Date) {
//     return value;
//   }

//   return new Date(value);
// }

// function daysBetween(
//   start: string,
//   end: string
// ): number {
//   const startDate = new Date(`${start}T00:00:00`);
//   const endDate = new Date(`${end}T00:00:00`);

//   if (
//     Number.isNaN(startDate.getTime()) ||
//     Number.isNaN(endDate.getTime())
//   ) {
//     throw new Error("Invalid payroll period dates");
//   }

//   const diff =
//     endDate.getTime() - startDate.getTime();

//   return (
//     Math.floor(
//       diff / (1000 * 60 * 60 * 24)
//     ) + 1
//   );
// }

// /* =========================================================
//    ACTUAL WORKING DAYS
// ========================================================= */

// /**
//  * Calculates the normal working days in the payroll period.
//  *
//  * Current rule:
//  *
//  * Monday    = working day
//  * Tuesday   = working day
//  * Wednesday = working day
//  * Thursday  = working day
//  * Friday    = working day
//  * Saturday  = weekly off
//  * Sunday    = weekly off
//  *
//  * Attendance is NOT used to determine this denominator.
//  *
//  * Attendance determines paid/unpaid days.
//  */
// function calculateActualWorkingDays(
//   start: string,
//   end: string
// ): number {
//   const startDate = new Date(
//     `${start}T00:00:00`
//   );

//   const endDate = new Date(
//     `${end}T00:00:00`
//   );

//   if (
//     Number.isNaN(startDate.getTime()) ||
//     Number.isNaN(endDate.getTime())
//   ) {
//     throw new Error(
//       "Invalid payroll period dates"
//     );
//   }

//   if (startDate > endDate) {
//     throw new Error(
//       "Payroll period start date cannot be after end date"
//     );
//   }

//   let workingDays = 0;

//   const current = new Date(startDate);

//   while (current <= endDate) {
//     const dayOfWeek =
//       current.getDay();

//     /*
//      * JavaScript:
//      *
//      * 0 = Sunday
//      * 1 = Monday
//      * ...
//      * 6 = Saturday
//      */

//     if (
//       dayOfWeek !== 0 &&
//       dayOfWeek !== 6
//     ) {
//       workingDays++;
//     }

//     current.setDate(
//       current.getDate() + 1
//     );
//   }

//   return workingDays;
// }

// function roundMoney(value: number): number {
//   return Math.round(
//     (value + Number.EPSILON) * 100
//   ) / 100;
// }

// /* =========================================================
//    GET EMPLOYEE
// ========================================================= */

// async function getEmployee(
//   employeeId: string
// ): Promise<Employee | null> {
//   const doc = await adminDb
//     .collection(EMPLOYEE_COLLECTION)
//     .doc(employeeId)
//     .get();

//   if (!doc.exists) {
//     return null;
//   }

//   return {
//     ...(doc.data() as Employee),
//     id: doc.id,
//   };
// }

// /* =========================================================
//    GET PAYROLL PROFILE
// ========================================================= */

// async function getPayrollProfile(
//   employeeId: string
// ): Promise<EmployeePayrollProfile | null> {
//   const doc = await adminDb
//     .collection(PROFILE_COLLECTION)
//     .doc(employeeId)
//     .get();

//   if (!doc.exists) {
//     return null;
//   }

//   return doc.data() as EmployeePayrollProfile;
// }

// /* =========================================================
//    CALCULATE BASIC SALARY
// ========================================================= */

// /**
//  * Monthly salary:
//  *
//  * monthly salary
//  * -------------------------- × paid days
//  * actual working days
//  *
//  * IMPORTANT:
//  *
//  * workingDays here means the actual working
//  * days in the payroll period, NOT the number
//  * of attendance records.
//  */
// function calculateBaseSalary(
//   profile: EmployeePayrollProfile,
//   workingDays: number,
//   paidDays: number
// ): number {
//   /*
//    * -------------------------------------------------------
//    * MONTHLY
//    * -------------------------------------------------------
//    */

//   if (
//     profile.salaryType === "MONTHLY"
//   ) {
//     const monthlySalary =
//       profile.monthlySalary ?? 0;

//     if (workingDays <= 0) {
//       return 0;
//     }

//     return roundMoney(
//       (monthlySalary / workingDays) *
//         paidDays
//     );
//   }

//   /*
//    * -------------------------------------------------------
//    * DAILY
//    * -------------------------------------------------------
//    */

//   if (
//     profile.salaryType === "DAILY"
//   ) {
//     const dailyRate =
//       profile.dailyRate ?? 0;

//     return roundMoney(
//       dailyRate * paidDays
//     );
//   }

//   /*
//    * -------------------------------------------------------
//    * HOURLY
//    * -------------------------------------------------------
//    *
//    * Hourly salary is calculated from
//    * attendance working hours.
//    *
//    * This is handled separately by
//    * calculateHourlySalary().
//    */

//   if (
//     profile.salaryType === "HOURLY"
//   ) {
//     return 0;
//   }

//   return 0;
// }

// /* =========================================================
//    CALCULATE HOURLY SALARY
// ========================================================= */

// function calculateHourlySalary(
//   profile: EmployeePayrollProfile,
//   totalWorkingHours: number
// ): number {
//   if (
//     profile.salaryType !== "HOURLY"
//   ) {
//     return 0;
//   }

//   const hourlyRate =
//     profile.hourlyRate ?? 0;

//   if (
//     hourlyRate <= 0 ||
//     totalWorkingHours <= 0
//   ) {
//     return 0;
//   }

//   return roundMoney(
//     hourlyRate * totalWorkingHours
//   );
// }

// /* =========================================================
//    CREATE BASE EARNING
// ========================================================= */

// function createBaseEarning(
//   amount: number
// ): PayrollLineItem {
//   return {
//     componentId: "BASE_SALARY",
//     code: "BASE_SALARY",
//     name: "Base Salary",
//     amount: roundMoney(amount),
//     taxable: true,
//   };
// }

// /* =========================================================
//    CALCULATE ONE EMPLOYEE
// ========================================================= */

// export async function calculateEmployeePayroll(
//   payrollRunId: string,
//   employeeId: string
// ): Promise<PayrollItem> {
//   /*
//    * -------------------------------------------------------
//    * GET PAYROLL RUN
//    * -------------------------------------------------------
//    */

//   const payrollRunDoc = await adminDb
//     .collection(PAYROLL_RUN_COLLECTION)
//     .doc(payrollRunId)
//     .get();

//   if (!payrollRunDoc.exists) {
//     throw new Error(
//       "Payroll run not found"
//     );
//   }

//   const payrollRun =
//     payrollRunDoc.data() as PayrollRun;

//   /*
//    * -------------------------------------------------------
//    * GET EMPLOYEE
//    * -------------------------------------------------------
//    */

//   const employee =
//     await getEmployee(employeeId);

//   if (!employee) {
//     throw new Error(
//       `Employee not found: ${employeeId}`
//     );
//   }

//   /*
//    * -------------------------------------------------------
//    * ONLY ACTIVE EMPLOYEES
//    * -------------------------------------------------------
//    */

//   if (
//     employee.status !== "ACTIVE"
//   ) {
//     throw new Error(
//       `Employee ${employee.employeeCode} is not active`
//     );
//   }

//   /*
//    * -------------------------------------------------------
//    * GET PAYROLL PROFILE
//    * -------------------------------------------------------
//    */

//   const profile =
//     await getPayrollProfile(employeeId);

//   if (!profile) {
//     throw new Error(
//       `Payroll profile not found for employee ${employee.employeeCode}`
//     );
//   }

//   /*
//    * -------------------------------------------------------
//    * VALIDATE EFFECTIVE DATE
//    * -------------------------------------------------------
//    */

//   const periodStart =
//     new Date(
//       `${payrollRun.periodStart}T00:00:00`
//     );

//   const periodEnd =
//     new Date(
//       `${payrollRun.periodEnd}T23:59:59`
//     );

//   const effectiveFrom =
//     toDate(profile.effectiveFrom);

//   if (
//     effectiveFrom > periodEnd
//   ) {
//     throw new Error(
//       `Payroll profile for ${employee.employeeCode} is not effective for this payroll period`
//     );
//   }

//   if (
//     profile.effectiveTo
//   ) {
//     const effectiveTo =
//       toDate(profile.effectiveTo);

//     if (
//       effectiveTo < periodStart
//     ) {
//       throw new Error(
//         `Payroll profile for ${employee.employeeCode} has expired`
//       );
//     }
//   }

//   /*
//    * -------------------------------------------------------
//    * ACTUAL WORKING DAYS
//    * -------------------------------------------------------
//    *
//    * This is the denominator for monthly salary.
//    *
//    * Example:
//    *
//    * September:
//    * 30 calendar days
//    * 4 Saturdays
//    * 4 Sundays
//    *
//    * Actual working days = 22
//    *
//    * Attendance records do NOT determine
//    * this denominator.
//    */

//   const workingDays =
//     calculateActualWorkingDays(
//       payrollRun.periodStart,
//       payrollRun.periodEnd
//     );

//   /*
//    * -------------------------------------------------------
//    * GET ATTENDANCE
//    * -------------------------------------------------------
//    *
//    * OPTION A:
//    *
//    * Missing attendance record does NOT mean
//    * ABSENT.
//    *
//    * We only calculate from attendance records
//    * that actually exist.
//    */

//   const attendance =
//     await getEmployeeAttendance(
//       employeeId,
//       payrollRun.periodStart,
//       payrollRun.periodEnd
//     );

//   /*
//    * -------------------------------------------------------
//    * ATTENDANCE CALCULATION
//    * -------------------------------------------------------
//    */

//   let paidDays = 0;

//   let unpaidDays = 0;

//   let overtimeHours = 0;

//   let totalWorkingHours = 0;

//   for (
//     const record of attendance
//   ) {
//     /*
//      * -----------------------------------------------------
//      * OVERTIME
//      * -----------------------------------------------------
//      */

//     overtimeHours +=
//       record.overtimeHours ?? 0;

//     /*
//      * -----------------------------------------------------
//      * ACTUAL WORKING HOURS
//      * -----------------------------------------------------
//      *
//      * Used for HOURLY employees.
//      */

//     totalWorkingHours +=
//       record.workingHours ?? 0;

//     /*
//      * -----------------------------------------------------
//      * PAID / UNPAID DAYS
//      * -----------------------------------------------------
//      */

//     switch (
//       record.status
//     ) {
//       case "PRESENT":
//         paidDays += 1;
//         break;

//       case "HALF_DAY":
//         paidDays += 0.5;
//         unpaidDays += 0.5;
//         break;

//       case "ABSENT":
//         unpaidDays += 1;
//         break;

//       case "LEAVE":
//         paidDays += 1;
//         break;

//       case "HOLIDAY":
//         /*
//          * Holiday does not consume
//          * an employee's paid working day.
//          *
//          * No paid/unpaid day added.
//          */
//         break;

//       case "WEEK_OFF":
//         /*
//          * Weekly off does not consume
//          * an employee's paid working day.
//          *
//          * No paid/unpaid day added.
//          */
//         break;

//       default:
//         break;
//     }
//   }

//   /*
//    * -------------------------------------------------------
//    * ROUND ATTENDANCE VALUES
//    * -------------------------------------------------------
//    */

//   paidDays =
//     roundMoney(paidDays);

//   unpaidDays =
//     roundMoney(unpaidDays);

//   overtimeHours =
//     roundMoney(overtimeHours);

//   totalWorkingHours =
//     roundMoney(totalWorkingHours);

//   /*
//    * -------------------------------------------------------
//    * BASE SALARY
//    * -------------------------------------------------------
//    */

//   let baseSalary = 0;

//   /*
//    * MONTHLY / DAILY
//    */

//   if (
//     profile.salaryType === "MONTHLY" ||
//     profile.salaryType === "DAILY"
//   ) {
//     baseSalary =
//       calculateBaseSalary(
//         profile,
//         workingDays,
//         paidDays
//       );
//   }

//   /*
//    * HOURLY
//    */

//   if (
//     profile.salaryType === "HOURLY"
//   ) {
//     baseSalary =
//       calculateHourlySalary(
//         profile,
//         totalWorkingHours
//       );
//   }

//   /*
//    * -------------------------------------------------------
//    * EARNINGS
//    * -------------------------------------------------------
//    */

//   const earnings: PayrollLineItem[] =
//     [];

//   if (
//     baseSalary > 0
//   ) {
//     earnings.push(
//       createBaseEarning(
//         baseSalary
//       )
//     );
//   }

//   /*
//    * -------------------------------------------------------
//    * OVERTIME
//    * -------------------------------------------------------
//    */

//   if (
//     overtimeHours > 0 &&
//     profile.overtimeRate
//   ) {
//     const overtimeAmount =
//       roundMoney(
//         overtimeHours *
//           profile.overtimeRate
//       );

//     earnings.push({
//       componentId:
//         "OVERTIME",

//       code: "OVERTIME",

//       name: "Overtime",

//       amount:
//         overtimeAmount,

//       taxable: true,
//     });
//   }

//   /*
//    * -------------------------------------------------------
//    * GROSS
//    * -------------------------------------------------------
//    */

//   const grossAmount =
//     roundMoney(
//       earnings.reduce(
//         (sum, item) =>
//           sum + item.amount,
//         0
//       )
//     );

//   /*
//    * -------------------------------------------------------
//    * DEDUCTIONS
//    * -------------------------------------------------------
//    *
//    * Tax / PF / insurance etc.
//    * will be added when SalaryStructure
//    * and tax components are connected.
//    */

//   const deductions: PayrollLineItem[] =
//     [];

//   const totalDeductions =
//     roundMoney(
//       deductions.reduce(
//         (sum, item) =>
//           sum + item.amount,
//         0
//       )
//     );

//   /*
//    * -------------------------------------------------------
//    * EMPLOYER CONTRIBUTIONS
//    * -------------------------------------------------------
//    */

//   const employerContributions:
//     PayrollLineItem[] =
//     [];

//   /*
//    * -------------------------------------------------------
//    * NET
//    * -------------------------------------------------------
//    */

//   const netAmount =
//     roundMoney(
//       grossAmount -
//         totalDeductions
//     );

//   /*
//    * -------------------------------------------------------
//    * EMPLOYEE NAME
//    * -------------------------------------------------------
//    */

//   const employeeName = [
//     employee.firstName,
//     employee.lastName,
//   ]
//     .filter(Boolean)
//     .join(" ");

//   /*
//    * -------------------------------------------------------
//    * PAYROLL ITEM
//    * -------------------------------------------------------
//    */

//   const payrollItem: PayrollItem = {
//     id: employeeId,

//     payrollRunId,

//     employeeId,

//     employeeName,

//     currency:
//       payrollRun.currency,

//     /*
//      * IMPORTANT:
//      *
//      * workingDays = actual working days
//      * in payroll period.
//      *
//      * paidDays = attendance-based.
//      *
//      * unpaidDays = attendance-based.
//      */

//     workingDays,

//     paidDays,

//     unpaidDays,

//     overtimeHours,

//     earnings,

//     deductions,

//     employerContributions,

//     grossAmount,

//     totalDeductions,

//     netAmount,

//     status: "PENDING",

//     createdAt:
//       new Date().toISOString(),
//   };

//   /*
//    * -------------------------------------------------------
//    * SAVE
//    * -------------------------------------------------------
//    */

//   await adminDb
//     .collection(
//       PAYROLL_RUN_COLLECTION
//     )
//     .doc(payrollRunId)
//     .collection("items")
//     .doc(employeeId)
//     .set(
//       payrollItem,
//       { merge: true }
//     );

//   return payrollItem;
// }

// /* =========================================================
//    CALCULATE ENTIRE PAYROLL RUN
// ========================================================= */

// export async function calculatePayrollRun(
//   payrollRunId: string
// ): Promise<{
//   employeeCount: number;
//   grossAmount: number;
//   totalDeductions: number;
//   employerContributions: number;
//   netAmount: number;
// }> {
//   /*
//    * -------------------------------------------------------
//    * GET PAYROLL RUN
//    * -------------------------------------------------------
//    */

//   const payrollRunRef =
//     adminDb
//       .collection(
//         PAYROLL_RUN_COLLECTION
//       )
//       .doc(payrollRunId);

//   const payrollRunDoc =
//     await payrollRunRef.get();

//   if (!payrollRunDoc.exists) {
//     throw new Error(
//       "Payroll run not found"
//     );
//   }

//   const payrollRun =
//     payrollRunDoc.data() as PayrollRun;

//   /*
//    * -------------------------------------------------------
//    * ONLY DRAFT / CALCULATING
//    * -------------------------------------------------------
//    */

//   if (
//     payrollRun.status !== "DRAFT" &&
//     payrollRun.status !==
//       "CALCULATING"
//   ) {
//     throw new Error(
//       `Payroll run cannot be calculated from status ${payrollRun.status}`
//     );
//   }

//   /*
//    * -------------------------------------------------------
//    * MARK CALCULATING
//    * -------------------------------------------------------
//    */

//   await payrollRunRef.update({
//     status: "CALCULATING",

//     updatedAt:
//       new Date().toISOString(),
//   });

//   /*
//    * -------------------------------------------------------
//    * GET ACTIVE EMPLOYEES
//    * -------------------------------------------------------
//    */

//   const employeeSnapshot =
//     await adminDb
//       .collection(
//         EMPLOYEE_COLLECTION
//       )
//       .where(
//         "status",
//         "==",
//         "ACTIVE"
//       )
//       .get();

//   let employeeCount = 0;

//   let grossAmount = 0;

//   let totalDeductions = 0;

//   let employerContributions = 0;

//   let netAmount = 0;

//   /*
//    * -------------------------------------------------------
//    * CALCULATE EACH EMPLOYEE
//    * -------------------------------------------------------
//    */

//   for (
//     const employeeDoc of
//       employeeSnapshot.docs
//   ) {
//     const employee =
//       employeeDoc.data() as Employee;

//     try {
//       const item =
//         await calculateEmployeePayroll(
//           payrollRunId,
//           employeeDoc.id
//         );

//       employeeCount++;

//       grossAmount +=
//         item.grossAmount;

//       totalDeductions +=
//         item.totalDeductions;

//       employerContributions +=
//         item.employerContributions.reduce(
//           (
//             sum,
//             contribution
//           ) =>
//             sum +
//             contribution.amount,
//           0
//         );

//       netAmount +=
//         item.netAmount;
//     } catch (error) {
//       /*
//        * ---------------------------------------------------
//        * CALCULATION FAILED
//        * ---------------------------------------------------
//        *
//        * Return payroll run to DRAFT.
//        */

//       await payrollRunRef.update({
//         status: "DRAFT",

//         updatedAt:
//           new Date().toISOString(),
//       });

//       throw new Error(
//         `Payroll calculation failed for ${employee.employeeCode}: ${
//           error instanceof Error
//             ? error.message
//             : "Unknown error"
//         }`
//       );
//     }
//   }

//   /*
//    * -------------------------------------------------------
//    * ROUND TOTALS
//    * -------------------------------------------------------
//    */

//   grossAmount =
//     roundMoney(
//       grossAmount
//     );

//   totalDeductions =
//     roundMoney(
//       totalDeductions
//     );

//   employerContributions =
//     roundMoney(
//       employerContributions
//     );

//   netAmount =
//     roundMoney(
//       netAmount
//     );

//   /*
//    * -------------------------------------------------------
//    * UPDATE PAYROLL RUN
//    * -------------------------------------------------------
//    */

//   await payrollRunRef.update({
//     status: "REVIEW",

//     employeeCount,

//     grossAmount,

//     totalDeductions,

//     employerContributions,

//     netAmount,

//     updatedAt:
//       new Date().toISOString(),
//   });

//   return {
//     employeeCount,

//     grossAmount,

//     totalDeductions,

//     employerContributions,

//     netAmount,
//   };
// }

