"use client";

import { paySupplierDue } from "@/app/(universal)/action/inventorySupplier/paySupplierDue";
import { useState } from "react";


export default function CustomerPaymentForm({
  customerId ,
  onSuccess,
}: {
  customerId : string;
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();

    const formData = new FormData(e.target);

    formData.append("customerId ", customerId );

    setLoading(true);

    const res = await paySupplierDue(formData);

    if (res?.success) {
      e.target.reset();
      onSuccess?.();
    } else {
      alert(
        res?.errors?.general ||
          res?.errors?.amount ||
          "Error"
      );
    }

    setLoading(false);
  }

return (
  <form
    onSubmit={handleSubmit}
    className="border rounded-md px-3 py-2 bg-white flex flex-col gap-2"
  >
    {/* HEADER */}
    <div className="flex justify-between items-center">
      <h3 className="text-sm font-semibold">
        Pay Supplier
      </h3>
    </div>

    {/* ROW: AMOUNT + METHOD */}
    <div className="flex gap-2">
      <input
        type="number"
        name="amount"
        placeholder="Amount"
        className="border rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-black"
      />

      <select
        name="paymentMethod"
        className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black"
      >
        <option value="CASH">Cash</option>
        <option value="UPI">UPI</option>
        <option value="CARD">Card</option>
      </select>
    </div>

    {/* NOTE (SMALL) */}
    <textarea
      name="note"
      placeholder="Note (optional)"
      rows={1}
      className="border rounded px-2 py-1 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-black"
    />

    {/* BUTTON */}
    <button
      type="submit"
      disabled={loading}
      className="bg-black text-white py-1.5 rounded text-sm hover:opacity-90 transition"
    >
      {loading ? "Processing..." : "Pay"}
    </button>
  </form>
);
}