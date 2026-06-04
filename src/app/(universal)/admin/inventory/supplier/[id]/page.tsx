
import { getSupplierAccount } from "@/app/(universal)/action/inventorySupplier/getSupplierAccount";
import SupplierAccountView from "../components/SupplierAccountView";




export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const account = await getSupplierAccount(id);

  return (
    <SupplierAccountView
      account={account}
      supplierId={id}   // ✅ PASS HERE
    />
  );
}