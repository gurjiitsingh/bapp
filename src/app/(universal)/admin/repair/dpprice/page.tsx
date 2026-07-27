"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateAllDepartmentAverageCosts } from "@/app/(universal)/action/production/departments/priceUpdte/updateDepartmentAverageCostForInventoryItem";

 
export default function Page() {
  const [inventoryItemId, setInventoryItemId] =
    useState("EZWrGmvKAn14tZAITIN3");

  const [isUpdating, setIsUpdating] =
    useState(false);

  async function handleUpdate() {
    if (!inventoryItemId.trim()) {
      alert("Inventory item ID is required.");
      return;
    }

    if (isUpdating) return;

    setIsUpdating(true);

    try {
      const result =
        await updateAllDepartmentAverageCosts();

      console.log(
        "Department stock cost update result:",
        result
      );

      if (!result.success) {
        alert(result.message);
        return;
      }

      alert(result.message);
    } catch (error) {
      console.error(
        "Failed to update department costs:",
        error
      );

      alert(
        "Something went wrong while updating department costs."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">
            Update Department Price
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            This will update the average cost of this
            inventory item across all departments.
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Inventory Item ID
            </label>

            <input
              type="text"
              value={inventoryItemId}
              onChange={(e) =>
                setInventoryItemId(e.target.value)
              }
              className="h-11 rounded-lg border border-gray-300 px-3 outline-none focus:border-blue-500"
              placeholder="Enter inventory item ID"
            />
          </div>

          <Button
            type="button"
            onClick={handleUpdate}
            disabled={isUpdating}
            className="mt-6 w-full h-11"
          >
            {isUpdating
              ? "Updating Department Prices..."
              : "Update Department Prices"}
          </Button>
        </div>
      </div>
    </div>
  );
}