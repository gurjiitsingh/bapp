"use client";

import { useState } from "react";
import { ArrowLeft, Scale, Save } from "lucide-react";
import { customerBalanceAdjustment } from "@/app/(universal)/action/stock-finished/customer/customerBalanceAdjustment";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";


type CustomerAccountType = {
  customerId: string;
  wholeSaleCutomerName?: string;
  balance?: number;
};

export default function BalanceAdjustmentForm({
  account,
  customerId,
}: {
  account: CustomerAccountType;
  customerId: string;
}) {
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    formData.append("customerId", customerId);

    try {
      setSaving(true);

      const result = await customerBalanceAdjustment(formData);

      if (result?.errors?.general) {
        toast.error(result.errors.general);
        return;
      }

      // toast.success(result.message);

      console.log(Object.fromEntries(formData));

      form.reset();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl   space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>


          <h1 className="text-2xl font-bold text-zinc-800">
            Balance Adjustment
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Manually adjust the customer's outstanding balance.
          </p>
        </div>
          <button
      type="button"
      onClick={() => router.back()}
      className="mb-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
      </div>

      {/* Customer */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">
              Customer
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              {account.wholeSaleCutomerName}
            </h2>
          </div>

          <div className="text-right">
            <p className="text-sm text-zinc-500">
              Current Balance
            </p>

            <p
              className={`text-3xl font-bold ${(account.balance ?? 0) > 0
                  ? "text-red-600"
                  : (account.balance ?? 0) < 0
                    ? "text-green-600"
                    : "text-zinc-700"
                }`}
            >
              ₹ {(account.balance ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* Adjustment Type */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Adjustment
            </label>

            <select
              name="adjustmentType"
              className="h-11 w-full rounded-lg border border-slate-200 px-3"
              defaultValue="INCREASE"
            >
              <option value="INCREASE">
                Increase Due (+)
              </option>

              <option value="DECREASE">
                Reduce Due (-)
              </option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Amount
            </label>

            <input
              type="number"
              name="amount"
              step="0.01"
              min="0"
              required
              className="h-11 w-full rounded-lg border border-slate-200 px-3"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Reason
          </label>

          <textarea
            name="reason"
            rows={4}
            required
            placeholder="Example: Previous software balance correction, write-off approved by manager, accounting adjustment..."
            className="w-full rounded-lg border border-slate-200 p-3"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-600 px-6 py-3 font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />

            {saving
              ? "Saving..."
              : "Save Adjustment"}
          </button>
        </div>
      </form>

      {/* Information */}
      <div className="rounded-2xl border border-slate-200 bg-amber-50 border border-slate-200-amber-200 p-5">
        <div className="flex gap-3">
          <Scale className="mt-0.5 h-5 w-5 text-amber-700" />

          <div>
            <h3 className="font-medium text-amber-900">
              Balance Adjustment
            </h3>

            <p className="mt-1 text-sm text-amber-800">
              This feature should only be used for manual accounting
              corrections. Every adjustment creates a permanent
              <strong> BALANCE_ADJUSTMENT </strong>
              transaction in the customer ledger to maintain a complete audit
              trail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}