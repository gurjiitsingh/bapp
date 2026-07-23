"use client";

import { useState } from "react";
import { Wallet, Save } from "lucide-react";
import toast from "react-hot-toast";
import { customerOpeningBalance } from "@/app/(universal)/action/stock-finished/customer/customerOpeningBalance";
 


type CustomerAccountType = {
  customerId: string;
  wholeSaleCutomerName?: string;
  balance?: number;
};

export default function OpeningBalanceForm({
  account,
  customerId,
}: {
  account: CustomerAccountType;
  customerId: string;
}) {
  const [saving, setSaving] = useState(false);

  const handleOpeningBalance = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const form = e.currentTarget;

    const formData = new FormData(form);

    formData.append("customerId", customerId);
    formData.append(
      "amount",
      String(formData.get("openingBalance") || 0)
    );

    try {
      setSaving(true);

      const result = await customerOpeningBalance(formData);

      if (result?.errors?.general) {
        toast.error(result.errors.general);
        return;
      }

      toast.success(
        result?.message ||
          "Opening balance saved successfully."
      );

      form.reset();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save opening balance.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-800">
          Opening Balance
        </h1>

        <p className="text-sm text-zinc-500 mt-1">
          Set the opening balance for this customer account.
        </p>
      </div>

      {/* Customer Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">
              Customer
            </p>

            <h2 className="text-xl font-semibold mt-1">
              {account.wholeSaleCutomerName}
            </h2>
          </div>

          <div className="text-right">
            <p className="text-sm text-zinc-500">
              Current Balance
            </p>

            <p
              className={`text-3xl font-bold ${
                (account.balance ?? 0) > 0
                  ? "text-rose-600"
                  : (account.balance ?? 0) < 0
                  ? "text-emerald-600"
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
        onSubmit={handleOpeningBalance}
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Opening Balance
          </label>

          <input
            type="number"
            step="0.01"
            name="openingBalance"
            defaultValue={account.balance ?? 0}
            className="h-11 w-full rounded-lg border border-zinc-300 px-4 text-lg focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none"
          />

          <p className="mt-2 text-sm text-zinc-500">
            Enter a positive value if the customer owes you.
            Enter a negative value if the customer has credit.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-600 px-6 py-3 text-white font-medium hover:bg-slate-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />

            {saving
              ? "Saving..."
              : "Save Opening Balance"}
          </button>
        </div>
      </form>

      {/* Info */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex gap-3">
          <Wallet className="mt-0.5 h-5 w-5 text-slate-600" />

          <div>
            <h3 className="font-medium">
              Opening Balance
            </h3>

            <p className="mt-1 text-sm text-zinc-600">
              This should be entered only once when setting up an existing
              customer account. Saving it will initialize the customer's
              account balance and create an <strong>OPENING_BALANCE</strong>{" "}
              entry in the customer ledger.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}