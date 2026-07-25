 
import { getSupplierAccount } from "@/app/(universal)/action/inventorySupplier/getSupplierAccount";
import BalanceAdjustmentForm from "./AdjustForm";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const account = await getSupplierAccount(id);

  if (!account) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          Supplier not found.
        </div>
      </div>
    );
  }

  return (
    <BalanceAdjustmentForm
      supplierId={id}
      account={account}
    />
  );
}