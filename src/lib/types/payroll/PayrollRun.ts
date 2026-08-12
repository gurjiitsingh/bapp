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