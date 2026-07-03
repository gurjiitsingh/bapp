"use client";

import {
  ShoppingCart,
  RotateCcw,
} from "lucide-react";

type Props = {
  onSale: () => void;
  onReturn: () => void;
};

export default function HomeCards({
  onSale,
  onReturn,
}: Props) {
  return (
    <div className="p-4 space-y-5">

      <button
        onClick={onSale}
        className="w-full rounded-3xl  bg-white p-6 text-left shadow-sm active:scale-[0.98] transition"
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
          <ShoppingCart className="text-green-700" />
        </div>

        <h2 className="text-xl font-bold">
          Sales
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Create sales invoice
        </p>
      </button>

      <button
        onClick={onReturn}
        className="w-full rounded-3xl   bg-white p-6 text-left shadow-sm active:scale-[0.98] transition"
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100">
          <RotateCcw className="text-orange-700" />
        </div>

        <h2 className="text-xl font-bold">
          Customer Returns
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Receive returned items
        </p>
      </button>

    </div>
  );
}