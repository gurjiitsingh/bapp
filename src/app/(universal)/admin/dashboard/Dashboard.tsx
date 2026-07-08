"use client";

type BusinessSummaryResponse = {
  success: boolean;
  data?: {
    rawMaterialValue: number;
    finishedProductValue: number;
    customerDue: number;
    supplierDue: number;
    cashInHand: number;
  };
  message?: string;
};

export default function Dashboard({
  summary,
}: {
  summary: BusinessSummaryResponse;
}) {
  if (!summary.success || !summary.data) {
    return (
      <div className="p-6 text-red-500">
        {summary.message || "Failed to load dashboard."}
      </div>
    );
  }

  const data = summary.data;

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">

      <Card
        title="Raw Material Value"
        value={data.rawMaterialValue}
      />

      <Card
        title="Finished Product Value"
        value={data.finishedProductValue}
      />

      <Card
        title="Customer Due"
        value={data.customerDue}
      />

      <Card
        title="Supplier Due"
        value={data.supplierDue}
      />

      <Card
        title="Cash In Hand"
        value={data.cashInHand}
      />

    </div>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        ₹{value.toLocaleString()}
      </h2>

    </div>
  );
}