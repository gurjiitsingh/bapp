"use client";

import { paySupplierDue } from "@/app/(universal)/action/inventorySupplier/paySupplierDue";
import { useState } from "react";

import {
  Wallet,
  IndianRupee,
  CreditCard,
  FileText,
  Loader2,
} from "lucide-react";

export default function SupplierPaymentForm({
  supplierId,
  onSuccess,
}: {
  supplierId: string;
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();

    const formData = new FormData(e.target);

    formData.append(
      "supplierId",
      supplierId
    );

    setLoading(true);

    const res =
      await paySupplierDue(formData);

    if (res?.success) {
      e.target.reset();
      onSuccess?.();
    } else {
      alert(
        res?.errors?.general ||
          res?.errors?.amount ||
          "Something went wrong."
      );
    }

    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-zinc-100 p-3 rounded-xl"
    >
      {/* Header */}
      <div className="border-b border-zinc-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
            <Wallet className="h-5 w-5 text-amber-700" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Pay Supplier
            </h2>

            <p className="text-sm text-zinc-500">
              Record a payment made to this supplier.
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
            focus:border-amber-500
            focus:ring-4
            focus:ring-amber-100
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
          className="
            h-12 w-full rounded-xl
            border border-zinc-300
            bg-white
            px-4
            text-sm
            outline-none
            transition
            focus:border-amber-500
            focus:ring-4
            focus:ring-amber-100
          "
        >
          <option value="CASH">
            Cash
          </option>
          <option value="UPI">
            UPI
          </option>
          <option value="CARD">
            Card
          </option>
        </select>
      </div>

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
            focus:border-amber-500
            focus:ring-4
            focus:ring-amber-100
          "
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="
          flex h-12 w-full items-center justify-center gap-2
          rounded-xl
          bg-slate-600
          text-white
          font-medium
          transition-all
          hover:bg-amber-700
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
            Pay Supplier
          </>
        )}
      </button>
    </form>
  );
}