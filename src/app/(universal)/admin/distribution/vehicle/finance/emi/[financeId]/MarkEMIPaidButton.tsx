"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";

import { markVehicleEMIPaid } from "@/app/(universal)/action/distribution/vehicle/markVehicleEMIPaid";

type Props = {
  installmentId: string;
};

export default function MarkEMIPaidButton({
  installmentId,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const handlePaid = () => {
    if (!confirm("Mark this EMI as paid?")) {
      return;
    }

    startTransition(async () => {
      const result = await markVehicleEMIPaid(
        installmentId,
        Date.now()
      );

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handlePaid}
      disabled={isPending}
      className="px-3 py-1.5 rounded-lg bg-slate-500 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
    >
      {isPending ? "Saving..." : "PAY"}
    </button>
  );
}