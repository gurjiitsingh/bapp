
import { fetchSupplierById } from "@/app/(universal)/action/inventorySupplier/fetchSupplierById";
import SupplierEditForm from "../../components/SupplierEditForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({
  params,
}: Props) {
  const { id } =
    await params;

 const supplier =
  await fetchSupplierById(id);

if (!supplier) {
  return (
    <div className="p-6">
      Supplier not found
    </div>
  );
}

return (
  <SupplierEditForm
    supplier={supplier}
  />
);
}