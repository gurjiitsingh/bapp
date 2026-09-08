  
import {
  EmploymentType,
  PayFrequency,
  PayrollCountryCode,
  PayrollCurrency,
} from "./PayrollTypes";

export type EmployeeSalaryType =
  | "MONTHLY"
  | "DAILY"
  | "HOURLY";

export interface EmployeePayrollProfile {
  employeeId: string;

  // =========================================================
  // PAYROLL LOCATION
  // =========================================================

  countryCode: PayrollCountryCode;

  regionCode?: string;

  city?: string;

  timezone?: string;

  currency: PayrollCurrency;

  // =========================================================
  // EMPLOYMENT
  // =========================================================

  employmentType: EmploymentType;

  // =========================================================
  // PAY
  // =========================================================

  salaryType: EmployeeSalaryType;

  payFrequency: PayFrequency;

  // =========================================================
  // SALARY / RATES
  // =========================================================

  annualSalary?: number;

  monthlySalary?: number;

  dailyRate?: number;

  hourlyRate?: number;

  overtimeRate?: number;

  // =========================================================
  // PAYROLL CONFIGURATION
  // =========================================================

  taxProfileId?: string;

  salaryStructureId?: string;

  // =========================================================
  // EFFECTIVE PERIOD
  // =========================================================

  effectiveFrom: string;

  effectiveTo?: string;

  // =========================================================
  // AUDIT
  // =========================================================

  createdAt?: Date | string;

  updatedAt?: Date | string;
}


// export interface EmployeePayrollProfile {
//   employeeId: string;

//   location: PayrollLocation;

//   employmentType: EmploymentType;

//   salaryType: SalaryType;

//   payFrequency: PayFrequency;

//   annualSalary?: number;

//   monthlySalary?: number;

//   hourlyRate?: number;

//   dailyRate?: number;

//   overtimeRate?: number;

//   taxProfileId?: string;

//   salaryStructureId?: string;

//   effectiveFrom: Date | string;

//   effectiveTo?: Date | string;
// }