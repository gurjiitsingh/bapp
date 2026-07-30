"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { syncAverageCostFromPurchaseUnitCost } from "@/app/(universal)/action/inventory/repair/syncAverageCostFromPurchaseUnitCost";

 
export default function Page() {
  const [loading, setLoading] = useState(false);

  async function handleSync() {
    const confirmSync = confirm(
      "This will copy purchaseUnitCost to averageCost and costPrice for ALL inventory items.\n\nContinue?"
    );

    if (!confirmSync) return;

    try {
      setLoading(true);

      const result =
        await syncAverageCostFromPurchaseUnitCost();

      if (!result.success) {
        alert(result.message);
        return;
      }

      alert(result.message);

      console.log(
        "Sync Result:",
        result
      );
    } catch (error) {
      console.error(error);

      alert(
        "Failed to synchronize average costs."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-20 rounded-2xl border bg-white p-8 shadow">
      <h1 className="text-2xl font-bold mb-3">
        Repair Inventory Average Cost
      </h1>

      <p className="text-gray-600 mb-6">
        This will update <b>all inventory items</b> by copying
        <b> purchaseUnitCost</b> into
        <b> averageCost</b> and
        <b> costPrice</b>.
      </p>

      <Button
        onClick={handleSync}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {loading
          ? "Updating..."
          : "Sync Average Cost"}
      </Button>
    </div>
  );
}