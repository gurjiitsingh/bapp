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