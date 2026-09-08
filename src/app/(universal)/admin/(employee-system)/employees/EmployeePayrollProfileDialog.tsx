"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, WalletCards } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

 

import type { Employee } from "@/lib/types/payroll/EmployeeTypes";
import type {
  EmploymentType,
  PayFrequency,
  PayrollCurrency,
} from "@/lib/types/payroll/PayrollTypes";
import { getEmployeePayrollProfile, saveEmployeePayrollProfile } from "@/app/(universal)/action/employee-system/payroll/employeePayroll";

type CountryCode = "IN" | "US" | "CA" | "GB";

type SalaryType =
  | "MONTHLY"
  | "DAILY"
  | "HOURLY";

type Props = {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
};

export default function EmployeePayrollProfileDialog({
  employee,
  open,
  onOpenChange,
  onSaved,
}: Props) {
  const [countryCode, setCountryCode] =
    useState<CountryCode>("IN");

  const [regionCode, setRegionCode] =
    useState("");

  const [city, setCity] =
    useState("");

  const [timezone, setTimezone] =
    useState("Asia/Kolkata");

  const [currency, setCurrency] =
    useState<PayrollCurrency>("INR");

  const [employmentType, setEmploymentType] =
    useState<EmploymentType>("FULL_TIME");

  const [salaryType, setSalaryType] =
    useState<SalaryType>("MONTHLY");

  const [payFrequency, setPayFrequency] =
    useState<PayFrequency>("MONTHLY");

  const [annualSalary, setAnnualSalary] =
    useState("");

  const [monthlySalary, setMonthlySalary] =
    useState("");

  const [dailyRate, setDailyRate] =
    useState("");

  const [hourlyRate, setHourlyRate] =
    useState("");

  const [overtimeRate, setOvertimeRate] =
    useState("");

  const [taxProfileId, setTaxProfileId] =
    useState("");

  const [salaryStructureId, setSalaryStructureId] =
    useState("");

  const [effectiveFrom, setEffectiveFrom] =
    useState("");

  const [effectiveTo, setEffectiveTo] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [loadingProfile, setLoadingProfile] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * =========================================================
   * LOAD EXISTING PROFILE
   * =========================================================
   */
  useEffect(() => {
    if (!open || !employee) {
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      try {
        setLoadingProfile(true);
        setError("");

        const profile =
          await getEmployeePayrollProfile(
            employee.id
          );

        if (cancelled) return;

        /*
         * Current profile storage supports the
         * flat payroll fields used by the schema.
         */
        if (profile) {
          const data = profile as any;

          setCountryCode(
            data.countryCode ?? "IN"
          );

          setRegionCode(
            data.regionCode ?? ""
          );

          setCity(
            data.city ?? ""
          );

          setTimezone(
            data.timezone ??
              (
                data.countryCode === "US"
                  ? "America/New_York"
                  : data.countryCode === "CA"
                    ? "America/Toronto"
                    : data.countryCode === "GB"
                      ? "Europe/London"
                      : "Asia/Kolkata"
              )
          );

          setCurrency(
            data.currency ?? "INR"
          );

          setEmploymentType(
            data.employmentType ??
              employee.employmentType
          );

          setSalaryType(
            data.salaryType ?? "MONTHLY"
          );

          setPayFrequency(
            data.payFrequency ?? "MONTHLY"
          );

          setAnnualSalary(
            data.annualSalary != null
              ? String(data.annualSalary)
              : ""
          );

          setMonthlySalary(
            data.monthlySalary != null
              ? String(data.monthlySalary)
              : ""
          );

          setDailyRate(
            data.dailyRate != null
              ? String(data.dailyRate)
              : ""
          );

          setHourlyRate(
            data.hourlyRate != null
              ? String(data.hourlyRate)
              : ""
          );

          setOvertimeRate(
            data.overtimeRate != null
              ? String(data.overtimeRate)
              : ""
          );

          setTaxProfileId(
            data.taxProfileId ?? ""
          );

          setSalaryStructureId(
            data.salaryStructureId ?? ""
          );

          setEffectiveFrom(
            formatDateForInput(
              data.effectiveFrom
            )
          );

          setEffectiveTo(
            formatDateForInput(
              data.effectiveTo
            )
          );
        } else {
          resetForm(employee);
        }
      } catch (err) {
        console.error(
          "Failed to load payroll profile:",
          err
        );

        if (!cancelled) {
          setError(
            "Failed to load payroll profile."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [open, employee]);

  /*
   * =========================================================
   * RESET
   * =========================================================
   */
  function resetForm(currentEmployee?: Employee | null) {
    setCountryCode("IN");
    setRegionCode("");
    setCity("");
    setTimezone("Asia/Kolkata");
    setCurrency("INR");

    setEmploymentType(
      currentEmployee?.employmentType ??
        "FULL_TIME"
    );

    setSalaryType("MONTHLY");
    setPayFrequency("MONTHLY");

    setAnnualSalary("");
    setMonthlySalary("");
    setDailyRate("");
    setHourlyRate("");
    setOvertimeRate("");

    setTaxProfileId("");
    setSalaryStructureId("");

    setEffectiveFrom(
      currentEmployee?.joiningDate ?? ""
    );

    setEffectiveTo("");

    setError("");
  }

  /*
   * =========================================================
   * COUNTRY
   * =========================================================
   */
  function handleCountryChange(
    value: CountryCode
  ) {
    setCountryCode(value);

    if (value === "IN") {
      setCurrency("INR");
      setTimezone("Asia/Kolkata");
    }

    if (value === "US") {
      setCurrency("USD");
      setTimezone("America/New_York");
    }

    if (value === "CA") {
      setCurrency("CAD");
      setTimezone("America/Toronto");
    }

    if (value === "GB") {
      setCurrency("GBP");
      setTimezone("Europe/London");
    }
  }

  /*
   * =========================================================
   * NUMBER
   * =========================================================
   */
  function parseAmount(
    value: string
  ): number | undefined {
    if (!value.trim()) {
      return undefined;
    }

    const amount = Number(value);

    if (
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      return undefined;
    }

    return amount;
  }

  /*
   * =========================================================
   * VALIDATION
   * =========================================================
   */
  function validate(): string | null {
    if (!employee) {
      return "Employee not found.";
    }

    if (!effectiveFrom) {
      return "Please select the effective date.";
    }

    if (
      effectiveTo &&
      effectiveTo < effectiveFrom
    ) {
      return "Effective-to date cannot be before effective-from date.";
    }

    if (
      salaryType === "MONTHLY" &&
      !monthlySalary.trim()
    ) {
      return "Please enter the monthly salary.";
    }

    if (
      salaryType === "DAILY" &&
      !dailyRate.trim()
    ) {
      return "Please enter the daily rate.";
    }

    if (
      salaryType === "HOURLY" &&
      !hourlyRate.trim()
    ) {
      return "Please enter the hourly rate.";
    }

    const amounts = [
      annualSalary,
      monthlySalary,
      dailyRate,
      hourlyRate,
      overtimeRate,
    ];

    for (const value of amounts) {
      if (!value.trim()) continue;

      const amount = Number(value);

      if (
        !Number.isFinite(amount) ||
        amount < 0
      ) {
        return "Salary amounts and rates must be valid non-negative numbers.";
      }
    }

    return null;
  }

  /*
   * =========================================================
   * SAVE
   * =========================================================
   */
  async function handleSave() {
    setError("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!employee) {
      setError("Employee not found.");
      return;
    }

    try {
      setLoading(true);

      /*
       * The current EmployeePayrollProfile type and
       * schema in your project are slightly different:
       *
       * schema -> countryCode / regionCode / city / timezone / currency
       * interface -> location
       *
       * We save the flat structure currently used by
       * your payroll schema/actions.
       */
      const profile = {
        employeeId: employee.id,

        countryCode,

        regionCode:
          regionCode.trim() || undefined,

        city:
          city.trim() || undefined,

        timezone:
          timezone.trim() || undefined,

        currency,

        employmentType,

        salaryType,

        payFrequency,

        annualSalary:
          parseAmount(annualSalary),

        monthlySalary:
          parseAmount(monthlySalary),

        dailyRate:
          parseAmount(dailyRate),

        hourlyRate:
          parseAmount(hourlyRate),

        overtimeRate:
          parseAmount(overtimeRate),

        taxProfileId:
          taxProfileId.trim() || undefined,

        salaryStructureId:
          salaryStructureId.trim() || undefined,

        effectiveFrom,

        effectiveTo:
          effectiveTo || undefined,
      };

      await saveEmployeePayrollProfile(
        profile as any
      );

      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      console.error(
        "Failed to save payroll profile:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save payroll profile."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!employee) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);

        if (!value) {
          setError("");
        }
      }}
    >
      <DialogContent
        className="
          w-[calc(100%-2rem)]
          max-w-[760px]
          max-h-[90vh]
          overflow-y-auto
          bg-white
          text-gray-900
          border
          border-gray-200
          shadow-2xl
          opacity-100
        "
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Payroll Profile
          </DialogTitle>

          <DialogDescription className="text-gray-500">
            Configure salary and payroll settings for{" "}
            <span className="font-medium text-gray-700">
              {employee.firstName}{" "}
              {employee.lastName ?? ""}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        {loadingProfile ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading payroll profile...
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            {/* =================================================
                EMPLOYEE
            ================================================= */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white p-2 shadow-sm">
                  <WalletCards className="h-5 w-5 text-gray-700" />
                </div>

                <div>
                  <p className="font-medium text-gray-900">
                    {employee.firstName}{" "}
                    {employee.lastName ?? ""}
                  </p>

                  <p className="text-xs text-gray-500">
                    {employee.employeeCode}
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                LOCATION
            ================================================= */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Payroll Location
                </h3>

                <p className="text-xs text-gray-500">
                  Location determines the payroll country,
                  currency and regional settings.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Country */}
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    Country
                  </Label>

                  <Select
                    value={countryCode}
                    onValueChange={(value) =>
                      handleCountryChange(
                        value as CountryCode
                      )
                    }
                  >
                    <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent className="bg-white">
                      <SelectItem value="IN">
                        India
                      </SelectItem>

                      <SelectItem value="US">
                        United States
                      </SelectItem>

                      <SelectItem value="CA">
                        Canada
                      </SelectItem>

                      <SelectItem value="GB">
                        United Kingdom
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    Currency
                  </Label>

                  <Select
                    value={currency}
                    onValueChange={(value) =>
                      setCurrency(
                        value as PayrollCurrency
                      )
                    }
                  >
                    <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent className="bg-white">
                      <SelectItem value="INR">
                        INR — ₹
                      </SelectItem>

                      <SelectItem value="USD">
                        USD — $
                      </SelectItem>

                      <SelectItem value="CAD">
                        CAD — $
                      </SelectItem>

                      <SelectItem value="GBP">
                        GBP — £
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Region */}
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    Region / State
                  </Label>

                  <Input
                    value={regionCode}
                    onChange={(e) =>
                      setRegionCode(
                        e.target.value
                      )
                    }
                    placeholder="PB, CA, NY, ENG"
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    City
                  </Label>

                  <Input
                    value={city}
                    onChange={(e) =>
                      setCity(e.target.value)
                    }
                    placeholder="Moga"
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>

                {/* Timezone */}
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-gray-700">
                    Timezone
                  </Label>

                  <Input
                    value={timezone}
                    onChange={(e) =>
                      setTimezone(
                        e.target.value
                      )
                    }
                    placeholder="Asia/Kolkata"
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* =================================================
                EMPLOYMENT
            ================================================= */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Employment & Pay
                </h3>

                <p className="text-xs text-gray-500">
                  Define how this employee is paid.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Employment Type */}
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    Employment Type
                  </Label>

                  <Select
                    value={employmentType}
                    onValueChange={(value) =>
                      setEmploymentType(
                        value as EmploymentType
                      )
                    }
                  >
                    <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent className="bg-white">
                      <SelectItem value="FULL_TIME">
                        Full Time
                      </SelectItem>

                      <SelectItem value="PART_TIME">
                        Part Time
                      </SelectItem>

                      <SelectItem value="CONTRACT">
                        Contract
                      </SelectItem>

                      <SelectItem value="TEMPORARY">
                        Temporary
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Salary Type */}
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    Salary Type
                  </Label>

                  <Select
                    value={salaryType}
                    onValueChange={(value) =>
                      setSalaryType(
                        value as SalaryType
                      )
                    }
                  >
                    <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent className="bg-white">
                      <SelectItem value="MONTHLY">
                        Monthly
                      </SelectItem>

                      <SelectItem value="DAILY">
                        Daily
                      </SelectItem>

                      <SelectItem value="HOURLY">
                        Hourly
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pay Frequency */}
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-gray-700">
                    Pay Frequency
                  </Label>

                  <Select
                    value={payFrequency}
                    onValueChange={(value) =>
                      setPayFrequency(
                        value as PayFrequency
                      )
                    }
                  >
                    <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent className="bg-white">
                      <SelectItem value="MONTHLY">
                        Monthly
                      </SelectItem>

                      <SelectItem value="BI_WEEKLY">
                        Bi-weekly
                      </SelectItem>

                      <SelectItem value="WEEKLY">
                        Weekly
                      </SelectItem>

                      <SelectItem value="SEMI_MONTHLY">
                        Semi-monthly
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* =================================================
                SALARY
            ================================================= */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Salary & Rates
                </h3>

                <p className="text-xs text-gray-500">
                  Enter the employee's salary or applicable rate.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Annual */}
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    Annual Salary
                  </Label>

                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={annualSalary}
                    onChange={(e) =>
                      setAnnualSalary(
                        e.target.value
                      )
                    }
                    placeholder="360000"
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>

                {/* Monthly */}
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    Monthly Salary
                    {salaryType === "MONTHLY" && (
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    )}
                  </Label>

                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={monthlySalary}
                    onChange={(e) =>
                      setMonthlySalary(
                        e.target.value
                      )
                    }
                    placeholder="30000"
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>

                {/* Daily */}
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    Daily Rate
                    {salaryType === "DAILY" && (
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    )}
                  </Label>

                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={dailyRate}
                    onChange={(e) =>
                      setDailyRate(
                        e.target.value
                      )
                    }
                    placeholder="1200"
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>

                {/* Hourly */}
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    Hourly Rate
                    {salaryType === "HOURLY" && (
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    )}
                  </Label>

                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={hourlyRate}
                    onChange={(e) =>
                      setHourlyRate(
                        e.target.value
                      )
                    }
                    placeholder="150"
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>

                {/* Overtime */}
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-gray-700">
                    Overtime Rate
                  </Label>

                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={overtimeRate}
                    onChange={(e) =>
                      setOvertimeRate(
                        e.target.value
                      )
                    }
                    placeholder="200"
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* =================================================
                PAYROLL CONFIGURATION
            ================================================= */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Payroll Configuration
                </h3>

                <p className="text-xs text-gray-500">
                  Optional tax and salary structure references.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    Tax Profile ID
                  </Label>

                  <Input
                    value={taxProfileId}
                    onChange={(e) =>
                      setTaxProfileId(
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">
                    Salary Structure ID
                  </Label>

                  <Input
                    value={salaryStructureId}
                    onChange={(e) =>
                      setSalaryStructureId(
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* =================================================
                EFFECTIVE DATES
            ================================================= */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Effective Period
                </h3>

                <p className="text-xs text-gray-500">
                  Define when this payroll profile becomes active.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    Effective From
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </Label>

                  <Input
                    type="date"
                    value={effectiveFrom}
                    onChange={(e) =>
                      setEffectiveFrom(
                        e.target.value
                      )
                    }
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">
                    Effective To
                    <span className="ml-1 text-gray-400">
                      Optional
                    </span>
                  </Label>

                  <Input
                    type="date"
                    value={effectiveTo}
                    onChange={(e) =>
                      setEffectiveTo(
                        e.target.value
                      )
                    }
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        )}

        {/* =====================================================
            FOOTER
        ===================================================== */}
        <DialogFooter className="border-t border-gray-100 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={
              loading || loadingProfile
            }
            onClick={() =>
              onOpenChange(false)
            }
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={
              loading || loadingProfile
            }
            onClick={handleSave}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Payroll Profile
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/*
 * ===========================================================
 * DATE HELPER
 * ===========================================================
 */
function formatDateForInput(
  value: unknown
): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as any).toDate === "function"
  ) {
    return (value as any)
      .toDate()
      .toISOString()
      .slice(0, 10);
  }

  return "";
}