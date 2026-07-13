"use client";

import { useState } from "react";
 import { useRouter } from "next/navigation";

import { stockBatchToDepartment } from "@/app/(universal)/action/production/stockBatchToDepartment";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;

  batchId: string;

  item: any;
};

export default function ReturnToDepartmentDialog({
  open,
  onClose,
  batchId,
  item,
}: Props) {
  const router = useRouter();
  const [qty, setQty] = useState(0);

  const [loading, setLoading] = useState(false);

  if (!open || !item) return null;

  async function handleSave() {
    if (qty == 0) {
      toast.error("Enter return quantity");
      return;
    }

    if (qty > item.quantity) {
      toast.error("Quantity exceeds batch quantity");
      return;
    }

    setLoading(true);
const numericQty = Number(qty);
    const res = await stockBatchToDepartment({
      batchId,
      itemId: item.id,
     returnQty: numericQty,
    });

    setLoading(false);

    if (res.success) {
      toast.success(res.message);
      onClose();
       router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

        <h2 className="text-xl font-semibold">
          Return Inventory
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          {item.inventoryItemName}
        </p>

        <p className="mt-1 text-sm">
          Available :
          <strong>
            {" "}
            {item.quantity} {item.purchaseUnit}
          </strong>
        </p>

        <div className="mt-5">
          <label className="text-sm font-medium">
            Return Quantity
          </label>

         <input
  type="number"
  step="0.001"
  value={qty === 0 ? "" : qty}
  onChange={(e) => setQty(Number(e.target.value))}
  className="mt-2 w-full rounded-lg border p-2"
/>
        </div>

        <div className="mt-6 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-lg bg-amber-500 px-4 py-2 text-white"
          >
            {loading ? "Returning..." : "Return"}
          </button>

        </div>
      </div>
    </div>
  );
}