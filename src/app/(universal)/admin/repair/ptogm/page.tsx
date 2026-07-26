"use client";

import { convertDepartmentTransactionQuantitiesToGm } from "@/app/(universal)/action/production/departments/convertDepartmentTransactionQuantitiesToGm";
import { useState } from "react";
 
export default function ConvertTransactionsButton() {
  const [loading, setLoading] = useState(false);

  async function page() {
    const confirmed = confirm(
      "This will permanently convert matching transaction quantities to consumption units. Continue?"
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const result =
        await convertDepartmentTransactionQuantitiesToGm();

      if (result.success) {
        alert(
          `Successfully updated ${result.updated} transactions.`
        );
      } else {
        alert(
          result.message ||
            "Failed to convert transactions."
        );
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleConvert}
      disabled={loading}
      className="h-11 px-5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
    >
      {loading
        ? "Converting..."
        : "Convert Old Transactions"}
    </button>
  );
}