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