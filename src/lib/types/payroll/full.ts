import { EmployeeStatus } from "./EmployeeTypes";
import { EmploymentType } from "./PayrollTypes";

interface Employee {
  id: string;

  employeeCode: string;

  firstName: string;
  lastName?: string;

  email?: string;
  phone?: string;

  dateOfBirth?: string;

  joiningDate: string;

  departmentId?: string;
  designationId?: string;

  employmentType: EmploymentType;

  status: EmployeeStatus;

  userId?: string;

  createdAt: string;
  updatedAt: string;
}

import { EmploymentType, PayFrequency, PayrollLocation, SalaryType } from "./PayrollTypes";

export interface EmployeePayrollProfile {
  employeeId: string;

  location: PayrollLocation;

  employmentType: EmploymentType;

  salaryType: SalaryType;

  payFrequency: PayFrequency;

  annualSalary?: number;

  monthlySalary?: number;

  hourlyRate?: number;

  dailyRate?: number;

  overtimeRate?: number;

  taxProfileId?: string;

  salaryStructureId?: string;

  effectiveFrom: Date | string;

  effectiveTo?: Date | string;
}


import { z } from "zod";

export const employeePayrollProfileSchema = z.object({
  employeeId: z.string().min(1),

  countryCode: z.enum(["IN", "US", "CA", "GB"]),

  regionCode: z.string().optional(),

  city: z.string().optional(),

  timezone: z.string().optional(),

  currency: z.enum(["INR", "USD", "CAD", "GBP"]),

  employmentType: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
    "TEMPORARY",
  ]),

  salaryType: z.enum([
    "MONTHLY",
    "DAILY",
    "HOURLY",
  ]),

  payFrequency: z.enum([
    "MONTHLY",
    "BI_WEEKLY",
    "WEEKLY",
    "SEMI_MONTHLY",
  ]),

  annualSalary: z.number().nonnegative().optional(),

  monthlySalary: z.number().nonnegative().optional(),

  hourlyRate: z.number().nonnegative().optional(),

  dailyRate: z.number().nonnegative().optional(),

  overtimeRate: z.number().nonnegative().optional(),

  taxProfileId: z.string().optional(),

  salaryStructureId: z.string().optional(),

  effectiveFrom: z.string().min(1),

  effectiveTo: z.string().optional(),
});



export type EmployeeStatus =
  | "ACTIVE"
  | "ON_LEAVE"
  | "RESIGNED"
  | "TERMINATED";

export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "TEMPORARY";

export interface Employee {
  id: string;

  employeeCode: string;

  firstName: string;
  lastName?: string;

  email?: string;
  phone?: string;

  dateOfBirth?: string;

  joiningDate: string;

  departmentId?: string;
  designationId?: string;

  employmentType: EmploymentType;

  status: EmployeeStatus;

  /**
   * Optional connection to the application's
   * authentication user.
   */
  userId?: string;

  createdAt: string;
  updatedAt: string;
}
import { PayrollCurrency } from "./PayrollTypes";

export interface PayrollItem {
  id: string;

  payrollRunId: string;

  employeeId: string;

  employeeName: string;

  currency: PayrollCurrency;

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

  status:
    | "PENDING"
    | "APPROVED"
    | "PAID"
    | "CANCELLED";

  createdAt: Date | string;
}

export interface PayrollLineItem {
  componentId: string;

  code: string;

  name: string;

  amount: number;

  taxable: boolean;
}

import { PayFrequency, PayrollCountryCode, PayrollCurrency } from "./PayrollTypes";

export type PayrollRunStatus =
  | "DRAFT"
  | "CALCULATING"
  | "REVIEW"
  | "APPROVED"
  | "LOCKED"
  | "CANCELLED";

export interface PayrollRun {
  id: string;

  countryCode: PayrollCountryCode;

  regionCode?: string;

  currency: PayrollCurrency;

  periodStart: string;

  periodEnd: string;

  payDate: string;

  payFrequency: PayFrequency;

  status: PayrollRunStatus;

  employeeCount: number;

  grossAmount: number;

  totalDeductions: number;

  employerContributions: number;

  netAmount: number;

  createdAt: Date | string;

  updatedAt: Date | string;

  createdBy: string;

  approvedBy?: string;

  approvedAt?: Date | string;
}

import { PayrollCountryCode, PayrollCurrency } from "./PayrollTypes";

export interface SalaryStructure {
  id: string;

  name: string;

  countryCode: PayrollCountryCode;

  regionCode?: string;

  currency: PayrollCurrency;

  components: SalaryStructureComponent[];

  active: boolean;

  effectiveFrom: Date | string;

  effectiveTo?: Date | string;
}

export interface SalaryStructureComponent {
  componentId: string;

  amount?: number;

  percentage?: number;

  calculation?: SalaryComponentCalculation;

  sequence: number;
}

export type SalaryComponentType =
  | "EARNING"
  | "DEDUCTION"
  | "EMPLOYER_CONTRIBUTION";

export type SalaryComponentCalculation =
  | "FIXED"
  | "PERCENTAGE"
  | "FORMULA"
  | "HOURS"
  | "DAYS";

export interface SalaryComponent {
  id: string;

  code: string;

  name: string;

  type: SalaryComponentType;

  calculation: SalaryComponentCalculation;

  amount?: number;

  percentage?: number;

  taxable: boolean;

  active: boolean;

  countryCode?: PayrollCountryCode;

  regionCode?: string;
}