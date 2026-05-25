"use client";

import { updatePosType } from "@/app/(universal)/action/outlet/dbOperation";
import { useState } from "react";

type Props = {
  outletId: string;
  currentType?: string;
};

export default function PosTypeForm({
  outletId,
  currentType,
}: Props) {

  const [posType, setPosType] = useState(
    currentType || "RESTAU" // ✅ default
  );

  return (
    <form action={updatePosType} className="space-y-4">
      <input type="hidden" name="outletId" value={outletId} />

      <label className="block font-medium">POS Type</label>

      <select
        name="posType"
        value={posType}
        onChange={(e) => setPosType(e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="RETAIL">Retail</option>
        <option value="RESTAU">Restaurant POS</option>
        <option value="FAST_FOOD">Fast Food POS</option>
      </select>

      <button className="bg-black text-white px-4 py-2 rounded">
        Save
      </button>
    </form>
  );
}