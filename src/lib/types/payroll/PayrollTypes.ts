export type PayrollCountryCode =
  | "IN"
  | "US"
  | "CA"
  | "GB";

export type PayrollCurrency =
  | "INR"
  | "USD"
  | "CAD"
  | "GBP";

export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "TEMPORARY";

export type SalaryType =
  | "MONTHLY"
  | "DAILY"
  | "HOURLY";

export type PayFrequency =
  | "MONTHLY"
  | "BI_WEEKLY"
  | "WEEKLY"
  | "SEMI_MONTHLY";

export type EmployeeStatus =
  | "ACTIVE"
  | "ON_LEAVE"
  | "RESIGNED"
  | "TERMINATED";

export interface PayrollLocation {
  countryCode: PayrollCountryCode;

  /**
   * State / province / region.
   *
   * Examples:
   * IN: PB
   * US: CA
   * CA: ON
   * GB: null
   */
  regionCode?: string;

  city?: string;

  timezone?: string;

  currency: PayrollCurrency;
}