"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SupplierPaymentForm from "./SupplierPaymentForm";

type SupplierAccountType = {
  supplierId: string;
  totalPurchase?: number;
  totalReturn?: number;
  totalPaid?: number;
  totalCredit?: number;
  totalDebit?: number;
  cashPaid?: number;
  upiPaid?: number;
  cardPaid?: number;
  balance?: number;
};

export default function SupplierAccountView({
  account,
  supplierId,
}: {
  account: SupplierAccountType | null;
  supplierId: string;
}) {
  const searchParams = useSearchParams();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  if (!account) return <p>No data found</p>;

  const balance = account.balance || 0;

  const fromDate = searchParams.get("from") || "";
  const toDate = searchParams.get("to") || "";

  // ✅ FETCH FUNCTION
  const fetchTransactions = async (from?: any, to?: any) => {
    setLoading(true);

    const res = await fetch("/api/supplier-ledger", {
      method: "POST",
      body: JSON.stringify({
        supplierId,
        fromDate: from,
        toDate: to,
      }),
    });

    const json = await res.json();
    console.log("res----------------", json?.data?.transactions)
    setTransactions(json?.data?.transactions || []);

    setLoading(false);
  };

  // ✅ ON FORM SUBMIT
  const handleFilter = (e: any) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const from = formData.get("from");
    const to = formData.get("to");

    fetchTransactions(from, to);
  };

  // ✅ INITIAL LOAD (optional)
  useEffect(() => {
    fetchTransactions(fromDate, toDate);
  }, []);

  return (
    <div className="p-4 border rounded-xl space-y-4">
      <h2 className="text-lg font-semibold">Supplier Account</h2>



      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-5 gap-4">
        <Card title="Total Purchase" value={account.totalPurchase} />
        <Card title="Total Return" value={account.totalReturn} />
        <Card title="Total Paid" value={account.totalPaid} />

        <div className="p-3 bg-gray-200 rounded col-span-2">
          <p className="text-sm">Balance (Due)</p>
          <p
            className={`text-2xl font-bold ${balance > 0 ? "text-red-600" : "text-green-600"
              }`}
          >
            ₹ {balance}
          </p>
        </div>
      </div>





      <div className="flex justify-between">
        <div>

          {/* ================= PAYMENT ================= */}
          <div className="grid grid-cols-3 gap-3">
            <MiniCard title="Cash" value={account.cashPaid} />
            <MiniCard title="UPI" value={account.upiPaid} />
            <MiniCard title="Card" value={account.cardPaid} />
          </div>
        </div>
        <div>

          {/* ================= DATE FILTER ================= */}
          <form
            onSubmit={handleFilter}
            className="flex flex-wrap items-end gap-3 border rounded-md px-3 py-2 bg-white shadow-sm"
          >
            {/* FROM */}
            <div className="flex flex-col text-xs">
              <label className="text-gray-400 mb-1">From</label>
              <input
                type="date"
                name="from"
                defaultValue={fromDate}
                className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* TO */}
            <div className="flex flex-col text-xs">
              <label className="text-gray-400 mb-1">To</label>
              <input
                type="date"
                name="to"
                defaultValue={toDate}
                className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="submit"
                className="bg-black text-white px-3 py-1.5 rounded text-sm hover:opacity-90 transition"
              >
                Apply
              </button>

              <button
                type="button"
                onClick={() => fetchTransactions("", "")}
                className="border px-3 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-100 transition"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        <div>

          {balance > 0 && (
            <SupplierPaymentForm
              supplierId={supplierId}
              onSuccess={() => {
                fetchTransactions(fromDate, toDate);
              }}
            />
          )}
        </div>


      </div>


      {/* ================= TRANSACTIONS ================= */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-gray-600">
          Transaction History
        </h3>

        {loading && <p>Loading...</p>}

        <div className="overflow-auto border rounded-lg">
          <table className="w-full text-sm">
           <thead className="bg-gray-100">
  <tr>
    <th className="p-2 text-left">Date</th>
    <th className="p-2 text-left">Type</th>
    <th className="p-2 text-left">Payment Method</th>
    <th className="p-2 text-left">Note</th>

    <th className="p-2 text-right">Total</th>
    <th className="p-2 text-right">Paid</th>
    <th className="p-2 text-right">Due</th>
    <th className="p-2 text-right">Balance</th>
  </tr>
</thead>

            <tbody>
              {transactions.length ? (
                transactions.map((t) => (
             <tr key={t.id} className="border-t">
  <td className="p-2 text-left">
    {t.date
      ? new Date(t.date).toLocaleDateString()
      : "-"}
  </td>

  <td className="p-2 text-left">
    {t.type}
  </td>

  <td className="p-2 text-left">
    {t.paymentMethod || "-"}
  </td>

  <td className="p-2 text-left">
    {t.note || "-"}
  </td>

  <td className="p-2 text-right">
    ₹ {t.totalAmount || 0}
  </td>

  <td className="p-2 text-right text-green-600">
    ₹ {t.paidAmount || 0}
  </td>

  <td className="p-2 text-right text-red-600">
    ₹ {t.dueAmount || 0}
  </td>

  <td className="p-2 text-right font-semibold">
    ₹ {t.balance || 0}
  </td>
</tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center p-4 text-gray-400">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



function Card({
  title,
  value,
}: {
  title: string;
  value?: number;
}) {
  return (
    <div className="p-3 bg-gray-100 rounded">
      <p className="text-sm">{title}</p>
      <p className="text-xl font-bold">
        ₹ {value || 0}
      </p>
    </div>
  );
}

function MiniCard({
  title,
  value,
}: {
  title: string;
  value?: number;
}) {
  return (
    <div className="p-2 bg-gray-50 rounded text-center">
      <p className="text-xs text-gray-500">
        {title}
      </p>
      <p className="font-semibold">
        ₹ {value || 0}
      </p>
    </div>
  );
}