"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import CustomerPaymentForm from "./CustomerPaymentForm";



type CustomerAccountType = {
  customerId: string;
  wholeSaleCutomerName?: string;

  totalSales?: number;
  totalReturn?: number;
  totalPaid?: number;

  totalCredit?: number;
  totalDebit?: number;
  creditBalance?: number;
  cashPaid?: number;
  upiPaid?: number;
  cardPaid?: number;

  balance?: number;
};

import {
  CalendarDays,
  Filter,
  RotateCcw,
} from "lucide-react";

import { X, Wallet } from "lucide-react";

export default function CustomerAccountView({
  account,
  customerId,
  initialTransactions,
}: {
  account: CustomerAccountType | null;
  customerId: string;
  initialTransactions: any[];
}) {
  const searchParams = useSearchParams();

  const [transactions, setTransactions] =
    useState(initialTransactions);
  const [loading, setLoading] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  if (!account) return <p>No data found</p>;

  const balance = account.balance || 0;

  const fromDate = searchParams.get("from") || "";
  const toDate = searchParams.get("to") || "";

  // ✅ FETCH FUNCTION
  const fetchTransactions = async (
    from?: string,
    to?: string
  ) => {
    setLoading(true);

    try {
      const res = await fetch("/api/customer-ledger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          fromDate: from,
          toDate: to,
        }),
      });

      const json = await res.json();

      setTransactions(json.transactions || []);
    } catch (err) {
      console.error(err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ON FORM SUBMIT
  const handleFilter = (e: any) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const from = formData.get("from");
    const to = formData.get("to");

    fetchTransactions(
      (formData.get("from") as string) || undefined,
      (formData.get("to") as string) || undefined
    );
  };



  return (
    <div className=" space-y-4">
      <h2 className="text-lg font-semibold">
        {account.wholeSaleCutomerName || "Customer Account"}
      </h2>



      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-10 gap-4">


        <div className="flex justify-between gap-2 p-3 bg-gray-200 rounded col-span-2">
        <div>
  <p className="text-sm font-medium text-zinc-500">
    Total Sales
  </p>

  <p
    className={`text-2xl font-bold tracking-tight ${
      (account.totalSales ?? 0) > 0
        ? "text-blue-700"
        : "text-zinc-700"
    }`}
  >
    ₹ {(account.totalSales ?? 0).toLocaleString()}
  </p>
</div>
          <div>
            <div className="grid grid-cols-3 gap-3">
              <MiniCard title="Cash" value={account.cashPaid} />
              <MiniCard title="UPI" value={account.upiPaid} />
              <MiniCard title="Card" value={account.cardPaid} />
            </div>
          </div>



        </div>

        <Card title="Total Return" value={account.totalReturn} />
        <Card title="Total Paid" value={account.totalPaid} />
        <Card title="Credit" value={account.creditBalance} />
        <div className="p-3 flex justify-between  col-span-2 bg-gray-200 rounded-xl">
         <div className="flex flex-col">
  <p className="text-sm font-medium text-zinc-500">
    Balance (Due)
  </p>

  <p
    className={`text-3xl font-bold tracking-tight ${
      balance > 0
        ? "text-rose-600"      // Customer owes money
        : balance < 0
        ? "text-emerald-600"   // Customer has credit
        : "text-zinc-700"      // Zero balance
    }`}
  >
    ₹ {balance.toLocaleString()}
  </p>
</div>
          {balance > 0 && (
            <button
              onClick={() => setOpenPayment(true)}
              className="  w-fit h-10 px-2 rounded-lg bg-slate-500 text-white text-sm font-medium hover:bg-zinc-600 transition flex items-center justify-center gap-2"
            >
              <Wallet className="h-4 w-4" />
              Receive Payment
            </button>
          )}
        </div>

        <div className="col-span-3">

          {/* ================= DATE FILTER ================= */}


          <form
            onSubmit={handleFilter}
            className="flex flex-wrap lg:flex-nowrap items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 shadow-sm"
          >
            {/* From */}
            <div className="flex flex-col items-center gap-2 whitespace-nowrap">
              <div className="flex"> <CalendarDays className="h-4 w-4 text-zinc-500" />

                <span className="text-sm text-zinc-600">From</span>
              </div>
              <input
                type="date"
                name="from"
                defaultValue={fromDate}
                className="
        h-10 w-[155px]
        rounded-lg
        border border-zinc-300
        bg-white
        px-3
        text-sm
        focus:border-black
        focus:ring-2
        focus:ring-black/10
        outline-none
      "
              />
            </div>

            {/* To */}
            <div className="flex flex-col items-center gap-2 whitespace-nowrap">
              <div className="flex">
                <CalendarDays className="h-4 w-4 text-zinc-500" />
                <span className="text-sm text-zinc-600">To</span>
              </div>
              <input
                type="date"
                name="to"
                defaultValue={toDate}
                className="
        h-10 w-[155px]
        rounded-lg
        border border-zinc-300
        bg-white
        px-3
        text-sm
        focus:border-black
        focus:ring-2
        focus:ring-black/10
        outline-none
      "
              />
            </div>

            {/* Buttons */}
            <div className="flex h-[60px] items-end gap-2">

              <button
                type="submit"
                className="
        inline-flex h-10 items-center gap-2
        rounded-lg
        bg-slate-500
        px-4
        text-sm
        font-medium
        text-white
        hover:bg-zinc-500
        transition
      "
              >
                <Filter className="h-4 w-4" />
                Apply
              </button>

              <button
                type="button"
                onClick={() => fetchTransactions("", "")}
                className="
        inline-flex h-10 items-center gap-2
        rounded-lg
        border border-zinc-300
        bg-white
        px-4
        text-sm
        font-medium
        text-zinc-700
        hover:bg-zinc-100
        transition
      "
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </form>
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
                    Return
                  </th>

                  <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                    Credit
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
px-2.5 py-1 rounded-full text-xs font-medium
${
  t.type === "SALE"
    ? "bg-sky-50 text-sky-700"
    : t.type === "CUSTOMER_RETURN"
    ? "bg-rose-50 text-rose-700"
    : t.type === "PAYMENT"
    ? "bg-emerald-50 text-emerald-700"
    : "bg-zinc-100 text-zinc-700"
}
`}
                        >
                          {t.type}
                        </span>

                      </td>

                      {/* PAYMENT METHOD */}

                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">

                        {t.paymentMethod ? (
                        <span
  className={`
px-2 py-1 rounded-full text-xs font-medium
${
  t.paymentMethod === "CASH"
    ? "bg-emerald-50 text-emerald-700"
    : t.paymentMethod === "UPI"
    ? "bg-violet-50 text-violet-700"
    : t.paymentMethod === "CARD"
    ? "bg-sky-50 text-sky-700"
    : "bg-zinc-100 text-zinc-700"
}
`}
>
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

                     <td className="px-4 py-3 text-right whitespace-nowrap">
  <span className="font-semibold text-slate-700">
    ₹ {t.totalAmount || 0}
  </span>
</td>

                      {/* PAID */}

                   <td className="px-4 py-3 text-right whitespace-nowrap">
  <span className="font-semibold text-emerald-700">
    ₹ {t.paidAmount || 0}
  </span>
</td>



                      {/* DUE */}

                    <td className="px-4 py-3 text-right whitespace-nowrap">
  <span className="font-semibold text-amber-700">
    ₹ {t.dueAmount || 0}
  </span>
</td>
                   <td className="px-4 py-3 text-right whitespace-nowrap">
  <span className="font-semibold text-rose-700">
    ₹ {t.returnAmount || 0}
  </span>
</td>

                      {/* CREDIT */}

                     <td className="px-4 py-3 text-right whitespace-nowrap">
  {t.creditUsed > 0 && (
    <div className="text-xs text-indigo-500">
      Used: ₹ {t.creditUsed}
    </div>
  )}

  <div className="font-semibold text-indigo-700">
    ₹ {t.creditAmount || 0}
  </div>
</td>

                      {/* BALANCE */}

                     <td className="px-4 py-3 text-right whitespace-nowrap">
  <span
    className={`font-bold ${
      t.balance > 0
        ? "text-amber-700"
        : t.balance < 0
        ? "text-emerald-700"
        : "text-slate-700"
    }`}
  >
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

      {/* ================= PAYMENT MODAL ================= */}
{openPayment && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    onClick={() => setOpenPayment(false)}
  >
    <div
      className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setOpenPayment(false)}
        className="absolute right-4 top-4 rounded-full p-2 text-zinc-500 hover:bg-zinc-100"
      >
        <X className="h-5 w-5" />
      </button>

      <CustomerPaymentForm
        customerId={customerId}
        onSuccess={() => {
          setOpenPayment(false);
          fetchTransactions(fromDate, toDate);
        }}
      />
    </div>
  </div>
)}
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
    <div className="p-3 bg-gray-100 rounded-xl">
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