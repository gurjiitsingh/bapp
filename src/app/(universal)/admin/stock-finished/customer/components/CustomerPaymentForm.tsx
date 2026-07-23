"use client";

import { payCustomerDue } from "@/app/(universal)/action/stock-finished/customer/payCustomerDue";
import { useState } from "react";
import {
  Wallet,
  IndianRupee,
  CreditCard,
  FileText,
  Loader2,
} from "lucide-react";

type PaymentMethod =
  | "CASH"
  | "UPI"
  | "CARD"
  | "CHECK"
  | "BANK_TRANSFER";

export default function CustomerPaymentForm({
  customerId,
  onSuccess,
}: {
  customerId: string;
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CASH");

 async function handleSubmit(
  e: React.FormEvent<HTMLFormElement>
) {
  e.preventDefault();

  const form = e.currentTarget;

  const formData = new FormData(form);
  formData.append("customerId", customerId);

  const amount = Number(formData.get("amount"));

  if (Number.isNaN(amount) || amount <= 0) {
    alert("Please enter a valid payment amount.");
    return;
  }

  setLoading(true);

  try {
    const res = await payCustomerDue(formData);

    if (res?.success) {
      form.reset();

      setPaymentMethod("CASH");

      onSuccess?.();
    } else {
      alert(
        res?.errors?.general ||
        "Something went wrong."
      );
    }
  } finally {
    setLoading(false);
  }
}

  return (
   <form
  onSubmit={handleSubmit}
  className="space-y-6 rounded-xl bg-zinc-100 p-3"
>
  {/* Header */}
  <div className="border-b border-zinc-200 p-4">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
        <Wallet className="h-5 w-5 text-emerald-700" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-zinc-900">
          Receive Payment
        </h2>

        <p className="text-sm text-zinc-500">
          Record a payment received from this customer.
        </p>
      </div>
    </div>
  </div>

  {/* Amount */}
  <div>
    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
      <IndianRupee className="h-4 w-4" />
      Amount
    </label>

    <input
      type="number"
      name="amount"
      min="0.01"
      step="0.01"
      inputMode="decimal"
      placeholder="Enter amount"
      required
      className="
        h-12 w-full rounded-xl
        border border-zinc-300
        bg-white
        px-4
        text-base
        outline-none
        transition
        focus:border-emerald-500
        focus:ring-4
        focus:ring-emerald-100
      "
    />
  </div>

  {/* Payment Method */}
  <div>
    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
      <CreditCard className="h-4 w-4" />
      Payment Method
    </label>

    <select
      name="paymentMethod"
      value={paymentMethod}
      onChange={(e) =>
        setPaymentMethod(e.target.value as any)
      }
      className="
        h-12 w-full rounded-xl
        border border-zinc-300
        bg-white
        px-4
        text-sm
        outline-none
        transition
        focus:border-emerald-500
        focus:ring-4
        focus:ring-emerald-100
      "
    >
      <option value="CASH">Cash</option>
      <option value="UPI">UPI</option>
      <option value="CARD">Card</option>
      <option value="CHECK">Cheque</option>
      <option value="BANK_TRANSFER">
        Bank Transfer
      </option>
    </select>
  </div>

  {/* UPI */}
  {paymentMethod === "UPI" && (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700">
        UPI Reference Number
      </label>

      <input
        type="text"
        name="referenceNumber"
        placeholder="Enter UPI reference number"
        required
        className="
          h-12 w-full rounded-xl
          border border-zinc-300
          bg-white
          px-4
          text-sm
          outline-none
          transition
          focus:border-emerald-500
          focus:ring-4
          focus:ring-emerald-100
        "
      />
    </div>
  )}

  {/* Card */}
  {paymentMethod === "CARD" && (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700">
        Transaction Number
      </label>

      <input
        type="text"
        name="referenceNumber"
        placeholder="Enter card transaction number"
        required
        className="
          h-12 w-full rounded-xl
          border border-zinc-300
          bg-white
          px-4
          text-sm
          outline-none
          transition
          focus:border-emerald-500
          focus:ring-4
          focus:ring-emerald-100
        "
      />
    </div>
  )}

  {/* Cheque */}
  {paymentMethod === "CHECK" && (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700">
          Cheque Number
        </label>

        <input
          type="text"
          name="referenceNumber"
          placeholder="Enter cheque number"
          required
          className="
            h-12 w-full rounded-xl
            border border-zinc-300
            bg-white
            px-4
          "
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700">
          Bank Name
        </label>

        <input
          type="text"
          name="bankName"
          placeholder="Enter bank name"
          required
          className="
            h-12 w-full rounded-xl
            border border-zinc-300
            bg-white
            px-4
          "
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-zinc-700">
          Cheque Date
        </label>

        <input
          type="date"
          name="paymentDate"
          required
          className="
            h-12 w-full rounded-xl
            border border-zinc-300
            bg-white
            px-4
          "
        />
      </div>
    </div>
  )}

  {/* Bank Transfer */}
  {paymentMethod === "BANK_TRANSFER" && (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700">
          UTR / Reference Number
        </label>

        <input
          type="text"
          name="referenceNumber"
          placeholder="Enter UTR number"
          required
          className="
            h-12 w-full rounded-xl
            border border-zinc-300
            bg-white
            px-4
          "
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700">
          Bank Name
        </label>

        <input
          type="text"
          name="bankName"
          placeholder="Enter bank name"
          required
          className="
            h-12 w-full rounded-xl
            border border-zinc-300
            bg-white
            px-4
          "
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-zinc-700">
          Transfer Date
        </label>

        <input
          type="date"
          name="paymentDate"
          required
          className="
            h-12 w-full rounded-xl
            border border-zinc-300
            bg-white
            px-4
          "
        />
      </div>
    </div>
  )}

  {/* Note */}
  <div>
    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
      <FileText className="h-4 w-4" />
      Note
    </label>

    <textarea
      name="note"
      rows={3}
      placeholder="Optional note..."
      className="
        w-full rounded-xl
        border border-zinc-300
        bg-white
        p-4
        text-sm
        resize-none
        outline-none
        transition
        focus:border-emerald-500
        focus:ring-4
        focus:ring-emerald-100
      "
    />
  </div>

  {/* Submit */}
  <button
    type="submit"
    disabled={loading}
    className="
      flex h-12 w-full items-center justify-center gap-2
      rounded-xl
      bg-slate-600
      font-medium
      text-white
      transition-all
      hover:bg-emerald-700
      disabled:cursor-not-allowed
      disabled:opacity-60
    "
  >
    {loading ? (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        Processing...
      </>
    ) : (
      <>
        <Wallet className="h-4 w-4" />
        Receive Payment
      </>
    )}
  </button>
</form>
  );
}