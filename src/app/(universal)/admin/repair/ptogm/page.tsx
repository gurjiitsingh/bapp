"use client";

import { useState } from "react";

import { convertDepartmentTransactionQuantitiesToGm } from "@/app/(universal)/action/production/departments/convertDepartmentTransactionQuantitiesToGm";

export default function page() {
  const [loading, setLoading] = useState(false);

  async function handleConvert() {
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
      console.error(
        "Conversion error:",
        error
      );

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
      className="h-11 px-5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading
        ? "Converting..."
        : "Convert Old Transactions"}
    </button>
  );
}