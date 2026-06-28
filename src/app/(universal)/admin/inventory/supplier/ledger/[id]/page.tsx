
import { getSupplierAccount } from "@/app/(universal)/action/inventorySupplier/getSupplierAccount";
import SupplierAccountView from "../../components/SupplierAccountView";
import { getSupplierLedgerByLimit } from "@/app/(universal)/action/inventoryItemSupplier/reports/getSupplierLedgerByLimit";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const account = await getSupplierAccount(id);

  const supplierTransactions =
    await getSupplierLedgerByLimit({
      supplierId: id,
    });

  return (
    <SupplierAccountView
      account={account}
      supplierId={id}
      initialTransactions={
        supplierTransactions.transactions
      }
    />
  );
}