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