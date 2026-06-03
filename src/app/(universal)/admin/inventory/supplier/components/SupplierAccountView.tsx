"use client";

type SupplierAccountType = {
  supplierId: string;

  totalPurchase?: number;
  totalReturn?: number;

  totalPaid?: number;      // ✅ NEW

  totalCredit?: number;    // optional (due added)
  totalDebit?: number;     // optional (returns/payments)

  cashPaid?: number;       // ✅ NEW
  upiPaid?: number;        // ✅ NEW
  cardPaid?: number;       // ✅ NEW

  balance?: number;
};


export default function SupplierAccountView({
  account,
}: {
  account: SupplierAccountType | null;
}) {
  if (!account) {
    return <p>No data found</p>;
  }

  console.log("account --------", account)

  const balance = account.balance || 0;

  return (
    <div className="p-4 border rounded-xl space-y-4">
      <h2 className="text-lg font-semibold">
        Supplier Account
      </h2>

      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-2 gap-4">
        <Card title="Total Purchase" value={account.totalPurchase} />
        <Card title="Total Return" value={account.totalReturn} />
        <Card title="Total Paid" value={account.totalPaid} />

        <div className="p-3 bg-gray-200 rounded col-span-2">
          <p className="text-sm">Balance (Due)</p>
          <p
            className={`text-2xl font-bold ${
              balance > 0
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            ₹ {balance}
          </p>
        </div>
      </div>

      {/* ================= PAYMENT BREAKDOWN ================= */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm text-gray-600">
          Payment Breakdown
        </h3>

        <div className="grid grid-cols-3 gap-3">
          <MiniCard title="Cash" value={account.cashPaid} />
          <MiniCard title="UPI" value={account.upiPaid} />
          <MiniCard title="Card" value={account.cardPaid} />
        </div>
      </div>
    </div>
  );
}

// ================= REUSABLE COMPONENTS =================

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