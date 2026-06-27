"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import CustomerPaymentForm from "./CustomerPaymentForm";


type CustomerAccountType = {
  customerId: string;
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

export default function CustomerAccountView({
  account,
  customerId,
}: {
  account: CustomerAccountType | null;
  customerId: string;
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

    const res = await fetch("/api/customer-ledger", {
      method: "POST",
      body: JSON.stringify({
        customerId,
        fromDate: from,
        toDate: to,
      }),
    });

    const json = await res.json();
    
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
      <h2 className="text-lg font-semibold">Customer  Account</h2>



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
            <CustomerPaymentForm
              customerId={customerId}
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

   <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white">

  <div className="overflow-x-auto">

    <table className="w-full text-sm">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <thead className="bg-zinc-200">

        <tr>

          <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
            Date
          </th>

          <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
            Type
          </th>

          <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
            Payment Method
          </th>

          <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
            Note
          </th>

          <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">
            Total
          </th>

          <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">
            Paid
          </th>

          <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">
            Due
          </th>

          <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">
            Balance
          </th>

        </tr>

      </thead>

      {/* ===================================================== */}
      {/* BODY */}
      {/* ===================================================== */}

      <tbody>

        {transactions.length > 0 ? (

          transactions.map((t, index) => (

            <tr
              key={t.id}
              className="
                border-b border-zinc-200
                transition-colors
                odd:bg-zinc-50
                even:bg-zinc-100
                hover:bg-blue-50
              "
            >

              {/* DATE */}

              <td className="px-4 py-3 whitespace-nowrap text-gray-700">

                {t.date
                  ? new Date(
                      t.date
                    ).toLocaleDateString()
                  : "-"}

              </td>

              {/* TYPE */}

              <td className="px-4 py-3 whitespace-nowrap">

                <span
                  className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${
                      t.type === "PURCHASE"
                        ? "bg-blue-100 text-blue-700"
                        : t.type === "RETURN"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-700"
                    }
                  `}
                >
                  {t.type}
                </span>

              </td>

              {/* PAYMENT METHOD */}

              <td className="px-4 py-3 whitespace-nowrap text-gray-700">

                {t.paymentMethod ? (
                  <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                    {t.paymentMethod}
                  </span>
                ) : (
                  "-"
                )}

              </td>

              {/* NOTE */}

              <td className="px-4 py-3 min-w-[220px] text-gray-600">

                {t.note || "-"}

              </td>

              {/* TOTAL */}

              <td className="px-4 py-3 text-right font-medium whitespace-nowrap">

                ₹ {t.totalAmount || 0}

              </td>

              {/* PAID */}

              <td className="px-4 py-3 text-right whitespace-nowrap">

                <span className="font-semibold text-green-600">
                  ₹ {t.paidAmount || 0}
                </span>

              </td>

              {/* DUE */}

              <td className="px-4 py-3 text-right whitespace-nowrap">

                <span className="font-semibold text-red-600">
                  ₹ {t.dueAmount || 0}
                </span>

              </td>

              {/* BALANCE */}

              <td className="px-4 py-3 text-right whitespace-nowrap">

                <span className="font-bold text-gray-800">
                  ₹ {t.balance || 0}
                </span>

              </td>

            </tr>
          ))

        ) : (

          <tr>

            <td
              colSpan={8}
              className="py-16 text-center"
            >

              <div className="flex flex-col items-center gap-2">

                <div className="h-14 w-14 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-xl">
                  ₹
                </div>

                <p className="font-medium text-gray-600">
                  No transactions found
                </p>

                <p className="text-sm text-gray-400">
                  Customer  transaction history will appear here
                </p>

              </div>

            </td>

          </tr>
        )}

      </tbody>

    </table>

  </div>

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