 
import { getSupplierAccount } from "@/app/(universal)/action/inventorySupplier/getSupplierAccount";
import OpeningBalanceForm from "./OpeningBalanceForm";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch supplier account
  const account = await getSupplierAccount(id);

  if (!account) {
    return <div>Supplier not found.</div>;
  }

  return (
    <OpeningBalanceForm
      supplierId={id}
      account={account}
    />
  );
}