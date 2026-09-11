"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  Lock,
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
import { PayrollRun } from "@/lib/types/payroll/PayrollRun";
import { PayrollItem } from "@/lib/types/payroll/PayrollItem";
import { approvePayrollRun, getPayrollRun, lockPayrollRun } from "../../../action/employee-system/payroll/payrollRunActions";
import { getPayrollItems } from "../../../action/employee-system/payroll/payrollItemActions";
import { calculatePayrollRun } from "../../../action/employee-system/payroll/payrollCalculationActions";
import PayrollPaymentDialog from "./PayrollPaymentDialog";
import Payslip from "./Payslip";

type Props = {
  payrollRunId: string;
  onBack?: () => void;
};

export default function PayrollRunDetails({
  payrollRunId,
  onBack,
}: Props) {
  const [payrollRun, setPayrollRun] = useState<PayrollRun | null>(null);
  const [items, setItems] = useState<PayrollItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPayrollItem, setSelectedPayrollItem] =
    useState<PayrollItem | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] =
    useState(false);
  const [showPayslip, setShowPayslip] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] =
    useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [run, payrollItems] = await Promise.all([
        getPayrollRun(payrollRunId),
        getPayrollItems(payrollRunId),
      ]);

      if (!run) {
        setError("Payroll run not found.");
        setPayrollRun(null);
        setItems([]);
        return;
      }

      setPayrollRun(run);
      setItems(payrollItems);
    } catch (err) {
      console.error("Failed to load payroll run:", err);
      setError("Failed to load payroll run.");
    } finally {
      setLoading(false);
    }
  }, [payrollRunId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleCalculate() {
    try {
      setActionLoading(true);
      setError("");

      await calculatePayrollRun(payrollRunId);

      await loadData();
    } catch (err) {
      console.error("Payroll calculation failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Payroll calculation failed."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleApprove() {
    try {
      setActionLoading(true);
      setError("");

      await approvePayrollRun(
        payrollRunId,
        "SYSTEM"
      );

      await loadData();
    } catch (err) {
      console.error("Payroll approval failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Payroll approval failed."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleLock() {
    try {
      setActionLoading(true);
      setError("");

      await lockPayrollRun(payrollRunId);

      await loadData();
    } catch (err) {
      console.error("Payroll lock failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Payroll lock failed."
      );
    } finally {
      setActionLoading(false);
    }
  }

  function formatMoney(amount: number) {
    if (!payrollRun) return amount.toFixed(2);

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: payrollRun.currency,
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

  function statusClass(status: PayrollRun["status"]) {
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
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!payrollRun) {
    return (
      <div className="space-y-4 p-6">
        <Button
          variant="outline"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="rounded-lg border border-slate-100 p-6 text-center text-red-600">
          {error || "Payroll run not found."}
        </div>
      </div>
    );
  }

  if (showPayslip && selectedEmployeeId) {
  return (
    <Payslip
      payrollRunId={payrollRunId}
      employeeId={selectedEmployeeId}
      onBack={() => {
        setShowPayslip(false);
        setSelectedEmployeeId(null);
      }}
    />
  );
}

  return (
    <div className="space-y-6 p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

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
              Payroll Run
            </h1>

            <p className="text-sm text-muted-foreground">
              {payrollRun.periodStart} →{" "}
              {payrollRun.periodEnd}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">

          <Button
            variant="outline"
            onClick={loadData}
            disabled={loading || actionLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          {payrollRun.status === "DRAFT" && (
            <Button
              onClick={handleCalculate}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Calculator className="mr-2 h-4 w-4" />
              )}

              Calculate Payroll
            </Button>
          )}

          {payrollRun.status === "REVIEW" && (
            <Button
              onClick={handleApprove}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}

              Approve Payroll
            </Button>
          )}

          {payrollRun.status === "APPROVED" && (
            <Button
              onClick={handleLock}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lock className="mr-2 h-4 w-4" />
              )}

              Lock Payroll
            </Button>
          )}
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          RUN INFORMATION
      ===================================================== */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>

          <CardContent>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusClass(
                payrollRun.status
              )}`}
            >
              {payrollRun.status}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pay Period
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="font-semibold">
              {formatDate(payrollRun.periodStart)}
            </div>

            <div className="text-sm text-muted-foreground">
              to {formatDate(payrollRun.periodEnd)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pay Date
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="font-semibold">
              {formatDate(payrollRun.payDate)}
            </div>

            <div className="text-sm text-muted-foreground">
              {payrollRun.payFrequency}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Employees
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-2 text-xl font-bold">
              <Users className="h-5 w-5" />
              {payrollRun.employeeCount}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* =====================================================
          PAYROLL TOTALS
      ===================================================== */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gross Payroll
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-xl font-bold">
              {formatMoney(payrollRun.grossAmount)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Deductions
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-xl font-bold">
              {formatMoney(payrollRun.totalDeductions)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Employer Contributions
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-xl font-bold">
              {formatMoney(
                payrollRun.employerContributions
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Payroll
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-xl font-bold">
              {formatMoney(payrollRun.netAmount)}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* =====================================================
          PAYROLL ITEMS
      ===================================================== */}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Employee Payroll
            </CardTitle>

            <span className="text-sm text-muted-foreground">
              {items.length} employee
              {items.length !== 1 ? "s" : ""}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">

          {items.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No payroll items found.
              <br />

              {payrollRun.status === "DRAFT" && (
                <span>
                  Click <strong>Calculate Payroll</strong> to
                  generate employee payroll.
                </span>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">

              <Table>

                <TableHeader>
                  <TableRow>

                    <TableHead>
                      Employee
                    </TableHead>

                    <TableHead className="text-right">
                      Working Days
                    </TableHead>

                    <TableHead className="text-right">
                      Paid Days
                    </TableHead>

                    <TableHead className="text-right">
                      OT Hours
                    </TableHead>

                    <TableHead className="text-right">
                      Gross
                    </TableHead>

                    <TableHead className="text-right">
                      Deductions
                    </TableHead>

                    <TableHead className="text-right">
                      Net
                    </TableHead>

                    <TableHead>
                      Status
                    </TableHead>

                    <TableHead className="text-right">
                      Actions
                    </TableHead>

                  </TableRow>
                </TableHeader>

                <TableBody>

                  {items.map((item) => (
                    <TableRow key={item.id}>

                      <TableCell>
                        <div className="font-medium">
                          {item.employeeName}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {item.employeeId}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        {item.workingDays}
                      </TableCell>

                      <TableCell className="text-right">
                        {item.paidDays}
                      </TableCell>

                      <TableCell className="text-right">
                        {item.overtimeHours}
                      </TableCell>

                      <TableCell className="text-right font-medium">
                        {formatMoney(item.grossAmount)}
                      </TableCell>

                      <TableCell className="text-right">
                        {formatMoney(
                          item.totalDeductions
                        )}
                      </TableCell>

                      <TableCell className="text-right font-semibold">
                        {formatMoney(item.netAmount)}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`
                            inline-flex
                            rounded-full
                            px-2.5
                            py-1
                            text-xs
                            font-medium
                            ${item.status === "PAID"
                              ? "bg-green-100 text-green-700"
                              : item.status === "APPROVED"
                                ? "bg-blue-100 text-blue-700"
                                : item.status === "CANCELLED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }
                          `}
                        >
                          {item.status}
                        </span>
                      </TableCell>

                   <TableCell className="text-right">
  {payrollRun.status === "LOCKED" &&
    item.status === "PENDING" && (
      <Button
        size="sm"
        onClick={() => {
          setSelectedPayrollItem(item);
          setShowPaymentDialog(true);
        }}
      >
        Pay
      </Button>
    )}

  {item.status === "PAID" && (
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        setSelectedEmployeeId(item.employeeId);
        setShowPayslip(true);
      }}
    >
      View Payslip
    </Button>
  )}
</TableCell>
                    </TableRow>
                  ))}

                </TableBody>

              </Table>
            </div>
          )}

        </CardContent>
      </Card>
      <PayrollPaymentDialog
        payrollRunId={payrollRun.id}
        item={selectedPayrollItem}
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        onPaid={loadData}
      />

      
    </div>
  );
}