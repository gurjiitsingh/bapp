"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BusinessFinancialField } from "@/lib/types/businessdata/BusinessFinancialField";
import { updateBusinessFinancialField } from "@/app/(universal)/action/businessData/updateBusinessFinancialField";

type Props = {
  open: boolean;
  onClose: () => void;

  field: BusinessFinancialField;
  value: number;
};

export default function EditBusinessFinancialDialog({
  open,
  onClose,
  field,
  value,
}: Props) {
  const router = useRouter();

  const [amount, setAmount] = useState(0);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setAmount(value);
  }, [value]);

  if (!open) return null;

  const labels: Record<BusinessFinancialField, string> = {
    cashInHand: "Cash In Hand",
    cashInBank: "Cash In Bank",
    expenseDue: "Expense Due",
    loans: "Loans",
  };

  async function handleSave() {
    startTransition(async () => {
      const result = await updateBusinessFinancialField(
        field,
        Number(amount)
      );

      if (result.success) {
        router.refresh();
        onClose();
      } else {
        alert(result.message || "Failed to update.");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">

        <div className="border-b px-6 py-4">
          <h2 className="text-xl font-bold">
            Edit {labels[field]}
          </h2>
        </div>

        <div className="space-y-4 p-6">

          <label className="block text-sm font-medium text-gray-700">
            Amount
          </label>

          <input
            type="number"
            value={amount}
            onChange={(e) =>
              setAmount(Number(e.target.value))
            }
            className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-blue-500"
          />

        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-4">

          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-2"
            disabled={isPending}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Save"}
          </button>

        </div>

      </div>
    </div>
  );
}