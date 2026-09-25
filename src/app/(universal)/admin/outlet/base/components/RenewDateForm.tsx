"use client";

 
import { updateRenewDate } from "@/app/(universal)/action/outlet/updateRenewDate";
import { useState } from "react";

type Props = {
  outletId: string;
  currentRenewDate?: string;
};

export default function RenewDateForm({
  outletId,
  currentRenewDate,
}: Props) {
  const [renewDate, setRenewDate] = useState(
    currentRenewDate || ""
  );

  return (
    <form
      action={updateRenewDate}
      className="space-y-4"
    >
      <input
        type="hidden"
        name="outletId"
        value={outletId}
      />

      <div>
        <label className="block font-medium">
          POS Renew Date
        </label>

        <input
          type="date"
          name="renewDate"
          value={renewDate}
          onChange={(e) => setRenewDate(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      <button
        type="submit"
        className="bg-black text-white px-4 py-2 rounded"
      >
        Save Renew Date
      </button>
    </form>
  );
}