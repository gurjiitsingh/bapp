"use client";
import { BusinessFinancialField } from "@/lib/types/businessdata/BusinessFinancialField";
type FinanceItem = {
  label: string;
  value: number;

  editable?: boolean;

  field?: BusinessFinancialField
};

type FinanceCardProps = {
  title: string;
  total: number;
  color: "green" | "red";
  items: FinanceItem[];

  onEdit?: (
    field: BusinessFinancialField,
    value: number
  ) => void;
};

export default function FinanceCard({
  title,
  total,
  color = "green",
  items,
  onEdit,
}: FinanceCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-slate-300 p-5">
        <h2 className="text-lg font-bold">{title}</h2>
      </div>

      <div className="divide-y">
     {items.map((item) => (
  <div
    key={item.label}
    className="flex items-center border-slate-200 justify-between p-4"
  >
    <span className="text-gray-600">{item.label}</span>

    <div className="flex items-center gap-2">
      <span className="font-semibold">
        ₹{Number(item.value ?? 0).toLocaleString("en-IN")}
      </span>

      {item.editable && (
        <button
          type="button"
          onClick={() =>
            item.field &&
            onEdit?.(item.field, Number(item.value ?? 0))
          }
          className="text-blue-500 hover:text-blue-700"
        >
          ✏️
        </button>
      )}
    </div>
  </div>
))}
      </div>

      <div className="flex items-center justify-between bg-gray-50 p-5">
        <span className="font-bold">Total</span>

        <span
          className={`text-2xl font-bold ${
            color === "green"
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          ₹{total.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}