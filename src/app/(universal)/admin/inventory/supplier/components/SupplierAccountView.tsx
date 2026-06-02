"use client";

type SupplierAccountType = {
  supplierId: string;
  totalPurchase?: number;
  totalReturn?: number;
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

  return (
    <div className="p-4 border rounded-xl space-y-4">
      <h2 className="text-lg font-semibold">
        Supplier Account
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-100 rounded">
          <p className="text-sm">
            Total Purchase
          </p>
          <p className="text-xl font-bold">
            ₹ {account.totalPurchase || 0}
          </p>
        </div>

        <div className="p-3 bg-gray-100 rounded">
          <p className="text-sm">
            Total Return
          </p>
          <p className="text-xl font-bold">
            ₹ {account.totalReturn || 0}
          </p>
        </div>

        <div className="p-3 bg-gray-200 rounded col-span-2">
          <p className="text-sm">
            Balance
          </p>

          <p
            className={`text-2xl font-bold ${
              (account.balance || 0) >= 0
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            ₹ {account.balance || 0}
          </p>
        </div>
      </div>
    </div>
  );
}