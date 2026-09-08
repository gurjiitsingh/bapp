"use client";

import { useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  FileText,
  Plus,
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

import CreatePayrollRunDialog from "./CreatePayrollRunDialog";
import PayrollRunDetails from "./PayrollRunDetails";
import { PayrollRun } from "@/lib/types/payroll/PayrollRun";
import { getPayrollRuns } from "../../../action/employee-system/payroll/payrollRunActions";



type Props = {
  initialData?: PayrollRun[];
};

export default function PayrollDashboard({
  initialData = [],
}: Props) {
  const [payrollRuns, setPayrollRuns] =
    useState<PayrollRun[]>(initialData);

  const [selectedPayrollRunId, setSelectedPayrollRunId] =
    useState<string | null>(null);

  const [refreshing, setRefreshing] =
    useState(false);

  /* =========================================================
     REFRESH PAYROLL RUNS
  ========================================================= */

  async function refreshPayrollRuns() {
    try {
      setRefreshing(true);

      const runs = await getPayrollRuns();

      setPayrollRuns(runs);
    } catch (error) {
      console.error(
        "Failed to refresh payroll runs:",
        error
      );
    } finally {
      setRefreshing(false);
    }
  }

  /* =========================================================
     CREATED PAYROLL RUN
  ========================================================= */

  function handlePayrollRunCreated(
    payrollRunId: string
  ) {
    setSelectedPayrollRunId(payrollRunId);
  }

  /* =========================================================
     FORMAT MONEY
  ========================================================= */

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

  /* =========================================================
     FORMAT DATE
  ========================================================= */

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

  /* =========================================================
     STATUS STYLE
  ========================================================= */

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

  /* =========================================================
     PAYROLL RUN DETAILS
  ========================================================= */

  if (selectedPayrollRunId) {
    return (
      <PayrollRunDetails
        payrollRunId={selectedPayrollRunId}
        onBack={() => {
          setSelectedPayrollRunId(null);
          refreshPayrollRuns();
        }}
      />
    );
  }

  /* =========================================================
     DASHBOARD
  ========================================================= */

  const totalRuns = payrollRuns.length;

  const draftRuns = payrollRuns.filter(
    (run) => run.status === "DRAFT"
  ).length;

  const reviewRuns = payrollRuns.filter(
    (run) => run.status === "REVIEW"
  ).length;

  const approvedRuns = payrollRuns.filter(
    (run) =>
      run.status === "APPROVED" ||
      run.status === "LOCKED"
  ).length;

  return (
    <div className="space-y-6 p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold">
            Employee Payroll
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage payroll runs, salaries, deductions
            and employee payments
          </p>
        </div>

        <div className="flex items-center gap-2">

          <Button
            variant="outline"
            onClick={refreshPayrollRuns}
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </Button>

          <CreatePayrollRunDialog
            onCreated={handlePayrollRunCreated}
          />

        </div>
      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

        {/* TOTAL RUNS */}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Payroll Runs
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-blue-50 p-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <p className="text-2xl font-bold">
                  {totalRuns}
                </p>

                <p className="text-xs text-muted-foreground">
                  Total payroll runs
                </p>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* DRAFT */}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Draft
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-gray-100 p-2">
                <CalendarDays className="h-5 w-5 text-gray-600" />
              </div>

              <div>
                <p className="text-2xl font-bold">
                  {draftRuns}
                </p>

                <p className="text-xs text-muted-foreground">
                  Awaiting calculation
                </p>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* REVIEW */}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Review
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-yellow-50 p-2">
                <FileText className="h-5 w-5 text-yellow-600" />
              </div>

              <div>
                <p className="text-2xl font-bold">
                  {reviewRuns}
                </p>

                <p className="text-xs text-muted-foreground">
                  Awaiting approval
                </p>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* APPROVED */}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved / Locked
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-green-50 p-2">
                <Users className="h-5 w-5 text-green-600" />
              </div>

              <div>
                <p className="text-2xl font-bold">
                  {approvedRuns}
                </p>

                <p className="text-xs text-muted-foreground">
                  Ready for payment
                </p>
              </div>

            </div>
          </CardContent>
        </Card>

      </div>

      {/* =====================================================
          PAYROLL RUNS
      ===================================================== */}

      <Card>

        <CardHeader>

          <div className="flex items-center justify-between">

            <div>
              <CardTitle>
                Payroll Runs
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Create and manage employee payroll periods
              </p>
            </div>

            <div className="text-sm text-muted-foreground">
              {payrollRuns.length} run
              {payrollRuns.length !== 1
                ? "s"
                : ""}
            </div>

          </div>

        </CardHeader>

        <CardContent className="p-0">

          {payrollRuns.length === 0 ? (

            <div className="flex flex-col items-center justify-center gap-3 py-16">

              <div className="rounded-full bg-gray-100 p-4">
                <FileText className="h-8 w-8 text-gray-500" />
              </div>

              <div className="text-center">

                <h3 className="font-semibold">
                  No payroll runs
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first payroll run to get started.
                </p>

              </div>

              <CreatePayrollRunDialog
                onCreated={handlePayrollRunCreated}
              />

            </div>

          ) : (

            <div className="overflow-x-auto">

              <Table>

                <TableHeader>
                  <TableRow>

                    <TableHead>
                      Pay Period
                    </TableHead>

                    <TableHead>
                      Pay Date
                    </TableHead>

                    <TableHead>
                      Frequency
                    </TableHead>

                    <TableHead>
                      Employees
                    </TableHead>

                    <TableHead>
                      Gross
                    </TableHead>

                    <TableHead>
                      Deductions
                    </TableHead>

                    <TableHead>
                      Net
                    </TableHead>

                    <TableHead>
                      Status
                    </TableHead>

                    <TableHead className="text-right">
                      Action
                    </TableHead>

                  </TableRow>
                </TableHeader>

                <TableBody>

                  {payrollRuns.map((run) => (

                    <TableRow
                      key={run.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        setSelectedPayrollRunId(
                          run.id
                        )
                      }
                    >

                      {/* PERIOD */}

                      <TableCell>

                        <div className="font-medium">
                          {formatDate(
                            run.periodStart
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          to{" "}
                          {formatDate(
                            run.periodEnd
                          )}
                        </div>

                      </TableCell>

                      {/* PAY DATE */}

                      <TableCell>
                        {formatDate(
                          run.payDate
                        )}
                      </TableCell>

                      {/* FREQUENCY */}

                      <TableCell>
                        {run.payFrequency}
                      </TableCell>

                      {/* EMPLOYEES */}

                      <TableCell>

                        <div className="flex items-center gap-2">

                          <Users className="h-4 w-4 text-muted-foreground" />

                          {run.employeeCount}

                        </div>

                      </TableCell>

                      {/* GROSS */}

                      <TableCell>
                        {formatMoney(
                          run.grossAmount,
                          run.currency
                        )}
                      </TableCell>

                      {/* DEDUCTIONS */}

                      <TableCell>
                        {formatMoney(
                          run.totalDeductions,
                          run.currency
                        )}
                      </TableCell>

                      {/* NET */}

                      <TableCell className="font-semibold">
                        {formatMoney(
                          run.netAmount,
                          run.currency
                        )}
                      </TableCell>

                      {/* STATUS */}

                      <TableCell>

                        <span
                          className={`
                            inline-flex
                            rounded-full
                            px-2.5
                            py-1
                            text-xs
                            font-medium
                            ${statusClass(
                              run.status
                            )}
                          `}
                        >
                          {run.status}
                        </span>

                      </TableCell>

                      {/* ACTION */}

                      <TableCell className="text-right">

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();

                            setSelectedPayrollRunId(
                              run.id
                            );
                          }}
                        >
                          Open

                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>

                      </TableCell>

                    </TableRow>

                  ))}

                </TableBody>

              </Table>

            </div>

          )}

        </CardContent>

      </Card>

    </div>
  );
}