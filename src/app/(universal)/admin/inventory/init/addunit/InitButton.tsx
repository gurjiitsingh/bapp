"use client";

import { initDefaultUnitConversions } from "@/app/(universal)/action/inventory/init/unit-conversion/initDefaultUnitConversions";
import { useState } from "react";


export default function InitButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);

    try {
      const result =
        await initDefaultUnitConversions();

      alert(result.message);
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }

    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-5 py-3 bg-blue-600 text-white rounded-lg"
    >
      {loading
        ? "Initializing..."
        : "Initialize Unit Conversions"}
    </button>
  );
}