"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Eye,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { PayrollRun } from "@/lib/types/payroll/PayrollRun";

import { getPayrollRuns } from "../../../action/employee-system/payroll/payrollRunActions";

type Props = {
  onSelectRun?: (payrollRunId: string) => void;
};

export default function PayrollHistory({
  onSelectRun,
}: Props) {
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayrollRuns = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const runs = await getPayrollRuns();

      setPayrollRuns(runs);
    } catch (err) {
      console.error("Failed to load payroll history:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load payroll history."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayrollRuns();
  }, [loadPayrollRuns]);

  function formatMoney(
    amount: number,
    currency: PayrollRun["currency"]
  ) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
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

  function formatPeriod(
    start: string,
    end: string
  ) {
    return `${formatDate(start)} – ${formatDate(end)}`;
  }

  function statusClass(
    status: PayrollRun["status"]
  ) {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-700";

      case "CALCULATING":
        return "bg-blue-100 text-blue-700";

      case "REVIEW":
        return "bg-yellow-100 text-yellow-700";

      case "APPROVED":
        return "bg-green-100 text-green-700";

      case "LOCKED":
        return "bg-purple-100 text-purple-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex min-h-[300px] items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading payroll history...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Payroll History
          </h2>

          <p className="text-sm text-muted-foreground">
            View previous payroll runs and their payment details.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={loadPayrollRuns}
          disabled={loading}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {!error && payrollRuns.length === 0 && (
        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <CalendarDays className="mb-4 h-10 w-10 text-muted-foreground" />

            <h3 className="text-lg font-semibold">
              No payroll runs found
            </h3>

            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Create your first payroll run to see it here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* =====================================================
          PAYROLL TABLE
      ===================================================== */}

      {payrollRuns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Payroll Runs
              <span className="text-sm font-normal text-muted-foreground">
                ({payrollRuns.length})
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payroll Period</TableHead>

                    <TableHead>Pay Date</TableHead>

                    <TableHead>Frequency</TableHead>

                    <TableHead className="text-right">
                      Employees
                    </TableHead>

                    <TableHead className="text-right">
                      Gross
                    </TableHead>

                    <TableHead className="text-right">
                      Deductions
                    </TableHead>

                    <TableHead className="text-right">
                      Net Pay
                    </TableHead>

                    <TableHead>Status</TableHead>

                    <TableHead className="text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {payrollRuns.map((run) => (
                    <TableRow key={run.id}>
                      {/* Period */}
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />

                          <div>
                            <div className="font-medium">
                              {formatPeriod(
                                run.periodStart,
                                run.periodEnd
                              )}
                            </div>

                            <div className="text-xs text-muted-foreground">
                              {run.countryCode} · {run.currency}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Pay Date */}
                      <TableCell>
                        {formatDate(run.payDate)}
                      </TableCell>

                      {/* Frequency */}
                      <TableCell>
                        {run.payFrequency.replace(
                          /_/g,
                          " "
                        )}
                      </TableCell>

                      {/* Employees */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {run.employeeCount}
                        </div>
                      </TableCell>

                      {/* Gross */}
                      <TableCell className="text-right font-medium">
                        {formatMoney(
                          run.grossAmount,
                          run.currency
                        )}
                      </TableCell>

                      {/* Deductions */}
                      <TableCell className="text-right">
                        {formatMoney(
                          run.totalDeductions,
                          run.currency
                        )}
                      </TableCell>

                      {/* Net */}
                      <TableCell className="text-right font-semibold">
                        {formatMoney(
                          run.netAmount,
                          run.currency
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                            run.status
                          )}`}
                        >
                          {run.status}
                        </span>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onSelectRun?.(run.id)
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}