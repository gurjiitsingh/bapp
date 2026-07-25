"use client";

import { useState } from "react";
import { ArrowLeft, Scale, Save } from "lucide-react";
 
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { supplierBalanceAdjustment } from "@/app/(universal)/action/inventoryItemSupplier/supplierBalanceAdjustment";

type SupplierAccountType = {
  supplierId: string;
  supplierName?: string;
  balance?: number;
  creditBalance?: number;
};

export default function BalanceAdjustmentForm({
  account,
  supplierId,
}: {
  account: SupplierAccountType;
  supplierId: string;
}) {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    formData.append("supplierId", supplierId);

    try {
      setSaving(true);

      const result = await supplierBalanceAdjustment(
        formData
      );

      if (result?.errors?.general) {
        toast.error(result.errors.general);
        return;
      }

      toast.success(
        result?.message || "Balance adjusted successfully."
      );

      form.reset();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">
            Supplier Balance Adjustment
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Manually adjust the supplier's outstanding balance.
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

      {/* Supplier */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">
              Supplier
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              {account.supplierName}
            </h2>
          </div>

          <div className="text-right space-y-2">
            <div>
              <p className="text-sm text-zinc-500">
                Current Due
              </p>

              <p
                className={`text-3xl font-bold ${
                  (account.balance ?? 0) > 0
                    ? "text-red-600"
                    : "text-zinc-700"
                }`}
              >
                ₹ {(account.balance ?? 0).toLocaleString()}
              </p>
            </div>

            {(account.creditBalance ?? 0) > 0 && (
              <div>
                <p className="text-sm text-zinc-500">
                  Advance Paid
                </p>

                <p className="text-xl font-semibold text-green-600">
                  ₹{" "}
                  {(
                    account.creditBalance ?? 0
                  ).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Adjustment
            </label>

            <select
              name="adjustmentType"
              defaultValue="INCREASE"
              className="h-11 w-full rounded-lg border border-slate-200 px-3"
            >
              <option value="INCREASE">
                Increase Due (+)
              </option>

              <option value="DECREASE">
                Reduce Due (-)
              </option>
            </select>
          </div>

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
              placeholder="0.00"
              className="h-11 w-full rounded-lg border border-slate-200 px-3"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Reason
          </label>

          <textarea
            name="reason"
            rows={4}
            required
            placeholder="Example: Opening balance correction, supplier statement adjustment, accounting correction..."
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
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex gap-3">
          <Scale className="mt-0.5 h-5 w-5 text-amber-700" />

          <div>
            <h3 className="font-medium text-amber-900">
              Supplier Balance Adjustment
            </h3>

            <p className="mt-1 text-sm text-amber-800">
              This feature should only be used for manual accounting
              corrections. Every adjustment creates a permanent{" "}
              <strong>BALANCE_ADJUSTMENT</strong> transaction
              in the supplier ledger to maintain a complete audit
              trail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}