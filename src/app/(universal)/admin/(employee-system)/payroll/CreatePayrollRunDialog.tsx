"use client";

import { useState } from "react";
import { CalendarDays, Loader2, Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type {
  PayrollCountryCode,
  PayrollCurrency,
  PayFrequency,
} from "@/lib/types/payroll/PayrollTypes";

import { createPayrollRun } from "../../../action/employee-system/payroll/payrollRunActions";

type Props = {
  onCreated?: (payrollRunId: string) => void;
};

export default function CreatePayrollRunDialog({
  onCreated,
}: Props) {
  const [open, setOpen] = useState(false);

  const [countryCode, setCountryCode] =
    useState<PayrollCountryCode>("IN");

  const [currency, setCurrency] =
    useState<PayrollCurrency>("INR");

  const [payFrequency, setPayFrequency] =
    useState<PayFrequency>("MONTHLY");

  const [periodStart, setPeriodStart] =
    useState("");

  const [periodEnd, setPeriodEnd] =
    useState("");

  const [payDate, setPayDate] =
    useState("");

  const [regionCode, setRegionCode] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =========================================================
     RESET FORM
  ========================================================= */

  function resetForm() {
    setCountryCode("IN");
    setCurrency("INR");
    setPayFrequency("MONTHLY");
    setPeriodStart("");
    setPeriodEnd("");
    setPayDate("");
    setRegionCode("");
    setError("");
  }

  /* =========================================================
     COUNTRY CHANGE
  ========================================================= */

  function handleCountryChange(
    value: PayrollCountryCode
  ) {
    setCountryCode(value);

    if (value === "IN") {
      setCurrency("INR");
    } else if (value === "US") {
      setCurrency("USD");
    } else if (value === "CA") {
      setCurrency("CAD");
    } else if (value === "GB") {
      setCurrency("GBP");
    }
  }

  /* =========================================================
     VALIDATION
  ========================================================= */

  function validate(): string | null {
    if (!periodStart) {
      return "Please select the payroll period start date.";
    }

    if (!periodEnd) {
      return "Please select the payroll period end date.";
    }

    if (!payDate) {
      return "Please select the salary payment date.";
    }

    const start = new Date(
      `${periodStart}T00:00:00`
    );

    const end = new Date(
      `${periodEnd}T00:00:00`
    );

    const payment = new Date(
      `${payDate}T00:00:00`
    );

    if (start > end) {
      return "Period start date cannot be after period end date.";
    }

    if (payment < start) {
      return "Pay date cannot be before the payroll period starts.";
    }

    return null;
  }

  /* =========================================================
     CREATE PAYROLL RUN
  ========================================================= */

  async function handleCreate() {
    setError("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const payrollRunId =
        await createPayrollRun({
          countryCode,

          regionCode:
            regionCode.trim() || undefined,

          currency,

          periodStart,

          periodEnd,

          payDate,

          payFrequency,

          createdBy: "SYSTEM",
        });

      setOpen(false);

      resetForm();

      onCreated?.(payrollRunId);
    } catch (err) {
      console.error(
        "Failed to create payroll run:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create payroll run."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);

        if (!value) {
          setError("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Payroll Run
        </Button>
      </DialogTrigger>

      <DialogContent
        className="
          w-[calc(100%-2rem)]
          max-w-[600px]
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
        {/* =================================================
            HEADER
        ================================================= */}

        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Create Payroll Run
          </DialogTitle>

          <DialogDescription className="text-gray-500">
            Create a payroll period for your active
            employees. Salary calculation will happen
            after the payroll run is created.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">

          {/* =================================================
              COUNTRY / CURRENCY
          ================================================= */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* COUNTRY */}

            <div className="space-y-2">
              <Label className="text-gray-700">
                Country
              </Label>

              <Select
                value={countryCode}
                onValueChange={(value) =>
                  handleCountryChange(
                    value as PayrollCountryCode
                  )
                }
              >
                <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                  <SelectValue placeholder="Select country" />
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

            {/* CURRENCY */}

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
                  <SelectValue placeholder="Select currency" />
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
          </div>

          {/* =================================================
              REGION
          ================================================= */}

          <div className="space-y-2">
            <Label className="text-gray-700">
              Region / State
              <span className="ml-1 text-gray-400">
                Optional
              </span>
            </Label>

            <Input
              className="bg-white text-gray-900 border-gray-300"
              placeholder="e.g. PB, CA, NY, ENG"
              value={regionCode}
              onChange={(e) =>
                setRegionCode(e.target.value)
              }
            />
          </div>

          {/* =================================================
              PAY FREQUENCY
          ================================================= */}

          <div className="space-y-2">
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
                <SelectValue placeholder="Select frequency" />
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

          {/* =================================================
              PAYROLL PERIOD
          ================================================= */}

          <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">

            <div className="flex items-center gap-2">

              <div className="rounded-md bg-white p-2 shadow-sm">
                <CalendarDays className="h-4 w-4 text-gray-700" />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  Payroll Period
                </p>

                <p className="text-xs text-gray-500">
                  Select the period employees are being paid for.
                </p>
              </div>

            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* START */}

              <div className="space-y-2">
                <Label className="text-gray-700">
                  Period Start
                </Label>

                <Input
                  type="date"
                  className="bg-white text-gray-900 border-gray-300"
                  value={periodStart}
                  onChange={(e) =>
                    setPeriodStart(
                      e.target.value
                    )
                  }
                />
              </div>

              {/* END */}

              <div className="space-y-2">
                <Label className="text-gray-700">
                  Period End
                </Label>

                <Input
                  type="date"
                  className="bg-white text-gray-900 border-gray-300"
                  value={periodEnd}
                  onChange={(e) =>
                    setPeriodEnd(
                      e.target.value
                    )
                  }
                />
              </div>

            </div>
          </div>

          {/* =================================================
              PAY DATE
          ================================================= */}

          <div className="space-y-2">

            <Label className="text-gray-700">
              Pay Date
            </Label>

            <Input
              type="date"
              className="bg-white text-gray-900 border-gray-300"
              value={payDate}
              onChange={(e) =>
                setPayDate(
                  e.target.value
                )
              }
            />

            <p className="text-xs text-gray-500">
              The date salary is scheduled to be paid.
            </p>

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

        {/* =================================================
            FOOTER
        ================================================= */}

        <DialogFooter className="border-t border-gray-100 pt-4">

          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={loading}
            onClick={handleCreate}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Payroll Run
              </>
            )}
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}