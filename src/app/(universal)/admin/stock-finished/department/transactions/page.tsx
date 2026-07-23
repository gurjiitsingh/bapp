import Link from "next/link";
import DepartmentStockTransactionTable from "./DepartmentStockTransactionTable";
import { getDepartments } from "@/app/(universal)/action/department/getDepartments";

export default async function Page() {
  const departments = await getDepartments();

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            Department Stock Transactions
          </h1>

          <p className="text-sm text-muted-foreground">
            Complete history of stock movements for departments.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/stock-finished/department/issue-stock/add"
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#00796b]"
          >
            Issue Stock
          </Link>

          <Link
            href="/admin/stock-finished/department/return-stock/add"
            className="inline-flex items-center justify-center rounded-xl bg-slate-400 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#00796b]"
          >
            Return Stock to Main Store
          </Link>

          <Link
            href="/admin/stock-finished/department/transactions"
            className="inline-flex items-center justify-center rounded-xl bg-[#00897b] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#00796b]"
          >
            Transactions
          </Link>

          <Link
            href="/admin/stock-finished/department/add"
            className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#00796b]"
          >
            + Add Department
          </Link>
        </div>
      </div>

      <DepartmentStockTransactionTable
        departments={departments}
      />
    </div>
  );
}