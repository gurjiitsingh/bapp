"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Printer,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  getPayslip,
  type PayslipData,
} from "@/app/(universal)/action/employee-system/payroll/payslipActions";

type Props = {
  payrollRunId: string;
  employeeId: string;
  onBack?: () => void;
};

export default function Payslip({
  payrollRunId,
  employeeId,
  onBack,
}: Props) {
  const [data, setData] = useState<PayslipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayslip = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getPayslip(
        payrollRunId,
        employeeId
      );

      if (!result) {
        setError("Payslip not found.");
        setData(null);
        return;
      }

      setData(result);
    } catch (err) {
      console.error("Failed to load payslip:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load payslip."
      );
    } finally {
      setLoading(false);
    }
  }, [payrollRunId, employeeId]);

  useEffect(() => {
    loadPayslip();
  }, [loadPayslip]);

  function formatMoney(amount: number) {
    if (!data) {
      return amount.toFixed(2);
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: data.payrollRun.currency,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  function formatDate(value: string | Date) {
    const date =
      value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getPaymentMethodLabel(
    method: string
  ) {
    switch (method) {
      case "BANK_TRANSFER":
        return "Bank Transfer";

      case "CASH":
        return "Cash";

      case "CHEQUE":
        return "Cheque";

      case "UPI":
        return "UPI";

      case "OTHER":
        return "Other";

      default:
        return method;
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4 p-6">
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}

        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          {error || "Payslip not found."}
        </div>
      </div>
    );
  }

  const {
    payrollRun,
    payrollItem,
    payment,
  } = data;

  return (
    <div className="space-y-6 p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">

        <div className="flex items-center gap-3">

          {onBack && (
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          <div>
            <h1 className="text-2xl font-bold">
              Payslip
            </h1>

            <p className="text-sm text-muted-foreground">
              {payrollItem.employeeName}
            </p>
          </div>
        </div>

        <div className="flex gap-2">

          <Button
            variant="outline"
            onClick={loadPayslip}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Payslip
          </Button>

        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 print:hidden">
          {error}
        </div>
      )}

      {/* =====================================================
          PAYSLIP
      ===================================================== */}

      <Card
        className="
          mx-auto
          max-w-4xl
          border-slate-200
          shadow-sm
          print:max-w-none
          print:border-0
          print:shadow-none
        "
      >

        {/* ===================================================
            PAYSLIP HEADER
        =================================================== */}

        <CardHeader className="border-b border-slate-200">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

            <div>
              <CardTitle className="text-2xl">
                PAYSLIP
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Payroll Run
              </p>

              <p className="text-sm font-medium">
                {payrollRun.id}
              </p>
            </div>

            <div className="text-left sm:text-right">

              <div className="text-sm text-muted-foreground">
                Pay Period
              </div>

              <div className="font-medium">
                {formatDate(payrollRun.periodStart)}
                {" → "}
                {formatDate(payrollRun.periodEnd)}
              </div>

              <div className="mt-2 text-sm text-muted-foreground">
                Pay Date
              </div>

              <div className="font-medium">
                {formatDate(payrollRun.payDate)}
              </div>

            </div>

          </div>

        </CardHeader>

        <CardContent className="space-y-8 p-6">

          {/* =================================================
              EMPLOYEE INFORMATION
          ================================================= */}

          <div>

            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Employee Information
            </h2>

            <div className="grid gap-4 rounded-lg border bg-slate-50 p-4 sm:grid-cols-2">

              <div>
                <div className="text-xs text-muted-foreground">
                  Employee Name
                </div>

                <div className="font-semibold">
                  {payrollItem.employeeName}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">
                  Employee ID
                </div>

                <div className="font-semibold">
                  {payrollItem.employeeId}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">
                  Currency
                </div>

                <div className="font-semibold">
                  {payrollItem.currency}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">
                  Payroll Frequency
                </div>

                <div className="font-semibold">
                  {payrollRun.payFrequency}
                </div>
              </div>

            </div>

          </div>

          {/* =================================================
              ATTENDANCE
          ================================================= */}

          <div>

            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Attendance
            </h2>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">

              <div className="rounded-lg border p-4">
                <div className="text-xs text-muted-foreground">
                  Working Days
                </div>

                <div className="mt-1 text-xl font-bold">
                  {payrollItem.workingDays}
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="text-xs text-muted-foreground">
                  Paid Days
                </div>

                <div className="mt-1 text-xl font-bold">
                  {payrollItem.paidDays}
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="text-xs text-muted-foreground">
                  Unpaid Days
                </div>

                <div className="mt-1 text-xl font-bold">
                  {payrollItem.unpaidDays}
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="text-xs text-muted-foreground">
                  Overtime Hours
                </div>

                <div className="mt-1 text-xl font-bold">
                  {payrollItem.overtimeHours}
                </div>
              </div>

            </div>

          </div>

          {/* =================================================
              EARNINGS
          ================================================= */}

          <div>

            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Earnings
            </h2>

            <div className="overflow-hidden rounded-lg border">

              {payrollItem.earnings.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">
                  No earnings recorded.
                </div>
              ) : (
                payrollItem.earnings.map(
                  (earning, index) => (
                    <div
                      key={`${earning.name}-${index}`}
                      className="flex items-center justify-between border-b px-4 py-3 last:border-b-0"
                    >
                      <span>
                        {earning.name}
                      </span>

                      <span className="font-medium">
                        {formatMoney(earning.amount)}
                      </span>
                    </div>
                  )
                )
              )}

              <div className="flex items-center justify-between bg-slate-50 px-4 py-3 font-semibold">
                <span>
                  Gross Pay
                </span>

                <span>
                  {formatMoney(
                    payrollItem.grossAmount
                  )}
                </span>
              </div>

            </div>

          </div>

          {/* =================================================
              DEDUCTIONS
          ================================================= */}

          <div>

            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Deductions
            </h2>

            <div className="overflow-hidden rounded-lg border">

              {payrollItem.deductions.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">
                  No deductions recorded.
                </div>
              ) : (
                payrollItem.deductions.map(
                  (deduction, index) => (
                    <div
                      key={`${deduction.name}-${index}`}
                      className="flex items-center justify-between border-b px-4 py-3 last:border-b-0"
                    >
                      <span>
                        {deduction.name}
                      </span>

                      <span className="font-medium">
                        {formatMoney(
                          deduction.amount
                        )}
                      </span>
                    </div>
                  )
                )
              )}

              <div className="flex items-center justify-between bg-slate-50 px-4 py-3 font-semibold">
                <span>
                  Total Deductions
                </span>

                <span>
                  {formatMoney(
                    payrollItem.totalDeductions
                  )}
                </span>
              </div>

            </div>

          </div>

          {/* =================================================
              NET PAY
          ================================================= */}

          <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-6">

            <div className="flex items-center justify-between">

              <div>
                <div className="text-sm text-muted-foreground">
                  Net Pay
                </div>

                <div className="mt-1 text-3xl font-bold">
                  {formatMoney(
                    payrollItem.netAmount
                  )}
                </div>
              </div>

              {payrollItem.status === "PAID" && (
                <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-2 text-sm font-medium text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  PAID
                </div>
              )}

            </div>

          </div>

          {/* =================================================
              PAYMENT INFORMATION
          ================================================= */}

          <div>

            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Payment Information
            </h2>

            {payment ? (
              <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4">

                <div>
                  <div className="text-xs text-muted-foreground">
                    Payment Status
                  </div>

                  <div className="mt-1 font-semibold">
                    {payment.status}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">
                    Payment Method
                  </div>

                  <div className="mt-1 font-semibold">
                    {getPaymentMethodLabel(
                      payment.paymentMethod
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">
                    Payment Date
                  </div>

                  <div className="mt-1 font-semibold">
                    {formatDate(
                      payment.paymentDate
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">
                    Amount Paid
                  </div>

                  <div className="mt-1 font-semibold">
                    {formatMoney(payment.amount)}
                  </div>
                </div>

                {payment.reference && (
                  <div className="sm:col-span-2">

                    <div className="text-xs text-muted-foreground">
                      Payment Reference
                    </div>

                    <div className="mt-1 font-semibold">
                      {payment.reference}
                    </div>

                  </div>
                )}

              </div>
            ) : (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
                Payment has not been recorded yet.
              </div>
            )}

          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="border-t pt-6 text-center text-xs text-muted-foreground">
            This payslip was generated from payroll run{" "}
            {payrollRun.id}.
          </div>

        </CardContent>
      </Card>

    </div>
  );
}