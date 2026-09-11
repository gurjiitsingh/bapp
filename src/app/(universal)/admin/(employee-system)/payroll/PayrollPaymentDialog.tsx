"use client";

import { useEffect, useState } from "react";
import { Loader2, WalletCards } from "lucide-react";

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

import {
  payPayrollItem,
  type PayrollPaymentMethod,
} from "@/app/(universal)/action/employee-system/payroll/payrollPaymentActions";
import { PayrollItem } from "@/lib/types/payroll/PayrollItem";

 

type Props = {
  payrollRunId: string;
  item: PayrollItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaid?: () => void;
};

export default function PayrollPaymentDialog({
  payrollRunId,
  item,
  open,
  onOpenChange,
  onPaid,
}: Props) {
  const [paymentMethod, setPaymentMethod] =
    useState<PayrollPaymentMethod>("BANK_TRANSFER");

  const [paymentDate, setPaymentDate] =
    useState("");

  const [reference, setReference] =
    useState("");

  const [paidBy, setPaidBy] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * =========================================================
   * INITIALIZE
   * =========================================================
   */

  useEffect(() => {
    if (!open || !item) {
      return;
    }

    const today =
      new Date().toISOString().slice(0, 10);

    setPaymentMethod("BANK_TRANSFER");
    setPaymentDate(today);
    setReference("");
    setPaidBy("");
    setError("");
  }, [open, item]);

  /*
   * =========================================================
   * VALIDATION
   * =========================================================
   */

  function validate(): string | null {
    if (!payrollRunId.trim()) {
      return "Payroll run ID is required.";
    }

    if (!item) {
      return "Payroll item not found.";
    }

    if (item.status === "PAID") {
      return "This employee has already been paid.";
    }

    if (item.status === "CANCELLED") {
      return "Cancelled payroll cannot be paid.";
    }

    if (!paymentMethod) {
      return "Please select a payment method.";
    }

    if (!paymentDate) {
      return "Please select a payment date.";
    }

    return null;
  }

  /*
   * =========================================================
   * PAY
   * =========================================================
   */

  async function handlePay() {
    setError("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!item) {
      setError("Payroll item not found.");
      return;
    }

    try {
      setLoading(true);

      await payPayrollItem(
        payrollRunId,
        item.employeeId,
        {
          paymentMethod,
          paymentDate,
          reference:
            reference.trim() || undefined,
          paidBy:
            paidBy.trim() || undefined,
        }
      );

      onPaid?.();

      onOpenChange(false);
    } catch (err) {
      console.error(
        "Failed to pay payroll item:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to process payroll payment."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!item) {
    return null;
  }

  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!loading) {
          onOpenChange(value);
        }

        if (!value) {
          setError("");
        }
      }}
    >
      <DialogContent
        className="
          w-[calc(100%-2rem)]
          max-w-[520px]
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
            Pay Employee
          </DialogTitle>

          <DialogDescription className="text-gray-500">
            Record payment for this payroll employee.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* =================================================
              EMPLOYEE
          ================================================= */}

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white p-2 shadow-sm">
                <WalletCards className="h-5 w-5 text-gray-700" />
              </div>

              <div className="min-w-0">
                <p className="font-medium text-gray-900">
                  {item.employeeName}
                </p>

                <p className="text-xs text-gray-500">
                  Employee ID: {item.employeeId}
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              NET PAY
          ================================================= */}

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Net Pay
            </p>

            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {formatMoney(
                item.netAmount,
                item.currency
              )}
            </p>
          </div>

          {/* =================================================
              PAYMENT METHOD
          ================================================= */}

          <div className="space-y-2">
            <Label className="text-gray-700">
              Payment Method
            </Label>

            <Select
              value={paymentMethod}
              onValueChange={(value) =>
                setPaymentMethod(
                  value as PayrollPaymentMethod
                )
              }
            >
              <SelectTrigger
                className="
                  bg-white
                  text-gray-900
                  border-gray-300
                "
              >
                <SelectValue />
              </SelectTrigger>

              <SelectContent className="bg-white">
                <SelectItem value="BANK_TRANSFER">
                  Bank Transfer
                </SelectItem>

                <SelectItem value="CASH">
                  Cash
                </SelectItem>

                <SelectItem value="CHEQUE">
                  Cheque
                </SelectItem>

                <SelectItem value="UPI">
                  UPI
                </SelectItem>

                <SelectItem value="OTHER">
                  Other
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* =================================================
              PAYMENT DATE
          ================================================= */}

          <div className="space-y-2">
            <Label className="text-gray-700">
              Payment Date
            </Label>

            <Input
              type="date"
              value={paymentDate}
              onChange={(e) =>
                setPaymentDate(e.target.value)
              }
              className="
                bg-white
                text-gray-900
                border-gray-300
              "
            />
          </div>

          {/* =================================================
              REFERENCE
          ================================================= */}

          <div className="space-y-2">
            <Label className="text-gray-700">
              Payment Reference
              <span className="ml-1 text-gray-400">
                Optional
              </span>
            </Label>

            <Input
              value={reference}
              onChange={(e) =>
                setReference(e.target.value)
              }
              placeholder="Transaction / cheque / UPI reference"
              className="
                bg-white
                text-gray-900
                border-gray-300
              "
            />
          </div>

          {/* =================================================
              PAID BY
          ================================================= */}

          <div className="space-y-2">
            <Label className="text-gray-700">
              Paid By
              <span className="ml-1 text-gray-400">
                Optional
              </span>
            </Label>

            <Input
              value={paidBy}
              onChange={(e) =>
                setPaidBy(e.target.value)
              }
              placeholder="Admin / Payroll Manager"
              className="
                bg-white
                text-gray-900
                border-gray-300
              "
            />
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              className="
                rounded-md
                border
                border-red-200
                bg-red-50
                px-3
                py-2
                text-sm
                text-red-700
              "
            >
              {error}
            </div>
          )}
        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <DialogFooter className="border-t border-gray-100 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() =>
              onOpenChange(false)
            }
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={loading}
            onClick={handlePay}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Mark as Paid"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/*
 * ===========================================================
 * MONEY FORMATTER
 * ===========================================================
 */

function formatMoney(
  amount: number,
  currency: string
): string {
  try {
    return new Intl.NumberFormat(
      undefined,
      {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }
    ).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}