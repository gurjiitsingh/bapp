"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startFaultRepair } from "../../action/maintenance/startFaultRepair";
import { resolveFault } from "../../action/maintenance/resolveFault";
import { closeFault } from "../../action/maintenance/closeFault";

 

type Props = {
  faultId: string;
  status: string;
};

export default function FaultWorkflowActions({
  faultId,
  status,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const runAction = async (
    action: () => Promise<{
      success: boolean;
      message: string;
    }>
  ) => {
    try {
      setLoading(true);
      setError("");

      const result = await action();

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {(status === "OPEN" ||
          status === "ASSIGNED") && (
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              runAction(() =>
                startFaultRepair(
                  faultId
                )
              )
            }
            className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : "Start Repair"}
          </button>
        )}

        {status === "IN_PROGRESS" && (
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              runAction(() =>
                resolveFault(faultId)
              )
            }
            className="rounded-md bg-green-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : "Resolve Fault"}
          </button>
        )}

        {status === "RESOLVED" && (
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              runAction(() =>
                closeFault(faultId)
              )
            }
            className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : "Close Fault"}
          </button>
        )}
      </div>
    </div>
  );
}