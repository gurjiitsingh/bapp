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