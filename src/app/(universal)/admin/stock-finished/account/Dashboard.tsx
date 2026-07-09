"use client";

import FinanceCard from "./FinanceCard";
import { useState } from "react";
import { BusinessFinancialField } from "@/lib/types/businessdata/BusinessFinancialField";
import EditBusinessFinancialDialog from "./EditBusinessFinancialDialog";


type BusinessSummary = {
  rawMaterialValue: number;
  finishedProductValue: number;
};
type BusinessFinancialSummary = {
  cashInHand: number;
  cashInBank: number;
  expenseDue: number;
  loans: number;
};

type CustomerSummary = {
  amountToReceive: number;
  amountToPay: number;
};

type SupplierSummary = {
  supplierDue: number;
  supplierAdvance: number;
};

export default function Dashboard({
  summary,
  customerSummary,
  supplierSummary,
  financialSummary,
}: {
  summary: BusinessSummary;
  customerSummary: CustomerSummary;
  supplierSummary: SupplierSummary;
  financialSummary: BusinessFinancialSummary;
}) {

  const [open, setOpen] = useState(false);

  const [selectedField, setSelectedField] =
    useState<BusinessFinancialField>("cashInHand");

  const [selectedValue, setSelectedValue] = useState(0);

  const totalAssets =
    summary.rawMaterialValue +
    summary.finishedProductValue +
    financialSummary.cashInHand +
    financialSummary.cashInBank +
    customerSummary.amountToReceive +
    supplierSummary.supplierAdvance;

  const totalPayable =
    supplierSummary.supplierDue +
    customerSummary.amountToPay +
    financialSummary.expenseDue +
    financialSummary.loans;

  return (
    <div className="space-y-8">
      <EditBusinessFinancialDialog
        open={open}
        onClose={() => setOpen(false)}
        field={selectedField}
        value={selectedValue}
      />

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">
          Business Summary
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-3">

          <SummaryBox
            title="Total Assets"
            value={totalAssets}
            color="green"
          />

          <SummaryBox
            title="Total Liabilities"
            value={totalPayable}
            color="red"
          />

          <SummaryBox
            title="Net Worth"
            value={totalAssets - totalPayable}
            color={
              totalAssets >= totalPayable
                ? "blue"
                : "red"
            }
          />

        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid gap-6 lg:grid-cols-2">

        <FinanceCard
          title="Business Assets"
          total={totalAssets}
          color="green"
          onEdit={(field, value) => {
            setSelectedField(field);
            setSelectedValue(value);
            setOpen(true);
          }}
          items={[
            {
              label: "Raw Material",
              value: summary.rawMaterialValue,
            },
            {
              label: "Finished Stock",
              value: summary.finishedProductValue,
            },
            {
              label: "Customer Receivable",
              value: customerSummary.amountToReceive,
            },
            {
              label: "Supplier Advance",
              value: supplierSummary.supplierAdvance,
            },
            {
              label: "Cash In Hand",
              value: financialSummary.cashInHand,
              editable: true,
              field: "cashInHand",
            },
            {
              label: "Cash In Bank",
              value: financialSummary.cashInBank,
              editable: true,
              field: "cashInBank",
            },
          ]}
        />

        <FinanceCard
          title="Business Liabilities"
          total={totalPayable}
          color="red"
          onEdit={(field, value) => {
            setSelectedField(field);
            setSelectedValue(value);
            setOpen(true);
          }}
          items={[
            {
              label: "Supplier Due",
              value: supplierSummary.supplierDue,
            },
            {
              label: "Customer Credit",
              value: customerSummary.amountToPay,
            },
            {
              label: "Expense Due",
              value: financialSummary.expenseDue,
              editable: true,
              field: "expenseDue",
            },
            {
              label: "Loans",
              value: financialSummary.loans,
              editable: true,
              field: "loans",
            },
          ]}
        />

      </div>

      

    </div>
  );
}


function SummaryBox({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: "green" | "red" | "blue";
}) {
  const colorClass =
    color === "green"
      ? "text-green-600"
      : color === "red"
        ? "text-red-600"
        : "text-blue-600";

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <h3 className={`mt-2 text-3xl font-bold ${colorClass}`}>
        ₹
        {value.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </h3>
    </div>
  );
}